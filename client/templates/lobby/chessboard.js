var board = null;
var game = new Chess();

Template.chessboard.rendered = function() {

  board = new ChessBoard('board', {
    draggable: false,
    position: 'start'
  });

  var sortMoves = function(moves) {
    return moves.sort(function(a,b) {
      if(a.includes('x')) return -1;
      if(a.includes('+')) return -1;
      if(a.includes('#')) return -1;
      if(a.includes('K')) return 1;
      if(b.includes('x')) return 1;
      if(b.includes('+')) return 1;
      if(b.includes('#')) return 1;
      if(b.includes('K')) return -1;
      return 0;
    });
  };

  var makeRandomMove = function() {
    var possibleMoves = sortMoves(game.moves());
    console.log(possibleMoves);

    // exit if the game is over
    if (game.game_over() === true ||
      game.in_draw() === true ||
      possibleMoves.length === 0) return;

    var upTo = possibleMoves.length > 3 ? 3 : possibleMoves.length;
    var randomIndex = Math.floor(Math.random() * upTo);

    game.move(possibleMoves[randomIndex]);
    board.position(game.fen());

    window.setTimeout(makeRandomMove, 500);
  };

  window.setTimeout(makeRandomMove, 500);

};

Template.chessboard.helpers({});

Template.chessboard.events({});

