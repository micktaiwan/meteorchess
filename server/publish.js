/**
 * Created by mfaivremacon on 22/06/15.
 */

Meteor.publish('games-open', function() {
  return Games.find({}); // FIXME
});

Meteor.publish('game', function(id) {
  return Games.find({_id: id});
});

Meteor.publish('game-moves', function(id) {
  return Moves.find({game_id: id}, {sort: {ply: 1}});
});
