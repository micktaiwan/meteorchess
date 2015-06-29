/**
 * Created by mfaivremacon on 29/06/15.
 */

Accounts.onCreateUser(function(options, user) {

  // initialize default properties
  user.elo = 1500;

  // We still want the default hook's 'profile' behavior.
  if (options.profile)
    user.profile = options.profile;
  return user;
});
