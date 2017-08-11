const log = require('simple-console-logger').getLogger('error-handler');
const validationMessages = require('../schemas/validationMessages');

//-------------------------------------------------------------------------------------
// check for well known Mongo errors, like duplicate keys
//-------------------------------------------------------------------------------------
function getError(controller, err) {
  if (err.code === 11000) {
    let what = 'item';
    if (controller.name === 'user') {
      what = 'An user with that name';
    }
    return what + ' already exists';
  }

  let messages = validationMessages(err);
  return messages || 'A system error ocurred';
}

module.exports = function (controller, err) {
  //-----------------------------------------------------------------------------------
  // Log stack trace and send 500
  //-----------------------------------------------------------------------------------
    log.error('error in controller ' + controller.name);
  	log.error(err, "\n---------------------[ STACK ]--------------------\n", err.stack);		
    controller.res.send(500, getError(controller, err));
  };
  

