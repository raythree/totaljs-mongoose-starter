# Starter Project for REST Service with Total.js, Mongoose, and JWT authentication

[Total.js](https://www.totaljs.com/) is an amazing server framework with zero dependencies that lets you write clean, intuitive code with zero boilerplate. I've not tested the performance compared to other frameworks, but according to [this benchmark](https://raygun.com/blog/node-js-performance-2017/) it looks really good.

This is a starter app based on Total.js for REST services using Mongoose, JWT token authentication, and some common utilities for handling query filters, ordering and pagination. The goal is to have a starter app running in minutes, complete with authentication and a place to put hooks for authorization.

The starter has:

* A single User model with single name attribute. 
* CORs enabled
* Authentication of REST requests using JWT (in the Authorization header)
* Query support for filters, sort, and pagination (using similar API to FakeRest).
* /api/users route (authorized)
* A public /api/version route (unauthorized) the provides an API version in plain text
* A single static HTML page, redirected from / --> /index.html

### Quickstart

The project requires a MongoDB instance to be running. The simplest way to do that is using Docker:

```
docker run --name testdb -p 27017:27017 -v /path/to/db:/data/db -d mongo
```

This will create and run a container named ```testdb``` using running the latest mongo version with the standard mongo port mapped to local port 27017. It will create a database in your local ```/path/to/db``` directory (this must be an absolute path). After that you can start/stop the database using:

```
docker stop testdb
docker start testdb
```

This a great way to run multiple versions of mongo with multiple local databases for development.

A detailed description of the components is given below. The framework is very flexible with what you do with the components. I tried to align them with what I believe was the Framework's intention, but make sure to check out the [Total.js documentation](https://docs.totaljs.com/latest/en.html#pages~Getting%20started) that describes the directory layout, component usage, and methods and properties for the framework objects (Framework, FrameworkController, Request, Response, etc).

The starter looks for two environemnt variables when it starts. If not found, these are the defaults it uses:

```
export MONGO_URL=mongodb://localhost/testdb
export SECRET_KEY=/path/to/keyfile
```

Get the starter and run the server:

```
git clone https://github.com/raythree/totaljs-mongoose-starter
cd totaljs-mongoose-starter
npm install
node debug.js
```

In debug mode it watches any files for changes and restarts the server.

### Making Test Requests
It's best to use Postman to experiment with the server. The server uses JWT, so authorized routes will need an authorization header like this:

```
Authorization: Bearer <token>
```
The actual format of the token is up to you. As an example, the starter uses a token that includes a user, group, and role signed into the token in the ```sub``` and ```role``` fields like this:
```
	sub: user/group
	role: role	
```
For example:
```
	sub: admin/administrators
	role: superuser
```
After decoding the token the authorization component places a ```user``` object into the request so that it can be checked by other controllers and the authorization module like this:

```
function onAuthorize(req, res, flags, callback) {
	verifyToken()
	.then((userData) => {
		// userData from token is like this
		// {user: 'admin', group: 'administrators', role: 'superuser' }
		req.user = user;
		callback(true); // let framework know auth succeeded
	});
}

```

Here are two tokens you can use, signed with the sample key. Copy what is below the ```----[ token expires ]----``` line. The first one is for role admin which will be accepted, the second for operator which should result in 403 (the token is valid, but the authorization module is requiring admin role):

``` 
------------------[ token expires: Mon Apr 19 13:01:56 EDT 2049 ]-------------------
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbmlzdHJhdG9ycy9hZG1pbiIsInNjb3BlIjoiYWRtaW4iLCJpc3MiOiJodHRwOi8vZWlzcy5pcGtleXMuY29tIiwiaWQiOiJkM2M2OTA0OC1mMzIyLTQ4NzUtYjZlZS1mODdkMDBmN2Q1MGMiLCJleHAiOjI1MDI0NjU5ODZ9.4Wwc35OFAbSxtaRdjvQaprzPBPM4PAhPu-pA_UErw84

------------------[ token expires: Mon Apr 19 13:02:23 EDT 2049 ]-------------------
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvcGVyYXRvcnMvb3BlcmF0b3IiLCJzY29wZSI6Im9wZXJhdG9yIiwiaXNzIjoiaHR0cDovL2Vpc3MuaXBrZXlzLmNvbSIsImlkIjoiYjU3YTY3ZTQtNWIyNS00MTgwLTk0MTItYmI2NTRkNzc1NjNhIiwiZXhwIjoyNTAyNDY2MDY1fQ.cydQn63bTA9oOYrv6EwDpQZPMaxDTmYt0N-7EtFtmhU
```

Make sure to put "Bearer " in front of the token in the Authorization header.

### Components
All components use [```simple-console-logger```](https://www.npmjs.com/package/simple-console-logger), which works like Log4js except only to the console. This is pretty much what you want especially if runnng under Docker. The level can be configured with the ```logconfig.json``` file.

The Total.js components are described below.

#### Controllers
The default controller enables CORS and exposes two routes that do not require authentication:
```
   /                -> redirect to /index.html
   /index.html      -> served from the static directory
   /api/version     -> sends plain text version read from F.config
```
The static directory is configured in ./config:
```
directory-public    : /static
```
The user controller uses the restful API to expose CRUD methods on User objects (/api/users). This would do validation on input parameters, then invoke the model methods which access the database.

#### Definitions
The are described in the Total.js documentation as being used to override or replace Framework components. I placed the authorization.js file here, as it directly overrides the Framework's ```F.onAuthorize``` method. It checks the authorization header for a valid JWT token (signed by ./secretkey.txt) and places the decoded user directly into the request object.

*NOTE:* The framework calls this method on every request, however rejected routes are (properly) ignored when they are not configured with the ```authorize``` flag. 

#### Modules
Modules can be invoked based on many different ```F.on(...)``` events. One module, authorization.js is configured to be invoked on every controller access:

```
F.on('controller', checkAccess);

function checkAccess(controller, name) {
  if (controller.name === 'user') {
    if (controller.req.user.role !== 'admin') {
      log.info('rejecting non-admin request');
      controller.res.throw403('Permission denied');    
      controller.cancel();  
    }
  }
}
```

#### Schemas
The Mongoose schemas are exported here. These were deliberately placed in their own directory so that they can also be reused on the client side (for example, in form validation). Check the Mongoose documentation on [how to use schemas in the browser](http://mongoosejs.com/docs/unstable/docs/browser.html). If using Webpack, you need to add a flag to prevent Mongoose from trying to access non-browser components.

#### Models
All models (used by controllers) are places here. I exposed the User model directly (for example, to be used by schema testing), but the actual models are not needed by controllers. Only methods to act on models are needed, like create, update, save, and delete. 

#### static
A single html file is placed here and served as index.html. You could, for example, have your webpack build replace this with a bundled SPA, which is what I usually do with React apps. The starter app is using Total.js as a pure REST/JSON server, but it also has a rich view framework for server side rendering.

#### Tests
These are using the Frameworks TEST() methods. You can use any test framework, but the benefit of using Total.js tests is that they completely configure the Framework for the test enviroment. 

#### Utilities
The ```handleError``` utility catches any exceptions, prints a stack trace, and can be used to render reasonable errors back to the user.

```QueryParams``` supports parameters parsing that work with Mongoose queries. I'm currently using [Admin on REST](https://marmelab.com/admin-on-rest/RestClients.html) and their ```restClient``` supports query parameters like this:
```
GET http://my.api.url/posts?sort=['title','ASC']&range=[0, 24]&filter={title:'bar'}
```
See the ```listUsers``` method of the ```user``` controller for an example. It supports filtering, ordering, and pagination, returning a response like ```{ total: 100, data: [...] }```:

```
function listUsers() {
  const self = this;  

  let total;
  let params = new QueryParams(self.req); 
  let cond = params.getCondition({ /* put any initial query conditions here */ });
  // cond now has initial query, plus filters

  return F.model('user').count(cond)
    .then((count) => {
      total = count;
      let query = F.model('user').list(cond);
      return params.exec(query);
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
```



