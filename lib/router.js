/**
 * Created by mfaivremacon on 22/06/15.
 */

Router.configure({
  layoutTemplate: 'layout',
  //notFoundTemplate: 'notfound',
  //loadingTemplate: 'appLoading'

  // wait on the following subscriptions before rendering the page to ensure
  // the data it's expecting is present
  /*
   waitOn: function() {
   return [
   Meteor.subscribe('open-games')
   ];
   }
   */

});

Router.map(function() {

  this.route('game', {
    path: '/game/:id',
    data: function() {
      return Games.findOne(this.params.id);
    },
    waitOn: function() {
      return [
        Meteor.subscribe('game', this.params.id),
        Meteor.subscribe('game-moves', this.params.id),
        Meteor.subscribe('chats', this.params.id)
      ]
    },
    onBeforeAction: function() {
      if(!Games.findOne(this.params.id)) { // cancelled
        Session.set('cancelled', true);
        Router.go('lobby');
      }
      else this.next();
    },
    action: function() {
      this.render();
    }
  });

  this.route('lobby', {
    path: '/',
    waitOn: function() {
      return [
        Meteor.subscribe('users'),
        Meteor.subscribe('games')
      ]
    },
    action: function() {
      this.render();
    }
  });

  this.route('account', {
    path: '/account/:name',
    data: function() {
      return Meteor.users.findOne({$or: [{username: this.params.name}, {email: this.params.name}]});
    },
    waitOn: function() {
      return [Meteor.subscribe('users')]
    },
    onBeforeAction: function() {
      var user = Meteor.users.findOne({$or: [{username: this.params.name}, {email: this.params.name}]});
      if(!user) {
        Session.set('user_do_not_exist', true);
        Router.go('lobby');
        return;
      }
      Session.set('user_do_not_exist', null);
      Session.set('account-id', user._id);
      Meteor.subscribe('user-games', user._id);
      this.next();
    },
    action: function() {
      this.render();
    }
  });

  this.route('adminSetUp', {
    path: '/admin/setup',
    waitOn: function() {
      return [Meteor.subscribe('users')]
    },
    onBeforeAction: function() {
      var user = Meteor.users.findOne({admin: true});
      console.log('user', user);
      if(user || !Meteor.userId()) Router.go('lobby');
      Meteor.call('addAdmin', Meteor.userId(), function() {
        Router.go('admin');
      });
      this.next();
    }
  });

  this.route('admin', {
    path: '/admin',
    waitOn: function() {
      return [Meteor.subscribe('users')]
    },
    onBeforeAction: function() {
      var user = Meteor.userId();
      if(!user) Router.go('lobby');
      this.next();
    },
    action: function() {
      this.render();
    }
  });

});
