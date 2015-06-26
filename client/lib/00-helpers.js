/**
 * Created by mfaivremacon on 22/06/15.
 */

Meteor.startup(function() {

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_EMAIL"
  });

  sAlert.config({
    effect: 'bouncyflip',
    position: 'top-left',
    timeout: 5000,
    html: false,
    onRouteClose: true,
    stack: true,
    offset: 0
  });

});
