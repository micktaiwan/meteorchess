var board = null;
var chess = null;
var drag = true;
var engine = null;

lozStandardRx = function(e) {

  //console.log('Rx', e.data);
  lozData.message = e.data;
  lozData.message = lozData.message.trim();
  lozData.message = lozData.message.replace(/\s+/g, ' ');
  lozData.tokens = lozData.message.split(' ');

  // bestmove
  if(lozData.tokens[0] == 'bestmove') {
    lozUpdateStats();
    lozData.bm = lozGetStr('bestmove', '');
    lozData.bmFr = lozData.bm[0] + lozData.bm[1];
    lozData.bmTo = lozData.bm[2] + lozData.bm[3];
    if(lozData.bm.length > 4)
      lozData.bmPr = lozData.bm[4];
    else
      lozData.bmPr = '';

    lozUpdateBestMove();
    if(lozData.autoplay) {
      console.log('autoplaying');
      lozPlay();
    }
  }

  // option
  else if(lozData.tokens[0] == 'option') {
  }

  // info string debug
  else if(lozData.tokens[0] == 'info' && lozData.tokens[1] == 'string' && lozData.tokens[2] == 'debug') {
    lozData.debug = '<b>' + lozData.message.replace(/info string debug /, '') + '</b>';
    lozUpdateDebug();
  }

  // info string
  else if(lozData.tokens[0] == 'info' && lozData.tokens[1] == 'string') {
    lozData.info = lozData.message.replace(/info string /, '');
    lozUpdateInfo();
  }

  //  info
  else if(lozData.tokens[0] == 'info') {

    var pv = lozData.pv;
    var score = lozData.score;
    var units = lozData.units;
    var depth = lozData.depth;

    lozData.mvStr = lozGetStr('currmove', lozData.mvStr);
    lozData.mvNum = lozGetInt('currmovenumber', lozData.mvNum);
    lozData.depth = lozGetInt('depth', lozData.depth);
    lozData.selDepth = lozGetInt('seldepth', lozData.seldepth);
    lozData.units = lozGetStr('score', lozData.units);
    lozData.score = lozGetInt1('score', lozData.score);
    lozData.pv = lozGetStrToEnd('pv', lozData.pv);
    lozData.nodes = lozGetInt('nodes', lozData.nodes);
    lozData.time = lozGetInt('time', lozData.time);
    lozData.nps = lozGetInt('nps', lozData.nps);
    lozData.hashFull = lozGetInt('hashfull', lozData.hashFull);

    lozData.seconds = (lozData.time / 1000).round(2);
    lozData.meganodes = (lozData.nodes / 1000000).round(2);
    lozData.mnps = (lozData.nps / 1000000).round(2);
    lozData.kilonodes = (lozData.nodes / 1000).round(2);
    lozData.knps = (lozData.nps / 1000).round(2);

    lozUpdateStats();

    if(pv != lozData.pv || score != lozData.score || units != lozData.units || depth != lozData.depth)
      lozUpdatePV();
  }

  else if(lozData.tokens[0] == 'board') {
    console.log('new board from engine');
    lozData.board = lozGetStr('board', '');
    lozNewBoard();
  }
  else if(lozData.tokens[0] == 'id') {
  }
  else if(lozData.tokens[0] == 'uciok') {
  }

  //  everything else
  else {
    lozData.info = lozData.message;
    lozUpdateInfo();
  }

};

lozUpdateBestMove = function() {

  if(lozData.thinkOnly) {
    $(lozData.idInfo).addClass('ended');
    return;
  }

  var move = chess.move({
    from: lozData.bmFr,
    to: lozData.bmTo,
    promotion: lozData.bmPr
  });
  if(move === null) {
    sAlert.error('No move!');
    console.error('No move!', {
      from: lozData.bmFr,
      to: lozData.bmTo,
      promotion: lozData.bmPr
    });
    return;
  }
  if(!lozData.noDB) {
    lozData.onMove(move);
  }
  else {
    board.position(chess.fen());
    $('#moves').html(chess.pgn({newline_char: '<br>'}));
    if(chess.game_over() && lozData.noDB)
      showEnd();
  }
};

