var board, boardEl, game, chess, game_id, statusEl, fenEl, pgnEl;
var squareToHighlight, squareClass = 'square-55d63';

var mySide = function() {
  var id = Meteor.userId();
  if(game.white._id === id) return 'w';
  if(game.black._id === id) return 'b';
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
  console.log('move', move);
  return mySide() === move.color;
};

Template.game.rendered = function() {

  console.log(this.data);
  chess = new Chess();
  game_id = this.data._id;
  game = this.data;
  statusEl = $('#status');
  boardEl = $('#board');

  var orientation = 'white';
  if(Meteor.userId() && this.data.black._id === Meteor.userId()) orientation = 'black';

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

  Deps.autorun(function() {
    (function() {
      var initializing = true;
      Moves.find({game_id: game_id}).observeChanges({
        added: function(id, doc) {
          //console.log('new move', doc);
          // Highlight
          boardEl.find('.' + squareClass).removeClass('highlight-move');
          boardEl.find('.square-' + doc.move.from).addClass('highlight-move');
          squareToHighlight = doc.move.to;
          // move
          chess.move(doc.move);
          board.position(chess.fen());
          updateStatus();
          if(!initializing && Session.get('notif-' + game._id) === true && !mePlayed(doc.move)) {
            var n = new Notification(game.white.name + " - " + game.black.name, {
              body: doc.move.san,
              icon: "http://learningchess.meteor.com/img/chesspieces/wikipedia/wN.png"
            });
            n.onclick = function(e) { window.focus(); this.cancel(); };
            n.show();
          }
        }
      });
      initializing = false;
    })();
  });

};

Template.game.helpers({

  chats: function() {
    return Chats.find({gameId: this._id}, {sort: {createdAt: 1}});
  },

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
  },
  'submit': function(e, tpl) {
    e.preventDefault();
    console.log(tpl.$('#chatMsg').val());
    Meteor.call('chatInsert', this._id, tpl.$('#chatMsg').val());
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
  }

})
;

