var board, boardEl, game, chess, game_id, statusEl, fenEl, pgnEl;
var squareToHighlight, squareClass = 'square-55d63';
var rendered = false;
var onChangeHandle = null;
var HISTORY_PLY = 'game-history-ply';
var drag = true;

var scrollChat = function() {
  var el = $('.chats');
  el.animate({
    scrollTop: el[0].scrollHeight
  }, 100);
};

var mySide = function(game) {
  if(!game) return null; // as used in helpers, game could be undefined at some time
  var id = Meteor.userId();
  if(game.white._id === id) return 'w';
  if(game.black._id === id) return 'b';
  return 'none';
};

var opponentIsComputer = function() {
  var s = mySide(game);
  return (s === 'w' && game.black.type === 'computer') || (s === 'b' && game.white.type === 'computer');
};

var isComputerToPlay = function(to_play) {
  if(game.status === 'ended') return false;
  return opponentIsComputer() && mySide(game) != to_play;
};

// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {
  if(!drag) return false;
  if(game.status === 'ended') return false;

  var turn = chess.turn();
  if(turn !== mySide(game)) return false;

  if(chess.game_over() === true ||
    (turn === 'w' && piece.search(/^b/) !== -1) ||
    (turn === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
};

var onMove = function(move) {
  console.log('onMove', move);
  var result = undefined;
  // checkmate?
  if(chess.in_checkmate() === true)
    result = 'checkmate';
  else if(chess.in_draw() === true)
    result = 'draw';

  Meteor.call('gameMove', game_id, move, chess.fen(), chess.pgn(), chess.game_over(), result, function(err, rv) {
    if(result) return; // game ended
    if(isComputerToPlay(chess.turn())) {
      lozPlay();
    }
  });
};

var onDrop = function(source, target, piece, newPos, oldPos, orientation) {
  if(target === 'offboard' || target == source)
    return;

  if(!piece) piece = 'q'; // FIXME: should let the user choose

  // see if the move is legal
  var move = chess.move({
    from: source,
    to: target,
    promotion: piece
  });
  // illegal move
  if(move === null) return 'snapback';

  updateStatus();
  onMove(move);

};

// update the board position after the piece snap
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  board.position(chess.fen());
};

