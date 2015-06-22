var board = null;

Template.game.rendered = function() {

  board = new ChessBoard('board', {
    draggable: true,
    position: 'start',
    pieceTheme: '/img/chesspieces/wikipedia/{piece}.png'
  });

};

Template.game.helpers({});

Template.game.events({});

