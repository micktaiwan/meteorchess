/**
 * Created by mfaivremacon on 29/06/15.
 */

Accounts.onCreateUser(function(options, user) {

  // initialize default properties
  user.elo = 1500;

  // We still want the default hook's 'profile' behavior.
  if(options.profile)
    user.profile = options.profile;
  return user;
});

Meteor.methods({

  'addAdmin': function(id) {
    if(!this.userId) throw new Meteor.Error('403', 'Not allowed');
    return Meteor.users.update({_id: Meteor.userId()}, {$set: {admin: true}});
  },

  'usersAddComputer': function(name, id, eloString) {
    if(!this.userId) throw new Meteor.Error('403', 'Not allowed');
    var user = Meteor.users.findOne({$or: [{_id: id}, {username: name}]});
    if(user)
      throw new Meteor.Error('id or name already exists. id: ' + user._id + ', name: ' + user.username);
    elo = parseInt(eloString);
    if(!elo || elo === 0)
      throw new Meteor.Error('elo is not an integer: ' + eloString);
    if(elo < 200 || elo > 2500)
      throw new Meteor.Error('elo must be between 200 and 2500');

    Meteor.users.insert({
      _id: id,
      createdAt: new Date(),
      username: name,
      'profile': {'computer': true},
      elo: elo,
      eloProgression: [{"date": new Date(), "elo": elo}]
    });
  },

  'usersRemove': function(id) {
    if(!this.userId) throw new Meteor.Error('403', 'Not allowed');
    _.each(Games.find({$or: [{'white._id': id}, {'black._id': id}]}).fetch(), function(g) {
      doGameCancel(g._id, true);
    });
    return Meteor.users.remove({_id: id});
  }

});