var updateStatus = function() {
  var status = '';

  var moveColor = 'White';
  if(chess.turn() === 'b') {
    moveColor = 'Black';
  }

  // checkmate?
  if(chess.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  }
  // stalemate?
  else if(chess.in_stalemate() === true) {
    status = 'Stalemate. Game is drawn';
  }
  // draw?
  else if(chess.in_draw() === true) {
    status = 'Game is drawn';
  }

  // game still on
  else {
    status = moveColor + ' to move';

    // check?
    if(chess.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
    // threefold repetition?
    if(chess.in_threefold_repetition() === true) {
      status += ', threefold repetition';
    }

  }
  statusEl.html(status);

};

var removeGreySquares = function() {
  $('#board .square-55d63').css('background', '');
};

var greySquare = function(square) {
  var squareEl = $('#board .square-' + square);

  var background = '#a9a9a9';
  if(squareEl.hasClass('black-3c85d') === true) {
    background = '#696969';
  }

  squareEl.css('background', background);
};

var onMouseoverSquare = function(square, piece) {
  if(!drag || game.status === 'ended') return;

  // get list of possible moves for this square
  var moves = chess.moves({
    square: square,
    verbose: true
  });

  // exit if there are no moves available for this square
  if(moves.length === 0) return;

  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for(var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
};

var onMouseoutSquare = function(square, piece) {
  removeGreySquares();
};

var onMoveEnd = function() {
  boardEl.find('.square-' + squareToHighlight).addClass('highlight-move');
};

var mePlayed = function(move) {
  if(!move.color) {
    sAlert.error('Not a move');
    console.error('Not a move', move);
    return true; // no notification
  }
  return mySide(game) === move.color;
};

Template.game.onDestroyed(function() {
  if(onChangeHandle) onChangeHandle.stop();
  rendered = false;
  Meteor.call('gameRemoveSpectator', game_id, Meteor.userId());
});

Template.game.rendered = function() {

  console.log('game', this.data);
  chess = new Chess();
  game_id = this.data._id;
  game = this.data;
  statusEl = $('#status');
  boardEl = $('#board');

  // setting history cursor
  if(!Session.get(HISTORY_PLY))
    Session.set(HISTORY_PLY, game.ply);

  if(Session.get('notif-' + game_id))
    this.$('.getNotif').prop('checked', true);
  var orientation;
  if(mySide(game) !== 'b')
    orientation = 'white';
  else
    orientation = 'black';

  var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    onMoveEnd: onMoveEnd,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    pieceTheme: '/img/chesspieces/wikipedia/{piece}.png',
    orientation: orientation
  };
  board = new ChessBoard('board', cfg);
  updateStatus();

  onChangeHandle = Moves.find({game_id: game_id}).observeChanges({
    added: function(id, doc) {
      //console.log('new move', doc);
      // move
      chess.move(doc.move);
      //game = Games.findOne(game_id);
      var ply = Session.get(HISTORY_PLY);
      if(!rendered || ply === doc.ply - 1) {
        Session.set(HISTORY_PLY, doc.ply);
        board.position(chess.fen());
      }
      updateStatus();
      // Highlight
      boardEl.find('.' + squareClass).removeClass('highlight-move');
      boardEl.find('.square-' + doc.move.from).addClass('highlight-move');
      squareToHighlight = doc.move.to;
      // desktop notification
      if(rendered && Session.get('notif-' + game_id) && !mePlayed(doc.move)) {
        new Notification(game.white.name + " - " + game.black.name, {
          body: doc.move.san,
          icon: "http://learningchess.meteor.com/img/chesspieces/wikipedia/wN.png",
          tag: game_id
        }).onclick = function(e) {
          window.focus();
        };
      }
    }
  });
  rendered = true;
  scrollChat();
  lozInit({chess: chess, board: board, autoplay: false, timePerMove: 2, onMove: onMove});
  Session.set('game' + game._id + '-history', game.ply);
  Meteor.call('gameAddSpectator', game_id, Meteor.userId(), getUserName(Meteor.user()));
  // if playing against computer, starts the game
  if(!game.ply && isComputerToPlay(chess.turn())) {
    console.log('starting');
    lozPlay();
  }
};

Template.game.helpers({

  chats: function() {
    return Chats.find({gameId: this._id}, {sort: {createdAt: 1}});
  },

  topName: function() {
    var s = mySide(this);
    if(board) { // it's here just to be somewhere, and be reactive depending on user login and mySide changes
      board.orientation(s !== 'b' ? 'white' : 'black');
    }
    return (s === 'w' || s === 'none') ? this.black.name + ' (' + this.black.elo + ')' : this.white.name + ' (' + this.white.elo + ')';
  },

  bottomName: function() {
    var s = mySide(this);
    return (s === 'w' || s === 'none') ? this.white.name + ' (' + this.white.elo + ')' : this.black.name + ' (' + this.black.elo + ')';
  },

  moves: function() {
    return _.map(this.moves, function(m) {
      return m.san + " ";
    });
  },
  fen: function() {
    return this.fen;
  },
  pgn: function() {
    return this.pgn;
  },
  hiddenIfEnded: function() {
    return this.status === 'ended' ? 'hidden' : '';
  },
  resignClass: function() {
    if(this.status !== 'ended' && mySide(this) !== 'none') return '';
    return 'hidden';
  },

  'cancelHidden': function() {
    if(this.status === 'ended') return 'hidden';
    if(this.ply > 5) return 'hidden';
    return (this.white._id !== Meteor.userId() && this.black._id !== Meteor.userId()) ? 'hidden' : '';
  },

  'nextButtonDisabled': function() {
    var ply = Session.get(HISTORY_PLY);
    return ply >= this.ply ? 'disabled' : '';
  },

  'prevButtonDisabled': function() {
    var ply = Session.get(HISTORY_PLY);
    return ply <= 0 ? 'disabled' : '';
  },

  'hideIfLastMove': function() {
    var ply = Session.get(HISTORY_PLY);
    return ply >= this.ply ? 'hidden' : '';
  }

});

Template.game.events({

  'submit': function(e, tpl) {
    e.preventDefault();
    Meteor.call('chatInsert', this._id, tpl.$('#chatMsg').val(), function() {
      scrollChat();
    });
    tpl.$('#chatMsg').val('');

  },

  'click .getNotif': function(e, tpl) {
    console.log(e, tpl.$('.getNotif').is(":checked"));
    if(tpl.$('.getNotif').is(":checked")) {
      Notification.requestPermission(function(status) {
        console.log('notif', status);
      });
      Session.set('notif-' + this._id, true);
    }
    else Session.set('notif-' + this._id, false);
  },

  'click .resign': function() {
    console.log('resiging');
    if(confirm('Resign this game ?')) {
      Meteor.call('gameResign', this._id);
    }
  },

  'click .first': function(e, tpl) {
    Session.set(HISTORY_PLY, 0);
    board.position('start');
  },

  'click .last': function(e, tpl) {
    Session.set(HISTORY_PLY, this.ply);
    var fen = Moves.findOne({game_id: this._id, ply: this.ply}).fen;
    board.position(fen);
    drag = true;
  },

  'click .prev': function(e, tpl) {
    var ply = Session.get(HISTORY_PLY);
    if(ply === undefined) ply = this.ply;
    ply--;
    if(ply < 0) ply = 0;
    drag = (ply === this.ply);
    Session.set(HISTORY_PLY, ply);
    if(ply === 0) board.position('start');
    else {
      var m = Moves.findOne({game_id: this._id, ply: ply});
      if(!m) {
        sAlert.error("Can't find ply " + ply + ' of game ' + this._id);
        return;
      }
      var fen = m.fen;
      board.position(fen);
    }
  },

  'click .next': function() {
    var ply = Session.get(HISTORY_PLY);
    if(ply === undefined) ply = this.ply;
    ply++;
    if(ply > this.ply) ply = this.ply;
    drag = (ply === this.ply);
    Session.set(HISTORY_PLY, ply);
    var fen = Moves.findOne({game_id: this._id, ply: ply}).fen;
    board.position(fen);
  },

  // FIXME: duplicated from lobby.js, put this in a helper
  'click .cancel': function(e) {
    e.stopPropagation();
    var id = this._id;
    console.log('cancel', id);
    if(confirm('Cancel this game ?')) {
      Meteor.call('gameCancel', id, function(err, rv) {
        if(err) sAlert.error(err.error);
        else Router.go('lobby');
      });
    }
  }

});
