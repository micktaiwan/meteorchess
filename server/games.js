/**
 * Created by mfaivremacon on 22/06/15.
 */

Meteor.methods({

  'gameCreate': function(rated) {
    if(!this.userId) throw new Meteor.Error('user not logged');
    var name = getUserName(Meteor.users.findOne(this.userId));
    return Games.insert({
      user: {_id: this.userId, name: name},
      white: {_id: this.userId, name: name},
      status: 'open',
      rated: rated === "true",
      createdAt: new Date()
    });
  },

  'gameAccept': function(id) {
    console.log('accepting', id);
    if(!this.userId) throw new Meteor.Error('user not logged');
    var name = getUserName(Meteor.users.findOne(this.userId));
    return Games.update({_id: id}, {
      $set: {
        status: 'playing',
        black: {_id: this.userId, name: name},
        startedAt: new Date()
      }
    });
  }

});
