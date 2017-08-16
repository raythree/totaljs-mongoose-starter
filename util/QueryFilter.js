const log = require('simple-console-logger').getLogger('queryParams');


/**
 * Support filter, order by and range parameters like:
 *
 * range=[start, end]
 * filter={a: aVal, b: bVal}
 * sort=[name, ASC]
 * 
 * Usage in controller. There are 2 forms of QueryFilter.exec():
 * 
 *    // Pass model and method, let QueryFilter create and execute
 *    // it, applying all parameters. It requires the model and the method
 *    // to invoke on the model to create the mongoose query:
 * 
 *    let qf = new QueryFilter(self.req); // get params from request
 * 
 *    qf.exec(model, 'listUsers', optionalInitialCondition)
 *    .then(...)
 * 
 * Or:
 * 
 *    // Filter an (optional) initial query, then create
 *    // the query on the model and let the QueryFilter
 *    // execute it while appling any skip and limit parameters:
 * 
 *    let qf = new QueryFilter(self.req);
 *    let condition = qf.filterQuery(optionalInitialCondition); // apply filters
 *    let query = model.findSomething(condition);
 *    qf.exec(query) // execute and apply sort, skip, and limits
 *    .then(...)
 */

const defaultRange = [0, Number.MAX_SAFE_INTEGER];

function parseNumber(n, defaultValue) {
  try {
    if (typeof n === 'undefined') return defaultValue;
    const val = parseInt(n);
    if (isNaN(val)) return defaultValue;
    return val;
  }
  catch (err) {
    return defaultValue;
  }
}

function parseFilter(filter) {
  try {
    return JSON.parse(filter || '{}');
  }
  catch (err) {
    return {};
  }
}

function parseSort(req) {
  if (req.query.sort) {
    try {
      let obj = JSON.parse(req.query.sort);
      if (obj.length && obj.length === 2) {
        let [key, dir] = obj;
        if (!(dir === 'ASC' || dir === 'DESC')) {
          log.error('invalid sort order, must be ASC or DESC');
          dir = 'ASC'
        }
        return [key, dir];
      }
      else {
        log.error('invalid sort parameter:', req.query.sort);
        return null;
      }
    }
    catch(err) {

    }
  }
  return null;
}

function parseRange(req) {
  if (req.query.range) {
    try {
      let r = JSON.parse(req.query.range);
      if (r && r.length && r.length === 2) {
        let arr = [parseNumber(r[0], 0), parseNumber(r[1], Number.MAX_SAFE_INTEGER)];
        if (arr[0] > arr[1]) {
          log.error('invalid range');
          return defaultRange;
        }
        return arr;
      }
      else {
        log.error('Invalid range parameter, must be an array with 2 elements');
        return defaultRange;        
      }
    }
    catch (err) {
      log.error('Invalid range parameter, must be an array with 2 elements');
      return defaultRange;
    }
  }
  else return defaultRange;
}

//-----------------------------------------------------------------
//  Constructor
//-----------------------------------------------------------------
module.exports = function (req) { 
  let r = parseRange(req);
  this.skip = r[0];
  if (r[1] !== Number.MAX_SAFE_INTEGER) {
    this.limit = r[1] - r[0] + 1;
  }
  else {
    this.limit = r[1];
  }

  //[this.skip, this.limit] = parseRange(req);
  let sort = parseSort(req);

  let sortKey, sortDir;
  if (sort) {
    [sortKey, sortDir] = sort;
    this.sort = {key: sortKey, dir: sortDir};
  }
  else {
    this.sort = null;
  }
  this.filter = parseFilter(req.query.filter);    

  //-----------------------------------------------------------------
  //  methods
  //-----------------------------------------------------------------

  this.toString = () => {
    return JSON.stringify(this);
  };

  this.exec = (arg1, arg2, arg3) => {
    if (arg1 && !arg2 && !arg3) {
      // execute a query
      let q = this.sortAndPaginate(arg1);
      return q.exec();
    }
    else if (arg1 && arg2) { // arg3 optional
      let newQuery = this.filterQuery(arg3);
      let model = arg1, method = arg2;

      let query = model[method](newQuery);
      return this.exec(query);
    }
    else throw new Error('QueryFilter accepts 1, 2 or 3 arguments');
  }

  // add filters to existing conditon, if any
  this.filterQuery = (cond) => {
    let c = cond || {};
    if (Object.keys(this.filter).length === 0) {
      return c;
    }
    // create filter using explicit $and operation in case the
    // original query uses any of the same field names:
    // {$and: [{orig}, {filter1}, {filter2}, ...]}
    let conditions = []; 
    if (cond) conditions.push(c); // start with original query if given

    Object.keys(this.filter).forEach((fname) => {
      const newFilter = {};
      const fval = this.filter[fname];
      // case insensitive regex
      if (typeof fval === 'string') {
        newFilter[fname] = {$regex: fval, $options: 'i'};
      }
      else {
        newFilter[fname] = fval;
      }
      conditions.push(newFilter);
    });
    return {$and: conditions};
  };

  this.count = (model, cond) => {
    let c = this.filterQuery(cond);
    return model.count(c);
  };

  // apply sort, skip and limit params to query
  this.sortAndPaginate = (query) => {
    if (sort) {
      let s = {};
      s[this.sort.key] = (this.sort.dir === 'ASC' ? 1 : -1);
      query.sort(s);
    }  
    query.skip(this.skip);
    query.limit(this.limit);
    return query;
  };  
};



