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

Object.defineProperty(Impersonate, "_active", {
  configurable: false,
  writable: false,
  enumerable: false,
  value: new SafeReactiveVar(false, Impersonate.allowChange)
});

Object.defineProperty(Impersonate, "isActive", {
  configurable: false,
  writable: false,
  enumerable: false,
  value: function() {
    return Impersonate._active.get();
  }
});

var lockedKeys = ['byAdmin', 'bySupplier', 'byBuyerAdmin', 'byStandard'];
lockedKeys.forEach(function(key) {
  Object.defineProperty(Impersonate, key, {
    configurable: false,
    writable: false,
    enumerable: false,
    value: function() {
      var active = Impersonate._active.get();
      if(key == 'byAdmin') {
        if(active === true && Impersonate._byAdmin === true) return true;
        return false;
      } 
      else if(key == 'byStandard') {
        if(active === true && Impersonate._byAdmin === true) return false;
        if(active === true && !Impersonate._byAdmin) return Impersonate._user;
        if(!active) return false;
        return true;
      }
      else {
        if(active === true && Impersonate._byAdmin === true) return false;
        if(active === true && !Impersonate._byAdmin && Impersonate['_' + key]) return Impersonate._user;
        return false;
      }
    }
  });
});

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
        console.error("Could not impersonate!", err);
        if (!!(cb && cb.constructor && cb.apply)) cb.apply(this, [err, res]);
      }
      else {
        if(isUndo === false) {
          lockedKeys.forEach(function(key) {
            if(typeof Impersonate['_' + key] !== 'undefined') {
              if(Impersonate['_' + key] !== res[key]) {
                alert('Aus Sicherheitsgründen muss die Seite neu geladen werden! Bitte warten ...');
                return location.reload();
              }
            } else {
              Object.defineProperty(Impersonate, ('_' + key), {
                writable: false,
                value: res[key]
              });
            }
          });
        }
        if (!Impersonate._user) {
          Impersonate._user = res.fromUser;
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