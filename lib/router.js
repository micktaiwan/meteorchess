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
        Meteor.subscribe('game-moves', this.params.id)
      ]
    },
    action: function() {
      this.render();
    }
  });

  this.route('lobby', {
    path: '/',
    waitOn: function() {
      return [
        Meteor.subscribe('games-open')
      ]
    },
    action: function() {
      this.render();
    }
  });

});
