Package.describe({
  name: 'twisterking:impersonate',
  summary: 'Impersonate users in Meteor',
  version: '0.5.0',
  git: 'https://github.com/gwendall/meteor-impersonate.git'
});

Package.onUse(function (api) {
  api.use([
    'ecmascript',
    'modules',
    'accounts-base@1.2.2',
    'reactive-var@1.0.6',
    'meteor-safereactivevar',
    'tracker'
  ], 'client');

  api.use([
    'random@1.0.5',
    'alanning:roles@1.2.14'
  ]);

  api.mainModule('client/lib.js', 'client');
  api.mainModule('server/lib.js', 'server');

  api.export('Impersonate');
});
