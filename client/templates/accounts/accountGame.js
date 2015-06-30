var board;

Template.accountGame.rendered = function() {

  var cfg = {
    draggable: false,
    position: this.data.fen ? this.data.fen : 'start',
    pieceTheme: '/img/chesspieces/wikipedia/{piece}.png',
    orientation: 'white',
    showNotation: false
  };
  board = new ChessBoard('board-' + this.data._id, cfg);
  Session.set('game' + this.data._id + '-history', this.data.ply);

};

Template.accountGame.helpers({

  topName: function() {
    var belo = this.black.elo ? this.black.elo : 1500;
    return this.black.name + ' (' + belo + ')';
  },

  bottomName: function() {
    var welo = this.white.elo ? this.white.elo : 1500;
    return this.white.name + ' (' + welo + ')';
  }

});

Template.accountGame.events({});
