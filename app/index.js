/*
*Primary file for the API
*
*/

//Dependencies
var http = require ('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var _data = require('./lib/data');

//TESTING
// @TODO delete this
// _data.create('test', 'newFile', {'foo' : 'bar'}, function(err){
//     console.log('this was the error',err);
// });
// _data.read('test', 'newFile', function(err, data){
//     console.log('this was the error',err, 'and this was the data', data);
// });
_data.update('test', 'newFile',{'fizrz' : 'buzrz'}, function(err){
    console.log('this was the error',err);
});




//Instantiating the HTTP server
var httpServer = http.createServer(function(req,res){
    unifiedServer(req, res);   
});

//Start the HTTP server
httpServer.listen(config.httpPort,function(){
    console.log("The server is listening to port " +config.httpPort);
});


//Instantiating the HTTP server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/certificate.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req,res){
    unifiedServer(req, res);   
});
//Start the server
httpsServer.listen(config.httpsPort,function(){
    console.log("The server is listening to port " +config.httpsPort);
});


//All the server logic for both the http and https server
var unifiedServer = function(req, res){

     //Get the URL and parse it
     var parsedUrl = url.parse(req.url,true);

     //Get the path
     var path = parsedUrl.pathname;
     var trimmedPath = path.replace(/^\/+|\/+$/g,'');
 
     //Get the query string as an object
     var queryStringObject = parsedUrl.query;
 
     //Get the HTTP Method
     var method = req.method.toUpperCase();
 
     //Get the headers as an Object
     var headers = req.headers;
 
     //Get the payloads if any [collect streams]
     //Data Event and End Event
     var decoder = new StringDecoder('utf-8');
     var buffer = '';
     
     req.on('data', function(data){
         buffer +=decoder.write(data);
     });
 
     req.on('end', function(){
         buffer += decoder.end();
 
         //Choose the handler this request should go. If one is not found, use the notFound handler
         var chosenHandler  = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
 
         //Construct the data object to send to the router
         var data = {
             'trimmed path' : trimmedPath,
             'queryStringObject' : queryStringObject,
             'method' : method,
             'headers' : headers,
             'reqPayload' : buffer
         };
 
         //Route the request to the chosen handler
         chosenHandler(data, function(statusCode, resPayload){
             //Use the status code called back by the handler, or default to 200
             statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
             //Use the payload called back by the handler, or default to an empty object
             resPayload = typeof(resPayload) == 'object' ? resPayload : {};
             //Convert the payload to a string 
             var resPayloadString = JSON.stringify(resPayload);
 
             //Return the response
             res.setHeader('Content-Type', 'application/json');
             res.writeHead(statusCode);
             res.end(resPayloadString);
 
             //Log the request path
             console.log('Returning this response: ', statusCode, resPayloadString);
         });
 
         //Send the response
         //res.end('Hello World\n');
 
         //Log the request path 
         //console.log('Request is received on path: '+trimmedPath+'\nwith method '+method+ '\nand with these query parameters ',queryStringObject);
         //console.log('Request received with these headers ', headers);
         //console.log('Request received with this payload:\n', buffer);
     });
}



//Define the handlers
var handlers = {};

//ping Handler
handlers.ping = function(data, callback){
    callback(200);
}

//Not found handler
handlers.notFound = function(data, callback){
    callback(404);
};

//Defining a request router
var router = {
    'ping' : handlers.ping
};