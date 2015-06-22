/**
 * Created by mfaivremacon on 22/06/15.
 */

getUserName = function(user) {
  return user.username ? user.username : user.emails[0].address;
};
