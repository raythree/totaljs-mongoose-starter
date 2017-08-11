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

You can generate tokens using the key in ```./secretkey.txt``` Using:

```
node tools/createtoken <user> <group> <role> <expiration_in_seconds>
```

This will print the token to stdout and you can paste it into the Postman headers. 

### Components
[TBD...]

#### Definitions
[TBD...]

#### Modules
[TBD...]

#### Schemas
[TBD...]

#### Models
[TBD...]

#### static
[TBD...]


