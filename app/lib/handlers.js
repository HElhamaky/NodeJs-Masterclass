/*
*Request handlers 
*/

//Dependencies
var _data = require('./data');
var helpers = require('./helpers')

//Define the handlers
var handlers = {};

//Users
handlers.users = function(data,callback){
    var acceptableMethods = ['POST', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        //console.log(data);
        handlers._users[data.method](data,callback);
        
    }else{
        //Method not allowed status code
        callback(405, {'Error':'Not allowed method'});
    }
};

//Container for the users submethods(private methods)
handlers._users = {};

//Users - post
//Required data: firstName, lastName, phone, password, tosAgreement
//Optional data: none 
handlers._users.POST = function(data,callback){
    //Check that all required fields are filled out
    //Check if the user sent the payload in the structure we required
    
    
    var firstName = typeof(data.reqPayload.firstName) == 'string' && data.reqPayload.firstName.trim().length > 0 ? data.reqPayload.firstName.trim() : false;

    var lastName = typeof(data.reqPayload.lastName) == 'string' && data.reqPayload.lastName.trim().length > 0 ? data.reqPayload.lastName.trim() : false;

    var phone = typeof(data.reqPayload.phone) == 'string' && data.reqPayload.phone.trim().length == 10 ? data.reqPayload.phone.trim() : false;

    var password = typeof(data.reqPayload.password) == 'string' && data.reqPayload.password.trim().length > 0 ? data.reqPayload.password.trim() : false;

    var tosAgreement = typeof(data.reqPayload.tosAgreement) == 'boolean' && data.reqPayload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && tosAgreement){
        //Make sure that the user doesn't already exist
        _data.read('users', phone, function(err, data){
            if(err){
                //Hash the password
                var hashedPassword = helpers.hash(password);

                //Create the user object 
                if(hashedPassword){
                    var userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : true
                    };
    
                    //Create the user
                    _data.create('users', phone, userObject, function(err){
                        if(!err){
                            callback(200);
                        }else{
                            console.log(err);
                            callback(500,{'Error':'Could not create the new user'})
                        }
                    });
                }else{
                    callback(500,{'Error':'Could not hash the user\'s password'});
                }        

            }else{
                //User already exist
                callback(400, {'Error':'A user with that phone number already exist'})
            }
        });
    }else{
        callback(400, {'Error' : 'Missing required fields'});
    };
};
//Users - get
handlers._users.get = function(data, callback){
    
};
//Users - put
handlers._users.put = function(data, callback){
    
};
//Users - delete
handlers._users.delete = function(data, callback){
    
};


//ping Handler
handlers.ping = function(data, callback){
    callback(200);
}

//Not found handler
handlers.notFound = function(data, callback){
    callback(404);
};

//Export the module
module.exports = handlers;