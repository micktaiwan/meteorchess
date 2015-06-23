/**
 * Created by mfaivremacon on 23/06/15.
 */

Meteor.methods({

  'chatInsert': function(gameId, msg) {
    if(!this.userId) throw new Meteor.Error('user not logged');
    var name = getUserName(Meteor.users.findOne(this.userId));
    return Chats.insert({
      gameId: gameId,
      msg: msg,
      user: {_id: this.userId, name: name},
      createdAt: new Date()
    });
  }

});
