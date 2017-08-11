process.env.MONGO_URL = 'mongodb://localhost/testdb';

var db = require('./models/db');
var options = {};

// options.tests = ['controllers', 'modules'];
// options.ip = '127.0.0.1';
// options.port = parseInt(process.argv[2]);
// options.config = { name: 'total.js' };
// options.https = { key: fs.readFileSync('keys/agent2-key.pem'), cert: fs.readFileSync('keys/agent2-cert.pem')};
// options.sleep = 2000;

require('total.js').http('test', options);

ON('test-end', function() {
  console.log('==================== TEST END ======================'); 
  MODEL('user').dropAll()
  .then(() => console.log('user collection dropped'))
  .catch((err) => console.log(err.message));
});
