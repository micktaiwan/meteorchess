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

  lozInit({chess: chess, board: board, autoplay: true, timePerMove: 2, noDB: true});

};

Template.lobby.helpers({
  usersOnline: function() {
    return Meteor.users.find({"status.online": true}, {
      sort: {
        "status.online": -1,
        "status.lastLogin.date": -1
      }
    });
  }

});

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

Template.onlineUser.helpers({

  onlineClass: function() {
    if(!this.status) return "offline";
    if(this.status.idle) return "idle";
    if(this.status.online) return "online";
    return "offline";
  },

  name: function() {
    return getUserName(this);
  }

});
