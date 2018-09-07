/**
 * Created by mfaivremacon on 22/06/15.
 */

Meteor.publish('all-games', function() {
  return Games.find({}); // FIXME
});

Meteor.publish('users', function() {
  return Meteor.users.find();
});

/*
 Meteor.publish('user', function(id) {
 return Meteor.users.find({_id: id});
 });
 */

Meteor.publish('user-games', function(id) {
  return Games.find({$or: [{'white._id': id}, {'black._id': id}]});
});

Meteor.publish('game', function(id) {
  return Games.find({_id: id});
});

Meteor.publish('game-moves', function(id) {
  return Moves.find({game_id: id}, {sort: {ply: 1}});
});

Meteor.publish('chats', function(id) {
  return Chats.find({gameId: id}, {limit: 100, sort: {createdAt: -1}});
});
