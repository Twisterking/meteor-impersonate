Impersonate = {
  _user: null, 
  _token: null,
};

var randString = function() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

var __xAZLkB47 = randString();
var __Uk6tCe73 = randString();

Object.defineProperty(Impersonate, "allowChange", {
  configurable: false,
  writable: false,
  enumerable: false,
  value: function(a, b, c) {
    var fc = Cookies.get(__xAZLkB47);
    if(!fc) return location.href = '/';
    if(b == false) {
      if(fc == c) return true;
      return false;
    } 
    return true;
  }
});

Impersonate._active = new SafeReactiveVar(false, Impersonate.allowChange);

// Object.freeze(Impersonate._active);

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
            if(Impersonate._byAdmin !== res.byAdmin) {
              // adminStatus changed!
              alert('Aus Sicherheitsgründen muss die Seite neu geladen werden! Bitte warten ...');
              return location.reload();
            }
          } else {
            Object.defineProperty(Impersonate, "_byAdmin", {
              writable: false,
              value: res.byAdmin
            });
          }
        }
        if (!Impersonate._user) {
          Impersonate._user = res.fromUser; // First impersonation
          Impersonate._token = res.token;
        }
        Cookies.set(__xAZLkB47, __Uk6tCe73, { expiresMinutes: 5 });

        Impersonate._active.set(true, __Uk6tCe73);
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
        Impersonate._active.set(false, __Uk6tCe73);
        if (!!(cb && cb.constructor && cb.apply)) cb.apply(this, [err, res.toUser]);
      }
    });
  }
});

// Reset data on logout
Tracker.autorun(function() {
  if (Meteor.userId()) return;
  Impersonate._active.set(false, __Uk6tCe73);
  Impersonate._user = null;
  Impersonate._token = null;
});