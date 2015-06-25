/**
 * Created by mfaivremacon on 22/06/15.
 */

Meteor.startup(function() {

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_EMAIL"
  });

});
