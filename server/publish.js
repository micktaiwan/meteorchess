/**
 * Created by mfaivremacon on 22/06/15.
 */

Meteor.publish('games-open', function() {
  return Games.find({});
});
