const QF = require('../util/QueryFilter');

function req(q) { return {query: q}; }

// simulate a query object and capture values called with
function QueryObject() {
  this.skipVal = -1;
  this.limitVal = -1;
  this.sortKey = null;
  this.sortDir = 0;

  this.sort = function(obj) {
    Object.keys(obj).forEach((k) => {
      this.sortKey = k;
      this.sortDir = obj[k];
    });
  }

  this.skip = function (s) {
    this.skipVal = s;
  };
  this.limit = function (l) {
    this.limitVal = l;
  };
}

TEST('test empty query params', () => {
  const params = new QF(req({}));
  OK(params.skip === 0);
  OK(params.limit === Number.MAX_SAFE_INTEGER);
  OK(Object.keys(params.filter).length === 0);
  OK(params.sort === null);
});

TEST('test range', () => {
  const params = new QF(req({range: "[0, 99]"}));
  OK(params.skip === 0);
  OK(params.limit === 100);
});

TEST('test invalid range', () => {
  const params = new QF(req({range: "[99, 0]"}));
  OK(params.skip === 0);
  OK(params.limit === Number.MAX_SAFE_INTEGER);
});

TEST('test filter', () => {
  let params = new QF(req({filter: '{"name.first":"bill", "age": 55}'}));
  OK(params.filter['name.first'] === 'bill');
  OK(params.filter.age === 55);
});

TEST('test valid sorts', () => {
  let params = new QF(req({sort: '["name", "DESC"]'}));
  OK(params.sort.key === 'name');
  OK(params.sort.dir === 'DESC');
  
  params = new QF(req({sort: '["age", "ASC"]'}));
  OK(params.sort.key === 'age');
  OK(params.sort.dir === 'ASC');
});

TEST('test invalid sort', () => {
  let params = new QF(req({sort: 'name", DESC"]'}));
  OK(params.sort === null);
});

TEST('condition, sort, filter, paginate', () => {
  const qobj = {
    filter: '{"a":"aval","b":"bval","c":3}',
    range: '[0,99]',
    sort: '["name","ASC"]'    
  };
  const qf = new QF(req(qobj));
  
  // creates new cond
  let cond = qf.filterQuery();
  OK(cond.$and.length === 3);
  OK(cond.$and[0].a.$regex === 'aval');
  OK(cond.$and[1].b.$regex === 'bval');
  OK(cond.$and[2].c  === 3);
  
  // test with initial condition
  cond = qf.filterQuery({existing: 13});
  OK(cond.$and.length === 4);
  OK(cond.$and[0].existing === 13);
  OK(cond.$and[1].a.$regex === 'aval');
  OK(cond.$and[2].b.$regex === 'bval');
  OK(cond.$and[3].c  === 3);
});


TEST('default pagination', () => {
  const qobj = {};
  const qf = new QF(req(qobj));
  
  let query = new QueryObject();
  query = qf.sortAndPaginate(query);
  OK(query.sortKey === null);
  OK(query.sortDir === 0);
  OK(query.skipVal === 0);
  OK(query.limitVal === Number.MAX_SAFE_INTEGER);
});

TEST('specified pagination', () => {
  const qobj = {
    range: '[100, 199]',
    sort: '["name","ASC"]'    
  };
  const qf = new QF(req(qobj));
  let query = new QueryObject();
  query = qf.sortAndPaginate(query);
  OK(query.sortKey === 'name');
  OK(query.sortDir === 1);
  OK(query.skipVal === 100);
  OK(query.limitVal === 100);
});