function lozUpdatePV() {

  if(!lozData.showPV) return;

  var d;
  if(lozData.selDepth)
    d = lozData.depth + '/' + lozData.selDepth;
  else
    d = lozData.depth;

  var score = lozData.score / 100;
  if(chess.turn() === 'b') score = -score;

  if(lozData.detailedPV) {
    if(lozData.units == 'cp')
      $(lozData.idInfo).prepend('depth ' + d + ' (' + lozData.score + ') ' + lozData.pv + '<br>');
    else if(lozData.score > 0)
      $(lozData.idInfo).prepend('depth ' + d + ' (<b>mate in ' + lozData.score + '</b>) ' + lozData.pv + '<br>');
    else
      $(lozData.idInfo).prepend('depth ' + d + ' (<b>checkmate</b>) ' + lozData.pv + '<br>');
  }
  else {
    if(lozData.units == 'cp')
      $(lozData.idInfo).html('depth ' + d + ', ' + ' white score: ' + score + '<br>');
    else if(lozData.score > 0)
      $(lozData.idInfo).html('depth ' + d + ' (<b>checkmated in ' + (lozData.score + 1) + '</b>) ' + '<br>');
    else
      $(lozData.idInfo).html('depth ' + d + ' (<b>mate in ' + (-lozData.score + 1) + '</b>) ' + '<br>');
  }
}

var onDrop = function(source, target, piece, newPos, oldPos, orientation) {

  if(target == 'offboard' || target == source)
    return;

  var move = chess.move({from: source, to: target, promotion: 'q'});
  if(!move) return 'snapback';

  if(move.flags == 'e' || move.flags == 'p' || move.flags == 'k' || move.flags == 'q')
    board.position(chess.fen());

  $('#moves').html(chess.pgn({newline_char: '<br>'}));

  drag = false;

  if(!chess.game_over()) {
    $(lozData.idInfo).html('');
    var movetime = getMoveTime();
    engine.postMessage('position startpos moves ' + strMoves());
    engine.postMessage('go movetime ' + movetime);
  }
  else
    showEnd();
};

var onDragStart = function(source, piece, position, orientation) {

  if((!drag || orientation === 'white' && piece.search(/^w/) === -1) || (orientation === 'black' && piece.search(/^b/) === -1)) {
    return false;
  }

  return true;
};

function strMoves() {

  var movesStr = '';
  var moves = chess.history({verbose: true});

  for(var i = 0; i < moves.length; i++) {
    if(i)
      movesStr += ' ';
    var move = moves[i];
    movesStr += move.from + move.to;
    if(move.flags == 'p')
      movesStr += move.promotion;
  }

  return movesStr;
}

function showEnd() {

  if(chess.in_checkmate())
    $(lozData.idInfo).html('Checkmate');
  else if(chess.insufficient_material())
    $(lozData.idInfo).html('Draw due to insufficient material');
  else if(chess.in_stalemate())
    $(lozData.idInfo).html('Draw by stalemate');
  else if(chess.in_threefold_repetition())
    $(lozData.idInfo).html('Draw by threefold repetition');
  else if(chess.in_draw())
    $(lozData.idInfo).html('Draw by 50 move rule');
  else
    $(lozData.idInfo).html('Game over but not sure why!');
}

function getMoveTime() {

  var t = parseInt($('#permove').val());
  if(t <= 0 || !t) {
    t = lozData.defaultThinkTime;
    $('#permove').val(1);
  }
  return t * 1000;
}

lozPlay = function() {
  console.error('play');
  if(!chess.game_over()) {
    $(lozData.idInfo).html('').removeClass('ended');
    $(lozData.idDebug).html('');

    var movetime = getMoveTime();

    // it is possible that we are already searching a move
    // so we cancel the current worker (Lozza can not respond to 'stop' while searching)
    if(engine) engine.terminate();
    engine = new Worker(lozData.source);
    engine.onmessage = lozStandardRx;
    engine.postMessage('uci');
    engine.postMessage('ucinewgame');
    engine.postMessage('debug off');
    engine.postMessage('position startpos moves ' + strMoves());
    engine.postMessage('go movetime ' + movetime);
  }
  else showEnd();
};

lozInit = function(options) {
  console.log('** lozInit **', 'autoplay:', options.autoplay, 'engine:', lozData.source);
  if(engine) {
    engine.terminate();
    engine = null;
  }

  chess = options.chess;
  board = options.board;
  lozData.autoplay = options.autoplay;
  lozData.defaultThinkTime = options.timePerMove || 1;
  lozData.noDB = options.noDB;
  lozData.onMove = options.onMove;
  lozData.showPV = options.showPV;
  lozData.thinkOnly = options.thinkOnly;
  if(lozData.autoplay) lozPlay();
};
