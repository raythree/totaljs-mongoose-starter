const handleError = require('../util/handleError');
const validateId = require('../util/validateId');
const QueryFilter = require('../util/QueryFilter');

const log = require('simple-console-logger').getLogger('user-controller');

const model = F.model('user');

/**
 * NOTE: the restful API is the same as:
 * 
 *  F.route('/users/',      listUsers,  ['authorize']);
 *  F.route('/users/{id}/', getUser,    ['authorize'];
 *  F.route('/users/',      saveUser,   ['authorize', 'post']);
 *  F.route('/users/{id}/', saveUser,   ['authorize', 'put']);  // NOTE "id" will be set
 *  F.route('/users/{id}/', deleteUser, ['authorize', 'delete']); 
 */
exports.install = function () {
  log.info('initializing routes');
  F.restful('/api/users', ['cors', 'authorize'], listUsers, getUser, saveUser, deleteUser);
};

//-----------------------------------------------------------------------------------
// GET /users?(optinal query params)
//
// Query params may be like:
//
// filters={name: "joe"}&order=["name","ASC"]&range=[0,99]
//-----------------------------------------------------------------------------------
function listUsers() {
  const self = this;  

  let total;
  let query = new QueryFilter(self.req);
  let cond = params.getCondition();

  return query.count(model)
    .then((count) => {
      total = count;
      return query.exec(model, 'list');
    })
    .then((list) => {
      log.debug('returning list with', total, 'items');
      self.header('X-Total-Count', total);
      self.header('Access-Control-Expose-Headers', 'X-Total-Count');
      self.json({
        total,
        data: list
      });
    })
    .catch((err) => handleError(self, err))
}

//-----------------------------------------------------------------------------------
// POST /users
// PUT  /users/id
//-----------------------------------------------------------------------------------
function saveUser() {
  const self = this;

  let id;
  if (self.req.path.length == 3) {
    id = self.req.path[2];
  }

  if (id) {
    // PUT
    F.model('user').update(id, self.body)
      .then((newUser) => {
        if (newUser) {
          console.log('resolving ' + newUser.name);
          self.json(newUser);
        }  
        else self.res.send(404, 'User not found');
      })
      .catch((err) => handleError(self, err));
  }
  else {
    // PUT
    F.model('user').save(self.body)
      .then((newUser) => {
        self.json(newUser);
      })
      .catch((err) => handleError(self, err));    
  }    
}

//-----------------------------------------------------------------------------------
// GET users/id
//-----------------------------------------------------------------------------------
function getUser() {
  const self = this;
  const id = self.req.path[2];
  
  if (!validateId(id)) {
    return self.res.send(400, "Invalid ObjectID");
  }

  log.debug('getting user ' + id);
  return F.model('user').findById(id)
    .then((user) => {
      if (!user) self.res.send(404, 'User not found');
      else self.json(user);
    })  
    .catch((err) => {handleError(self, err);});  
}

//-----------------------------------------------------------------------------------
// DELETE u/sers/id
//-----------------------------------------------------------------------------------
function deleteUser() {  
  const self = this;
  const id = self.req.path[2];
  if (!validateId(id)) {
    return self.res.send(400, "Invalid ObjectID");
  }

  return F.model('user').remove(id)
    .then(() => self.json({success: true}))
    .catch((err) => handleError(self, err))
}

