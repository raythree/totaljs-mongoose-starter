const mongoose = require( 'mongoose' );
const Promise = require('bluebird');
const log = require('simple-console-logger').getLogger('database');

// replace promise library used by mongoose per:
// http://mongoosejs.com/docs/promises.html
mongoose.Promise = Promise;

var url;

if (process.env.MONGO_URL) {
  url = process.env.MONGO_URL;
  log.info('Using configured Mongo url: ' + url);
}
else {
  url = 'mongodb://localhost/testdb';
  log.warn("MONGO_URL not set, using default: " + url);
}
log.info('initializing database connection to: ' + url);

const connection = mongoose.createConnection(url, {
  useMongoClient: true,
  autoReconnect: true,
  reconnectTries: Number.MAX_SAFE_INTEGER
});

// Log database connection events
connection.on('connected', () => log.info('Mongoose connection open to ' + url));
connection.on('error', (err) =>  log.error('Mongoose connection error: ' + err));
connection.on('disconnected', () => log.error('Mongoose connection disconnected'));

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  connection.close(function () {
    log.info('Mongoose connection disconnected through app termination');
    //process.exit(0);
  });
});

module.exports = connection;


