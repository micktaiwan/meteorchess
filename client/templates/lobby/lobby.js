/**
 * Created by mfaivremacon on 22/06/15.
 */

Template.lobby.rendered = function() {

};

Template.lobby.helpers({});

Template.lobby.events({

  'click #createGame': function(e, tpl) {
    console.log('gameCreate');
    Meteor.call('gameCreate', tpl.$('[name=rated]:checked').val());
  }

});
