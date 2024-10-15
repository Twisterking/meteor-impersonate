Package.describe({
  name: "twisterking:impersonate",
  summary: "Impersonate users in Meteor",
  version: "0.4.0",
  git: "https://github.com/gwendall/meteor-impersonate.git",
});

Package.onUse(function (api, where) {

  api.use([
    "accounts-base",
    "reactive-var",
    "meteor-safereactivevar",
    "tracker"
  ], "client");

  api.use([
    "random",
    "alanning:roles",
  ]);

  api.addFiles([
    "server/lib.js"
  ], "server");

  api.addFiles([
    "client/js-cookie.js",
    "client/lib.js"
  ], "client");

  api.export("Impersonate");

});