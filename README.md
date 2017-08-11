# Starter Project for REST Service with Total.js, Mongoose, and JWT authentication

This is a starter template for a REST service. It includes:

* A single user model with single name attribute. 
* CORs enabled
* Authentication of REST requests using JWT (in the Authorization header)
* Query support for filters, sort, and pagination (using similar API to FakeRest).
* /api/users route (authorized)
* A public /api/version route (unauthorized) the provides an API version
* A single static HTML page, redirected from / --> /index.html

The server validates JWTs (created externally) and requires the secret key. Both the key and the Mongo URL must be present in the environment, like:

```
export MONGO_URL=mongodb://localhost/testdb
export SECRET_KEY=/path/to/keyfile
```

### Quickstart

The project requires a MongoDB instance to be running. The simplest way to do that is using Docker:

```
docker run --name testdb -p 27017:27017 -v /path/to/db:/data/db -d mongo
```

This will create and run a container named ```testdb``` using running the latest mongo version with the standard mongo port mapped to local port 27017. It will create a database in your local ```/path/to/db``` directory (this must be an absolute path). After that you can start/stop it using:

```
docker stop testdb
docker start testdb
```

Make sure you have the two enviroment variables defined. Then

```
git clone https://github.com/raythree/totaljs-mongoose-starter
cd totaljs-mongoose-starter
npm install
node debug
```







