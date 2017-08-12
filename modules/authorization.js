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
    if (!controller.req.user)  {
      log.info('rejecting unauthenticated request');
      return cancel(controller);
    }
    if (controller.req.user.role !== 'admin') {
      log.info('rejecting non-admin request');
      cancel(controller)
    }
  }
}

function cancel(controller) {
  controller.res.throw403('Permission denied');    
  controller.cancel();  
}



