/**
 * Created by mfaivremacon on 22/06/15.
 */

Template.lobby.rendered = function() {

  var chess = new Chess();

  var board = new ChessBoard('board', {
    showNotation: false,
    //draggable: true,
    //dropOffBoard: 'snapback',
    //onDrop: onDrop,
    //onDragStart: onDragStart,
    position: 'start'
  });

  lozInit({chess: chess, board: board, autoplay: true, timePerMove: 1, noDB: true});

};

Template.lobby.helpers({});

Template.lobby.events({

  'click #createHumanGame': function(e, tpl) {
    Meteor.call('gameCreate', tpl.$('[name=ratedh]:checked').val(), tpl.$('[name=colorh]:checked').val());
  },

  'click #createComputerGame': function(e, tpl) {
    Meteor.call('gameCreateComputer', tpl.$('[name=rated]:checked').val(), tpl.$('[name=color]:checked').val(), function(err, id) {
      if(!err) Router.go('game', {id: id});
    });
  }

});
