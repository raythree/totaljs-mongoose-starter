const log = require('simple-console-logger').getLogger('queryParams');

//----------------------------------------------------------------------------------
// Parse pagination, sort, and limit parameters. Values may be:
//
// range=[start, end]
// filter={a: aVal, b: bVal} - keys can be quoted or unquoted, string values must be quoted
// sort=[name, ASC]
//----------------------------------------------------------------------------------

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

function parseIds(req) {
  if (req.query.ids) {
    try {
      vals = JSON.parse(req.query.ids);
      if (vals && vals.length) return vals;
      return null;
    }
    catch (err) {
      log.error('Invalid ids parameter, must be an array');
      return null;
    }
  }
  return null;
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
  this.ids = parseIds(req)

  //-----------------------------------------------------------------
  //  methods
  //-----------------------------------------------------------------

  this.toString = () => {
    return JSON.stringify(this);
  };

  // add filters to existing conditon, if any
  this.getCondition = (cond) => {
    let c = cond || {};
    Object.keys(this.filter).forEach((fname) => {
      const fval = this.filter[fname];
      // case insensitive regex
      if (typeof fval === 'string') {
        c[fname] = {$regex: fval, $options: 'i'};
      }
      else {
        c[fname] = fval;
      }
    });
    return c;
  };

  // apply sort, skip and limit params to query
  this.updateQuery = (query) => {
    if (!query) return;
    if (sort) {
      let s = {};
      s[this.sort.key] = (this.sort.dir === 'ASC' ? 1 : -1);
      query.sort(s);
    }  
    query.skip(this.skip);
    query.limit(this.limit);
  };  

  // apply sort/skip/limit and execute query
  this.exec = (query) => {
    this.updateQuery(query);
    return query.exec();
  };

};



