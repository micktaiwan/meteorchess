var board, boardEl, game, chess, game_id, statusEl, fenEl, pgnEl;
var squareToHighlight, squareClass = 'square-55d63';
var rendered = false;
var onChangeHandle = null;

var scrollChat = function() {
  var el = $('.chats');
  el.animate({
    scrollTop: el[0].scrollHeight
  }, 100);
};


var mySide = function() {
  var id = Meteor.userId();
  if(game.white._id === id) return 'w';
  if(game.black._id === id) return 'b';
  return 'none';
};

// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {
  if(game.status === 'ended') return false;

  var turn = chess.turn();
  if(turn !== mySide()) return false;

  if(chess.game_over() === true ||
    (turn === 'w' && piece.search(/^b/) !== -1) ||
    (turn === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
};

var onDrop = function(source, target) {
  if (target === 'offboard' || target == source)
    return;

  // see if the move is legal
  var move = chess.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if(move === null) return 'snapback';
  updateStatus();
  var result = undefined;
  // checkmate?
  if(chess.in_checkmate() === true)
    result = 'checkmate';
  else if(chess.in_draw() === true)
    result = 'draw';

  Meteor.call('gameMove', game_id, move, chess.fen(), chess.pgn(), chess.game_over(), result);
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
  if(game.status === 'ended') return;

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
  return mySide() === move.color;
};

Template.game.onDestroyed(function() {
  if(onChangeHandle) onChangeHandle.stop();
  rendered = false;
});

Template.game.rendered = function() {

  console.log('game', this.data);
  chess = new Chess();
  game_id = this.data._id;
  game = this.data;
  statusEl = $('#status');
  boardEl = $('#board');

  if(Session.get('notif-' + game_id))
    this.$('.getNotif').prop('checked', true);
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

  onChangeHandle = Moves.find({game_id: game_id}).observeChanges({
    added: function(id, doc) {
      //console.log('new move', doc);
      // move
      chess.move(doc.move);
      board.position(chess.fen());
      updateStatus();
      // Highlight
      boardEl.find('.' + squareClass).removeClass('highlight-move');
      boardEl.find('.square-' + doc.move.from).addClass('highlight-move');
      squareToHighlight = doc.move.to;
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
  },
  hiddenIfEnded: function() {
    return this.status === 'ended' ? 'hidden' : '';
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

  'click .resign': function(e, tpl) {
    console.log('resiging');
    if(confirm('Resign this game ?')) {
      Meteor.call('gameResign', this._id);
    }
  }

})
;

