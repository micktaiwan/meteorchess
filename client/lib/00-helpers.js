/**
 * Created by mfaivremacon on 22/06/15.
 */
// user online status monitoring
Tracker.autorun(function() {
  try {
    if(Meteor.userId()) {
      UserStatus.startMonitor({
        threshold: 30000,
        interval: 1000,
        idleOnBlur: true
      });
    }
    else {
      UserStatus.stopMonitor();
    }
  } catch(err) {
    // console.log(err); // Seems that if(UserStatus.isMonitoring) does not work so catching every error
  }
});

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

Template.registerHelper('userName', function(user) {
  if(!user) user = this;
  return getUserName(user);
});

Template.registerHelper('onlineClass', function() {
  if(!this.status) return "offline";
  if(this.status.idle) return "idle";
  if(this.status.online) return "online";
  return "offline";
});

Template.registerHelper('guestSign', function() {
  if(this.profile && this.profile.guest) return '(guest)';
  return '';
});

