var board, game, statusEl, fenEl, pgnEl;

// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {
  if(game.game_over() === true ||
    (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
};

var onDrop = function(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if(move === null) return 'snapback';

  updateStatus();
};


// update the board position after the piece snap
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  board.position(game.fen());
};

var updateStatus = function() {
  var status = '';

  var moveColor = 'White';
  if(game.turn() === 'b') {
    moveColor = 'Black';
  }

  // checkmate?
  if(game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  }

  // draw?
  else if(game.in_draw() === true) {
    status = 'Game over, drawn position';
  }

  // game still on
  else {
    status = moveColor + ' to move';

    // check?
    if(game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
  }
  console.log(status);
  statusEl.html(status);
  fenEl.html(game.fen());
  pgnEl.html(game.pgn());
};


Template.game.rendered = function() {

  console.log(this.data);
  game = new Chess();
  statusEl = $('#status');
  fenEl = $('#fen');
  pgnEl = $('#pgn');

  var orientation = this.data.white._id === Meteor.userId() ? 'white' : 'black';
  var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: '/img/chesspieces/wikipedia/{piece}.png',
    orientation: orientation
  };
  board = new ChessBoard('board', cfg);
  updateStatus();


  $(window).resize(board.resize); // FIXME
};

Template.game.helpers({


  topName: function() {
    return this.white._id === Meteor.userId() ? this.black.name : this.white.name;
  },

  bottomName: function() {
    return this.white._id === Meteor.userId() ? this.white.name : this.black.name;
  }

});

Template.game.events({});

