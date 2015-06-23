/**
 * Created by mfaivremacon on 22/06/15.
 */

Meteor.publish('games-open', function() {
  return Games.find({}); // FIXME
});

Meteor.publish('game', function(id) {
  return Games.find({_id: id});
});
