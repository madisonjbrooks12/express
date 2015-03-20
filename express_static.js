var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var basicAuth = require('basic-auth-connect');
var auth = basicAuth(function(user, pass) {
  return((user ==='cs360')&&(pass === 'test'));
});
var app = express();
app.use(bodyParser());
var options = {
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};
  http.createServer(app).listen(80);
  https.createServer(options, app).listen(443);

  app.use('/', express.static('./html', {maxAge: 60*60*1000}));

  app.get('/getcity', function (req, res) {
    fs.readFile("cities.dat.txt", function (err,data) {
      if (err) throw err;
      var cities = data.toString().split("\n");
      var myRe = new RegExp("^"+url.parse(req.url, true).query["q"]);
      var jsonresult = [];
      for (var i = 0; i < cities.length; i++) {
        var result = cities[i].search(myRe);
        if (result != -1) {
          jsonresult.push({city:cities[i]});
        }
       }
      res.status(200);
      res.end(JSON.stringify(jsonresult));
    });
  });  

  app.get('/comment', function (req, res) {
    console.log("In GET comment route");
    var MongoClient = require('mongodb').MongoClient;
      MongoClient.connect("mongodb://localhost/cmntdb", function(err, db) {
        if(err) throw err;
        db.collection("comments", function(err, comments){
          if(err) throw err;
          comments.find(function(err, items){
            items.toArray(function(err, itemArr){
              console.log("Document Array: ");
              console.log(itemArr);
              res.json(itemArr);
              res.status(200);
          });
        });
      });
    });
  });

  app.post('/comment', auth, function (req, res) {
    console.log("In POST comment route");
    console.log(req.user);
    console.log("Remote User");
    console.log(req.remoteUser);
    //var jsonData = "";
      //req.on('data', function (chunk) {
        //jsonData += chunk;
     // });
     // req.on('end', function () {
       // var reqObj = JSON.parse(jsonData);
        console.log(req.body);
        console.log("Name: "+req.body.Name);
        console.log("Comment: "+req.body.Comment);
        var MongoClient = require('mongodb').MongoClient;
        MongoClient.connect("mongodb://localhost/cmntdb", function(err, db) {
          if(err) throw err;
          db.collection('comments').insert(req.body,function(err, records) {
            console.log("Record added as "+records[0]._id);
      res.status(200);
      res.end("");
    });
  });
}); 
