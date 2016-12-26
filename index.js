var mongo = require("mongodb").MongoClient;
var express = require("express")();
var fs= require("fs");
var url = "mongodb://localhost:27017/learnyoumongo";

express.get("/new/:protocol//:url", function(req, res){

    console.log("received for insert: "+ req.params.url);
    
    var shortUrl = "", longUrl = req.params.protocol + "//" + req.params.url;
    var linkRecord = lookup(req.params.url, false); 
    if(linkRecord){
        shortUrl = linkRecord[0].short;
        longUrl = linkRecord[0].long;
        console.log("Value already exists in DB: " + linkRecord[0]);    
        
    }else{
        
            //small url generation logic:
            /*  
                1. Get current time - hours, minutes and seconds
                2. Get a random number between 1 and 1000
                3. Get current date - day,month, year
                4. append the above together
            */
            
        //   var dt = new Date();
        //   var smallUrlKey = "" + dt.getHours()+dt.getMinutes()+dt.getSeconds() + dt.getDate() + dt.getMonth() +dt.getYear();
        //   smallUrlKey += Math.floor(Math.random(10)*10);
          shortUrl = "https://warm-reef-87592.herokuapp.com/" + Date.now();
          console.log("Generated smallurl: "+ shortUrl);
        
        
          // Write to DB 
          mongo.connect(url, function(err, db){
            if(err) throw err;
            
            db.collection('links').insert({
                "short" : shortUrl,
                "long" : longUrl
            }, function(err, data){
                if(err) throw err;
            });
            
            db.close();
        });
    }

    var responseStr = {
      "original_url": longUrl,
      "short_url": shortUrl
    };
    
    console.log("prepared response: " + responseStr);

    res.writeHead(200, {"Content-Type":"text/json"});
    res.write(JSON.stringify(responseStr));
    res.end();
  
    
} ).get("/:num", function(req, res){
    
    console.log("received for lookup: "+ req.params.num);
    
    var links = lookup(req.params.num, true); 
    
    console.log("long url is: "+ links[0]);
    
}).listen(process.env.PORT || 8080);


function lookup(link, isKey){
    // isKey: true - lookup against the key, and return the long url to redirect to
    // isKey: false - check against values to see if this url is already entered. If yes, simply return that record as json (no duplicates)
    
    mongo.connect(url, function(err, db){
        if(err) throw err;
        if(isKey){
            
            db.collection('links').find({
                "short" : link
            }).toArray(function (err, docs){
                if (err) throw err;
                
                console.log("found doc:" + docs);
                
                db.close();
            });
            
        }else{
            db.collection('links').find({
                "long": link
                }).toArray(function (err, docs){
                    if (err) throw err;
                
                    console.log("found doc:" + docs);
                    db.close();
                });
        }
        
        db.close();
    });
    
    
}