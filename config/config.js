var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'totemsuisse-web'
    },
    port: process.env.PORT || 3333,
    db: 'mongodb://localhost/totemsuisse-web-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'totemsuisse-web'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/totemsuisse-web-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'totemsuisse-web'
    },
    port: process.env.PORT || 8080,
    db: 'mongodb://localhost/totemsuisse-web-production'
  }
};

module.exports = config[env];
