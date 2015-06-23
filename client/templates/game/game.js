var board, game, chess, game_id, statusEl, fenEl, pgnEl;

var mySide = function() {
  if(game.white._id === Meteor.userId()) return 'w';
  if(game.black._id === Meteor.userId()) return 'b';
  return 'none';
};

// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {
  var turn = chess.turn();

  if(turn !== mySide()) return false;

  if(chess.game_over() === true ||
    (turn === 'w' && piece.search(/^b/) !== -1) ||
    (turn === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
};

var onDrop = function(source, target) {
  // see if the move is legal
  var move = chess.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if(move === null) return 'snapback';
  updateStatus();
  Meteor.call('gameMove', game_id, move, chess.fen(), chess.pgn(), chess.game_over());
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
  }
  console.log(status);
  statusEl.html(status);

};


Template.game.rendered = function() {

  console.log(this.data);
  chess = new Chess();
  game_id = this.data._id;
  game = this.data;
  statusEl = $('#status');

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

  Deps.autorun(function() {
    (function() {
      Moves.find({game_id: game_id}).observeChanges({
        added: function(id, doc) {
          console.log('new move', doc);
          chess.move(doc.move);
          board.position(chess.fen());
          updateStatus();
        }
      });
    })();
  });

};

Template.game.helpers({

  topName: function() {
    return this.white._id === Meteor.userId() ? this.black.name : this.white.name;
  },

  bottomName: function() {
    return this.white._id === Meteor.userId() ? this.white.name : this.black.name;
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
  }

});

Template.game.events({

  'drop': function(e, tpl) {
    console.log('drop', e, tpl);
  }

});

