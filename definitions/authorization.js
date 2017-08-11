//--------------------------------------------------------------------------
// This module overrides the framework's F.onAuthorize method
//--------------------------------------------------------------------------

const fs = require('fs');
const jwt = require('jsonwebtoken');

const log = require('simple-console-logger').getLogger('authorize');

let serverKey;

//--------------------------------------------------------------------------
// Check that EISS_HOME is set and read the server's secret key. 
// Exit on failure.
//--------------------------------------------------------------------------
let keyFile = process.env.SECRET_KEY
if (!keyFile) {
  log.error('Exiting, SECRET_KEY environment variable must be set');
  process.exit(-1);
}

try {  
  log.info('Reading server key from ' + keyFile);
  let encoded = fs.readFileSync(keyFile, 'utf8');
  serverKey = Buffer.from(encoded, 'base64');
}
catch (err) {
  log.error('Exiting, unable to read server key:', err.toString());
  sys.exit(-1);
}

//-----------------------------------------------------------------
// Override framework's onAuthorize with this function which
// checks for authorization headers.
//-----------------------------------------------------------------

function authorization(req, res, flags, callback) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    log.info('rejecting request missing authorization header');
    return callback(false);  
  }

  verifyAuthHeader(authHeader)
    .then((userData) => {
      callback(true);
    })
    .catch((err) => {
      log.error('Authorization failed:', err.toString());
      callback(false);
    });
}

F.onAuthorize = authorization;

//-----------------------------------------------------------------
// Functions to verify JWT's
//-----------------------------------------------------------------

function verifyAuthHeader(header) {
  if (!header) {
    return Promise.reject(new Error('Missing Authorization header'));
  }
  
  let token;
  const parts = header.split(' ');
  if (parts.length === 1) token = parts[0];      // assume just token
  else if (parts.length === 2) token = parts[1]; // Bearer <token>
  else return Promise.reject(new Error('Invalid Authorization Header: expected "Bearer <token>"'));  
  return verifyToken(token)
};

function verifyToken(encoded) {
  return new Promise(function (resolve, reject) {
    jwt.verify(encoded, serverKey, function (err, token) {
      if (err) return reject('Invalid token');

      // Insert your own token parsing here. This format assumes that users have
      // a group and a role stored in the token like this:
      //
      // sub: administrators/adiin
      // role: superuser
      //
      const expires = new Date(token.exp * 1000);
      let user = '';
      let group = '';
      parts = token.sub.split('/');
      if (parts.length === 2) { group = parts[0]; user = parts[1]; }
      const role =token.scope || '';

      log.debug(`Authorization succeeded for ${user} ${group} ${role} exp: ${expires}`);
      resolve({ expires, user, group, role });
    });  
  });
}

function readTokenData(accessToken) {
  try {
  }
  catch (err) {
    log.error("Unable to read token");
    return null;
  }
}

