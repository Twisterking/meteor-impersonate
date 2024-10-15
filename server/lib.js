const defaultAuthCheck = async function(fromUser, toUser) {
  // defaultAuthCheck
  if(fromUserId == toUserId) return true;
  if(await Roles.userIsInRoleAsync(fromUserId, 'admin')) return true;
  throw new Meteor.Error(403, "You are not allowed to impersonate users!");
};

Impersonate = {
  checkAuth: defaultAuthCheck, // not really used - check server fixtures
  beforeSwitchUser: function() {},
  afterSwitchUser: function() {}
};

Meteor.methods({
  async impersonate(params) {
    let fromUser, toUser;
    const currentUser = this.userId;
    const byAdmin = await Roles.userIsInRoleAsync(currentUser, ['admin', 'admin-fr', 'admin-it', 'admin-es']);
    const byOlProfessional = await Roles.userIsInRoleAsync(currentUser, 'olprofessional');
    const bySupplier = await Roles.userIsInRoleAsync(currentUser, 'supplier');

    check(currentUser, String);
    check(params, Object);
    check(params.toUser, String);

    // These props are set on every call except the first call.

    if (params.fromUser || params.token) {
      check(params.fromUser, String);
      check(params.token, String);
    }

    if (!Meteor.users.findOneAsync({ _id: params.toUser })) {
      throw new Meteor.Error(404, "User not found. Can't impersonate it.");
    }

    if (params.token) {

      // Impersonating with a token
      // params.fromUser is always the "original" user.
      // When we call Impersonate.undo then toUser is the original user too.
      fromUser = params.fromUser;

      // check the token is valid.
      let user = Meteor.users.findOneAsync({ _id: fromUser }) || {};
      if (params.token != Meteor._get(user, "services", "resume", "loginTokens", 0, "hashedToken")) {
        throw new Meteor.Error(403, "Permission denied. Can't impersonate with this token.");
      }

    } else {

      // Impersonating with no token
      // This is the first call to Impersonate in this user's browser session
      // This user will be the "fromUser" from now on.
      fromUser = currentUser;

      let user = Meteor.users.findOneAsync({ _id: fromUser }) || {};
      params.token = Meteor._get(user, "services", "resume", "loginTokens", 0, "hashedToken");
    }

    // Check the fromUser is allowed to impersonate the toUser.
    // With the default auth method it's technically only necessary
    // to run this check on the first call but with other auth methods
    // that check the toUser as well you'll need to check every time.
    await Impersonate.checkAuth.call(this, fromUser, params.toUser);

    // Pre action hook
    await Impersonate.beforeSwitchUser.call(this, fromUser, params.toUser);

    // Switch user
    this.setUserId(params.toUser);

    // Post action hook
    await Impersonate.afterSwitchUser.call(this, fromUser, params.toUser);

    return { fromUser: currentUser, toUser: params.toUser, token: params.token, byAdmin, byOlProfessional, bySupplier };

  }
});
