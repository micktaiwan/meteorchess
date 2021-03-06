/**
 * Created by mfaivremacon on 22/06/15.
 */

Template.lobby.onCreated(function() {
  this.subscribe("all-games");
  this.subscribe('users');
});

Template.lobby.onRendered(function() {


  const chess = new Chess();

  const board = new ChessBoard('board', {
    showNotation: false,
    //draggable: true,
    //dropOffBoard: 'snapback',
    //onDrop: onDrop,
    //onDragStart: onDragStart,
    position: 'start'
  });

  lozInit({chess: chess, board: board, autoplay: true, timePerMove: 2, noDB: true, showPV: false});

  // Meteor.call('guestsClean');

  if(Session.get('cancelled')) {
    Session.set('cancelled', false);
    sAlert.info('Game has been cancelled by your opponent');
  }
  if(Session.get('user_do_not_exist')) {
    Session.set('user_do_not_exist', false);
    sAlert.info('No account for this name');
  }

});

Template.lobby.helpers({

  usersOnline: function() {
    return Meteor.users.find({"status.online": true}, {
      sort: {
        "status.online": -1,
        "status.lastLogin.date": -1
      }
    });
  },

  rankings: function() {
    return Meteor.users.find({'profile.guest': {$ne: true}, 'elo': {$ne: undefined}}, {sort: {elo: -1}});
  },

  guestname: function() {
    const u = Meteor.user();
    if(u.profile && u.profile.guest)
      return 'Guest name:<br/><b>' + Meteor.user().username + '</b><br/>Sign in to keep your games';
    return '<b>Online users</b>';
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
  },

  'click .cancel': function(e) {
    e.stopPropagation();
    const id = this._id;
    console.log('cancel', id);
    Meteor.call('gameCancel', id, function(err, rv) {
      if(err) sAlert.error(err.error);
    });
  }

});

Template.onlineUser.helpers({});

Template.ranking.helpers({});
