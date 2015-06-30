/**
 * Created by mfaivremacon on 30/06/15.
 */
Template.layout.events({

  'click .js-logout': function() {
    Meteor.logout();
    Router.go('lobby');
  }

});
