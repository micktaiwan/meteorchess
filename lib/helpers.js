/**
 * Created by mfaivremacon on 22/06/15.
 */

getUserName = function(user) {
  if(!user) return '';
  var email = user.emails ? user.emails[0].address : 'guest';
  return user.username ? user.username : email;
};

Elo = function() {

  function factor(rating) {
    if(rating <= 2100) {
      return 32;
    }
    else if(2100 < rating && rating <= 2400) {
      return 24;
    }
    else if(2400 < rating) {
      return 16;
    }
  }

  function getRatingDelta(myRating, opponentRating, myGameResult) {
    if([0, 0.5, 1].indexOf(myGameResult) === -1) {
      return null;
    }
    var myChanceToWin = 1 / ( 1 + Math.pow(10, (opponentRating - myRating) / 400));
    return Math.round(factor(myRating) * (myGameResult - myChanceToWin));
  }

  function getNewRating(myRating, opponentRating, myGameResult) {
    return myRating + getRatingDelta(myRating, opponentRating, myGameResult);
  }

  return {
    getRatingDelta: getRatingDelta,
    getNewRating: getNewRating
  };
}
;

Meteor.startup(function() {

  if(Meteor.isServer) {
    AccountsGuest.name = true;
    AccountsGuest.forced = false;
  }

});
