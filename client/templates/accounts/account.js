/**
 * Created by mfaivremacon on 01/07/15.
 */

Template.account.helpers({

  'games': function() {
    return Games.find({}, {sort: {lastMovedAt: -1}});
  },

  'gamesCount': function() {
    return Games.find().count();
  }

});
