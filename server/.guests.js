/**
 * Created by mfaivremacon on 26/06/15.
 */


// THIS FILE IS IGNORED

Meteor.methods({

  'guestsClean': function() {

    // remove old guests
    var before = new Date();
    before.setHours(before.getHours() - 24 * 3);
    Accounts.removeOldGuests(before);

    // remove not started games
    var arr = [];
    _.each(Games.find({status: 'open', 'user.type': 'guest'}).fetch(), function(g) {
      if(!Meteor.users.findOne(g.user._id)) {
        arr.push(g._id);
      }
    });
    if(arr.length > 0) Games.remove({_id: {$in: arr}});

    // cancelling games
    /*
        _.each(Games.find({status: 'playing', $or: [white]}).fetch(), function(g) {
          doGameCancel(g._id, true);
        });
    */

  }

});
