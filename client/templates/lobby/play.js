if(!window.Worker) {
  document.write('<p><b>DUDE, YOUR BROWSER IS TOO OLD TO PLAY CHESS!<p>TRY <a href="http://www.google.co.uk/chrome/">GOOGLE CHROME</a></a><p>');
  exit;
}

var args = lozGetURLArgs();
var board = null;
var chess = null;
var drag = true;
var engine = null;

lozData.page = 'play.htm';
lozData.idInfo = '#info';
lozData.idStats = '#stats';
lozData.autoplay = true;
lozData.showPV = false;

play = function() {
  if(!chess.game_over()) {
    $(lozData.idInfo).html('');
    var movetime = getMoveTime();
    engine.postMessage('position startpos moves ' + strMoves());
    engine.postMessage('go movetime ' + movetime);
  }
  else
    showEnd();
}

lozStandardRx = function(e) {

  //console.log(e.data);
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
    if(lozData.length > 4)
      lozData.bmPr = lozData.bm[4];
    else
      lozData.bmPr = '';

    lozUpdateBestMove();
    if(lozData.autoplay) play();
  }

  // option
  else if(lozData.tokens[0] == 'option') {
    ;
  }

  // info string debug
  else if(lozData.tokens[0] == 'info' && lozData.tokens[1] == 'string' && lozData.tokens[2] == 'debug') {
    lozData.info = '<b>' + lozData.message.replace(/info string debug /, '') + '</b>';
    lozUpdateInfo();
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
    lozData.board = lozGetStr('board', '');
    lozUpdateBoard();
  }

  //  everything else
  else {
    lozData.info = lozData.message;
    lozUpdateInfo();
  }

};

lozUpdateBestMove = function() {

  var move = {};

  move.from = lozData.bmFr;
  move.to = lozData.bmTo;

  chess.move(move);
  board.position(chess.fen());
  $('#moves').html(chess.pgn({newline_char: '<br>'}));

  if(!chess.game_over())
    drag = true;
  else
    showEnd();
}

function lozUpdatePV() {

  if(!lozData.showPV) return;

  if(lozData.units == 'cp')
    $(lozData.idInfo).prepend('depth ' + lozData.depth + ' (' + lozData.score + ') ' + lozData.pv + '<br>');
  else if(lozData.score > 0)
    $(lozData.idInfo).prepend('depth ' + lozData.depth + ' (<b>mate in ' + lozData.score + '</b>) ' + lozData.pv + '<br>');
  else
    $(lozData.idInfo).prepend('depth ' + lozData.depth + ' (<b>checkmate</b>) ' + lozData.pv + '<br>');

}

var onDrop = function(source, target, piece, newPos, oldPos, orientation) {

  if(target == 'offboard' || target == source)
    return;

  var move = chess.move({from: source, to: target, promotion: 'q'})
  if(!move)
    return 'snapback';

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
  else if(chess.in_draw())
    $(lozData.idInfo).html('Draw by 50 move rule');
  else if(chess.in_stalemate())
    $(lozData.idInfo).html('Draw by stalemate');
  else if(chess.in_threefold_repetition())
    $(lozData.idInfo).html('Draw by threefold repetition');
  else
    $(lozData.idInfo).html('Game over but not sure why!');
}

function getMoveTime() {

  var t = parseInt($('#permove').val());
  if(t <= 0 || !t) {
    t = 1;
    $('#permove').val(1);
  }
  return t * 1000;
}

playLozza = function() {

  //  init DOM
  if(args.t) {
    $('#permove').val(args.t);
    getMoveTime();
  }
  $('input').tooltip({delay: {"show": 1000, "hide": 100}});

  //  handlers
  $('#playw').click(function() {
    window.location = lozMakeURL({
      t: getMoveTime()
    });
    return false;
  });

  $('#playb').click(function() {

    window.location = lozMakeURL({
      t: getMoveTime(),
      c: 'b'
    });

    return false;
  });

  //}}}

  console.log('source', lozData.source);
  engine = new Worker(lozData.source);
  engine.onmessage = lozStandardRx;

  chess = new Chess();

  board = new ChessBoard('board', {
    showNotation: false,
    //draggable: true,
    //dropOffBoard: 'snapback',
    //onDrop: onDrop,
    //onDragStart: onDragStart,
    position: 'start'
  });

  engine.postMessage('uci')
  engine.postMessage('ucinewgame')
  engine.postMessage('debug off')

  // TODO
  if(args.c == 'b') {
    board.orientation('black');
    engine.postMessage('position startpos');
    engine.postMessage('go movetime ' + getMoveTime());
  }

  else {
    board.orientation('white');
  }

  if(lozData.autoplay) play();

};

