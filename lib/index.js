var _ = require('lodash');
var samlHapi = require('./saml-hapi');

var internals = {};

exports.register = function(plugin, options, next) {
  plugin.auth.scheme('saml', internals.implementation);

  var settings = _.clone(options);
  var path = settings.path || "/SAML";

  // Add callback route
  plugin.route({
    // NOTE: needs to be '*'
    method: '*',
    path: path,
    config: {
      auth: false,
      handler: function(request, reply) {
        plugin.log(['debug', 'callback'], JSON.stringify(request.auth));

        // Run authentication
        samlHapi.authenticate(settings)(request, reply);
      }
    }
  });

  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};

internals.implementation = function(server, options) {
  var settings = _.clone(options);

  var scheme = {
    authenticate: samlHapi.authenticate(settings)
  };

  return scheme;
};