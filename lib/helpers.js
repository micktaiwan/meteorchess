/**
 * Created by mfaivremacon on 22/06/15.
 */

getUserName = function(user) {
  if(!user) return '';
  var email = user.emails ? user.emails[0].address : 'guest';
  return user.username ? user.username : email;
};


Meteor.startup(function() {

  if(Meteor.isServer) {
    AccountsGuest.name = true;
    AccountsGuest.forced = false;
  }

});
