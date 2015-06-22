/**
 * Created by mfaivremacon on 22/06/15.
 */

Template.openGames.helpers({

  'openGames': function() {
    return Games.find({status: 'open'}, {sort: {createdAt: 1}});
  },

  'playingGames': function() {
    return Games.find({status: 'playing'}, {sort: {createdAt: 1}});
  }

});

Template.openGame.events({

  'click .accept': function() {
    var id = this._id;
    console.log('accept', id);
    Meteor.call('gameAccept', id, function(err, rv) {
      console.log('rv', rv, id, err);
      if(!err) Router.go('game', {id: id});
    });
  }

});


Template.playingGame.events({

  'click .open': function() {
    Router.go('game', {id: this._id});
  }

});
