var board = null;

Template.game.rendered = function() {

  console.log(this.data);
  var orientation = this.data.white._id === Meteor.userId() ? 'white' : 'black';
  board = new ChessBoard('board', {
    draggable: true,
    position: 'start',
    pieceTheme: '/img/chesspieces/wikipedia/{piece}.png',
    orientation: orientation
  });

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

