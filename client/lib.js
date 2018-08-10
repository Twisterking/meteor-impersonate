Impersonate = {
  _user: null, 
  _token: null,
  _active: new ReactiveVar(false),
};

Impersonate.isActive = function(){
  return Impersonate._active.get();
};

Object.defineProperty(Impersonate, "do", {
  configurable: false,
  writable: false,
  enumerable: false,
  value: function(toUser, isUndo, cb) {
    var params = { toUser: toUser };
    if (Impersonate._user) {
      params.fromUser = Impersonate._user;
      params.token = Impersonate._token;
    }
    Meteor.call("impersonate", params, function(err, res) {
      if (err) {
        console.log("Could not impersonate.", err);
        if (!!(cb && cb.constructor && cb.apply)) cb.apply(this, [err, res]);
      }
      else {
        if(isUndo === false) {
          if(typeof Impersonate._byAdmin !== 'undefined') {
            // console.log(Impersonate._byAdmin, res);
            if(Impersonate._byAdmin !== res.byAdmin) {
              // adminStatus changed!
              alert('Aus Sicherheitsgründen muss die Seite neu geladen werden! Bitte warten ...');
              return location.reload();
            }
          } else {
            Object.defineProperty(Impersonate, "_byAdmin", {
              configurable: false,
              writable: false,
              enumerable: true,
              value: res.byAdmin
            });
          }
        }
        if (!Impersonate._user) {
          Impersonate._user = res.fromUser; // First impersonation
          Impersonate._token = res.token;
        }
        Impersonate._active.set(true);
        Meteor.connection.setUserId(res.toUser);
        if (!!(cb && cb.constructor && cb.apply)) cb.apply(this, [err, res.toUser]);
      }
    });
  }
});

Object.defineProperty(Impersonate, "undo", {
  configurable: false,
  writable: false,
  enumerable: false,
  value: function(cb) {
    Impersonate.do(Impersonate._user, true, function(err, res) {
      if (err) {
        if (!!(cb && cb.constructor && cb.apply)) cb.apply(this, [err, res]);
      }
      else {
        Impersonate._active.set(false);
        if (!!(cb && cb.constructor && cb.apply)) cb.apply(this, [err, res.toUser]);
      }
    });
  }
});

// Reset data on logout
Tracker.autorun(function() {
  if (Meteor.userId()) return;
  Impersonate._active.set(false);
  Impersonate._user = null;
  Impersonate._token = null;
});