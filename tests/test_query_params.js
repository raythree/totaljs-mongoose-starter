const QP = require('../util/QueryParams');

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
  const params = new QP(req({}));
  OK(params.skip === 0);
  OK(params.limit === Number.MAX_SAFE_INTEGER);
  OK(Object.keys(params.filter).length === 0);
  OK(params.sort === null);
  OK(params.ids === null);
});

TEST('test range', () => {
  const params = new QP(req({range: "[0, 99]"}));
  OK(params.skip === 0);
  OK(params.limit === 100);
});

TEST('test invalid range', () => {
  const params = new QP(req({range: "[99, 0]"}));
  OK(params.skip === 0);
  OK(params.limit === Number.MAX_SAFE_INTEGER);
});

TEST('test filter', () => {
  let params = new QP(req({filter: '{"name.first":"bill", "age": 55}'}));
  OK(params.filter['name.first'] === 'bill');
  OK(params.filter.age === 55);
});

TEST('test valid sorts', () => {
  let params = new QP(req({sort: '["name", "DESC"]'}));
  OK(params.sort.key === 'name');
  OK(params.sort.dir === 'DESC');
  
  params = new QP(req({sort: '["age", "ASC"]'}));
  OK(params.sort.key === 'age');
  OK(params.sort.dir === 'ASC');
});

TEST('test invalid sort', () => {
  let params = new QP(req({sort: 'name", DESC"]'}));
  OK(params.sort === null);
});

TEST('test invalid IDS', () => {
  let params = new QP(req({ids: 'bad'}));
  OK(params.ids === null);
});

TEST('test valid IDS', () => {
  let params = new QP(req({ids: '["one","two","three"]'}));
  OK(params.ids.length === 3);
  OK(params.ids[0] === 'one');
});

TEST('condition, sort, filter, paginate', () => {
  const qobj = {
    filter: '{"a":"aval","b":"bval","c":3}',
    range: '[0,99]',
    sort: '["name","ASC"]'    
  };
  const params = new QP(req(qobj));
  
  // creates new cond
  let cond = params.getCondition();
  OK(cond.a.$regex === 'aval');
  OK(cond.b.$regex === 'bval');

  // uses existing
  cond = params.getCondition({existing: 13});
  OK(cond.existing === 13)
  OK(cond.a.$regex === 'aval');
  OK(cond.b.$regex === 'bval');

  let query = new QueryObject();
  params.updateQuery(query);
  OK(query.sortKey === 'name');
  OK(query.sortDir === 1);
  OK(query.skipVal === 0);
  OK(query.limitVal === 100);
});


TEST('default query', () => {
  const qobj = {};
  const params = new QP(req(qobj));
  
  let query = new QueryObject();
  params.updateQuery(query);
  OK(query.sortKey === null);
  OK(query.sortDir === 0);
  OK(query.skipVal === 0);
  OK(query.limitVal === Number.MAX_SAFE_INTEGER);
});










