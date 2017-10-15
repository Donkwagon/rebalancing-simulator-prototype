
var express =         require("express");
var bodyParser =      require("body-parser");
var mongoose =        require('mongoose');
var http =            require('http');


//////////////////////////////////////////
//Initialize app and start express server
var app = express();
app.use(bodyParser.json());

var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

const server = http.createServer(app);

server.listen(process.env.PORT || 8080, function (err) {
    if (err) {console.log(err);process.exit(1);}
    var port = server.address().port;
    console.log("App now running on port",port);
});

//////////////////////////////////////////
//Connect to mongoose db
// Use native promises
// mongoose.Promise = require('bluebird');
var MongoDbConStr = "mongodb://Donkw:Idhap007@ds115532-a0.mlab.com:15532,ds115532-a1.mlab.com:15532/heroku_tln16g2j?replicaSet=rs-ds115532";
// global.db = (global.db ? global.db : mongoose.createConnection(MongoDbConStr));
global.db = mongoose.createConnection(MongoDbConStr);

//////////////////////////////////////////

const apis = require('./server/routes/apis');
app.use('/apis',apis);

module.exports = app;