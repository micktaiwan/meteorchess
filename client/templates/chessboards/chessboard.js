var board = null;

Template.chessboard.rendered = function() {

  board = new ChessBoard('board', {
    draggable: false,
    position: 'start'
  });
};

Template.chessboard.helpers({});

Template.chessboard.events({});

