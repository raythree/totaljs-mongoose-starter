const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbmlzdHJhdG9ycy9iaWxsIiwic2NvcGUiOiJhZG1\
pbiIsImlzcyI6Imh0dHA6Ly9laXNzLmlwa2V5cy5jb20iLCJpZCI6ImZlODAzMTc4LWY4YzItNGE3Mi1iZTQyLTIyYzU\
0YWM3YTVhMCIsImV4cCI6MTgxNzI5MjAyN30.-ukVJqCa7vyu8e93sibw5rZv4GDHPj5vtMxPmpkt8fA';

const goodHeader = `Bearer ${token}`;

TEST('Test missing header', function () {
  let req = {
      headers: {}
    }, 
    res = {}, 
    flags = {};
  
  F.onAuthorize(req, res, flags, function (ok) {    
    FAIL(ok);
  });
});

TEST('Test invalid token', function () {
  let req = {
      headers: {
        authorization: 'crap'
      }
    }, 
    res = {}, 
    flags = {};
  
  F.onAuthorize(req, res, flags, function (ok) {    
    FAIL(ok);
  });
});

TEST('Test wihtout bearer', function () {
  let req = {
      headers: {
        authorization: token
      }
    }, 
    res = {}, 
    flags = {};
  
  F.onAuthorize(req, res, flags, function (ok) {    
    FAIL(!ok);
  });
});

TEST('Test wih bearer', function () {
  let req = {
      headers: {
        authorization: goodHeader
      }
    }, 
    res = {}, 
    flags = {};
  
  F.onAuthorize(req, res, flags, function (ok) {    
    FAIL(!ok);
  });
});
