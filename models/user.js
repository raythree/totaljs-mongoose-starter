const mongoose = require('mongoose');
const db = require('./db');
const userSchema = require('../schemas/user');
const validationMessages = require('../schemas/validationMessages');

const log = require('simple-console-logger').getLogger('user-model');

const User = db.model('User', userSchema);

module.exports = {
  User: User, // exported mainly for testing, only the model API below is needed

  list: function (condition) {
    return User.find(condition)
  },

  save: function (obj, callback) {
    const user = new User(obj);
    return user.save(callback);
  },

  findById: function (id, callback) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const errMsg = 'Invalid Object ID';
      if (callback) return callback(errMsg)
      else throw(new Error(errMsg));
    }  
    return User.findById(id, callback); 
  },

  update: function (id, newDoc) {
    // modify does very limited validation, so do it first
    let check = new User(newDoc);
    let err = check.validateSync();
    if (err) return Promise.reject(err);
    
    let query = User.findOneAndUpdate({_id: id}, newDoc);
    return query.exec()
    .then(() => {
      return newDoc;
    });
  },

  remove: function (id) {
    log.info('DELETE user ' + id);
    return User.remove({_id: id}).exec();
  },

  count: function (condition) {
    return User.count(condition || {}).exec()
  },

  // Mostly for testing
  dropAll: function () {
    return db.collection('users').drop()
  }

};
