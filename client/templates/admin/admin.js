/**
 * Created by mfaivremacon on 01/07/15.
 */

Template.admin.helpers({

  users: function() {
    return Meteor.users.find({}, {sort: {elo: -1}});
  },

  chats: function() {
    return Chats.find({gameId: this._id}, {sort: {createdAt: 1}});
  }

});

Template.admin.events({

  'click .delete': function() {
    Meteor.call('usersRemove', this._id, function(err) {
      if(err) sAlert.error(err.error);
    });
  }

});

Template.addComputer.events({

  'submit': function(e, tpl) {
    e.preventDefault();
    Meteor.call('usersAddComputer', tpl.$('#name').val(), tpl.$('#id').val(), tpl.$('#elo').val(), function(err) {
      if(err) sAlert.error(err.error);
      else {
        tpl.$('#name').val('').focus();
        tpl.$('#id').val('');
      }
    });
  }

});
