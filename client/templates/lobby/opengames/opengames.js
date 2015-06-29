/**
 * Created by mfaivremacon on 22/06/15.
 */

Template.openGames.helpers({

  'openGames': function() {
    return Games.find({status: 'open'}, {sort: {createdAt: 1}});
  },

  'playingGames': function() {
    return Games.find({status: 'playing'}, {sort: {createdAt: 1}});
  },

  'endedGames': function() {
    return Games.find({status: 'ended'}, {sort: {lastMovedAt: -1, createdAt:-1}, limit: 10});
  }
});

Template.openGame.helpers({

  'hideIfMyGame': function() {
    return this.user._id === Meteor.userId() ? 'hidden' : '';
  },

  'myGameClass': function() {
    return (this.user._id === Meteor.userId()) ? 'mygame' : '';
  },

  'cancelHidden': function() {
    return this.user._id !== Meteor.userId() ? 'hidden' : '';
  }

});

Template.playingGame.helpers({

  'myGameClass': function() {
    return (this.white._id === Meteor.userId() || this.black._id === Meteor.userId()) ? 'mygame' : '';
  },

  'meToPlayClass': function() {
    if(this.status === 'ended') return '';
    return ((this.white._id === Meteor.userId() && this.to_play === 'w') ||
    (this.black._id === Meteor.userId() && this.to_play === 'b')) ? 'meToPlay' : '';
  },

  'cancelHidden': function() {
    if(this.status === 'ended') return 'hidden';
    if(this.ply > 5) return 'hidden';
    return (this.white._id !== Meteor.userId() && this.black._id !== Meteor.userId()) ? 'hidden' : '';
  }

});


Template.openGame.events({

  'click .accept': function(e) {
    e.stopPropagation();
    var id = this._id;
    console.log('accept', id);
    if(!Meteor.userId()) {
      $('#login-dropdown-list').find('[data-toggle=dropdown]').dropdown('toggle');
      return;
    }
    Meteor.call('gameAccept', id, function(err, rv) {
      if(!err) Router.go('game', {id: id});
    });
  }

});


Template.playingGame.events({

  'click .open': function() {
    Router.go('game', {id: this._id});
  }

});
