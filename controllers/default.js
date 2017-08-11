const fs = require('fs');
const Logger = require('simple-console-logger');
const handleError = require('../util/handleError');
const queryParams = require('../util/queryParams');

Logger.configure('./logconfig.json', fs);

const log = Logger.getLogger('default-controller');

//--------------------------------------------------------------------------
// Configure CORS for the /api route.
//--------------------------------------------------------------------------

F.cors('/api/*', ['get', 'post', 'put', 'delete'], true);


//--------------------------------------------------------------------------
// Export the version route and index static page
//--------------------------------------------------------------------------

exports.install = function () {
  log.info('initializing routes');
  F.route('/', viewIndex, true);
  F.route('/api/version', version);
};

function version() {
  var self = this;
  self.plain('Version: {0}'.format(F.config.version));
}

function viewIndex() {
  var self = this;
  self.redirect('/index.html', true);
}
