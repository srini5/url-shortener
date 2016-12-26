var mongo = require("mongodb").MongoClient;
var express = require("express")();
var fs= require("fs");

//var url = "mongodb://localhost:27017/learnyoumongo";
var url = process.env.MONGOLAB_URI // read from config

express.get("/:num", function(req, res){
    
    console.log("received for lookup: "+ req.params.num);
    
    mongo.connect(url, function(err, db){
        if(err) throw err;
        
        var shortUrl = "https://warm-reef-87592.herokuapp.com/" + req.params.num;
        
        db.collection('links').find({
                "short" : shortUrl
            }).toArray(function (err, docs){
                if (err) throw err;
                
                console.log("found doc:" + docs[0]);
                
                var longUrl = docs[0].long;
                res.redirect(longUrl); // redirect to the stored url
            });
        });
}).get("/new/*/", function(req, res){

    console.log("url received for insert: "+ req.originalUrl.substr(5,req.originalUrl.len
    ));
    console.log("protocol received for insert: "+ req.protocol);
    
    var shortUrlSuffix = "";
    var longUrl = req.originalUrl.substr(5,req.originalUrl.length);
    
    console.log("longUrl: "+ longUrl);
    
    mongo.connect(url, function(err, db){
        if(err) throw err;
       
        db.collection('links').find({
            "long": longUrl
            }).toArray(function (err, docs){
                 if (err) throw err;
                 console.log("found doc:" + docs);
                 
                 if(docs.length > 0){
                    shortUrlSuffix = docs[0].short;  
                    console.log("Found smallurl: "+ shortUrlSuffix);
                    
                    db.close();
        
                    var responseStr = {
                        "original_url": longUrl,
                        "short_url": shortUrlSuffix
                    };
                
                    console.log("prepared response: " + JSON.stringify(responseStr));
            
                    res.writeHead(200, {"Content-Type":"text/json"});
                    res.write(JSON.stringify(responseStr));
                    res.end(); 
                    
                 }else{
                    // Generate small url, save it and return
                    shortUrlSuffix = Date.now();
                    console.log("Generated smallurl: "+ shortUrlSuffix);
                    
                    db.collection('links').insert({
                        "short" : shortUrlSuffix,
                        "long" : longUrl
                        }, function(err, data){
                            if(err) throw err;
                            
                            db.close();
        
                            var responseStr = {
                                "original_url": longUrl,
                                "short_url": "https://warm-reef-87592.herokuapp.com/" + shortUrlSuffix
                            };
                        
                            console.log("prepared response: " + JSON.stringify(responseStr));
                    
                            res.writeHead(200, {"Content-Type":"text/json"});
                            res.write(JSON.stringify(responseStr));
                            res.end();
                        });
                    }
            });
        
            
    });
}).listen(process.env.PORT || 8080);