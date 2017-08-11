const log = require('simple-console-logger').getLogger('authorization');

exports.install = function () {
  log.info('initializing routes');
  F.on('controller', checkAccess);
};

exports.uninstall = function () {
  log.info('uninstalled');
};

function checkAccess(controller, name) {
  log.debug('checkAccess: controller ' + controller.name);
  if (controller.name === 'user') {
    log.debug('checking user role: ' + controller.req.user.role);
    if (controller.req.user.role !== 'admin') {
      log.info('rejecting non-admin request');
      controller.res.throw403('Permission denied');    
      controller.cancel();  
    }
  }
}



