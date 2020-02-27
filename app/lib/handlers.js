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
    var acceptableMethods = ['POST', 'GET', 'PUT', 'delete'];
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
                            callback(200, {'Success' : 'User created successfully'});
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
// Required data: phone
//Optional data: none
// @TODO Only let an authenticated user access their object. Don't let them access anyone elses'.
handlers._users.GET = function(data, callback){
    //Check that the provided phone number is valid 
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        _data.read('users', phone, function(err,data){
            if(!err && data){
                //Remove the hashed password from the user object before returning it to the requester
                delete data.hashedPassword;
                callback(200,data);
            }else{ 
               callback(404);//Not found
            }
        });
    }else{
        callback(400, {'Error':'Missing required field'})
    }
};


//Users - put
//Required data : phone
//Optional data : firstName, lastName, Password(at least one must be specified)
//@TODO Only let an authenticated user update their own object, don't let them update any one elses'
handlers._users.PUT = function(data, callback){
    //Check for the required field
    var phone = typeof(data.reqPayload.phone) == 'string' && data.reqPayload.phone.trim().length == 10 ? data.reqPayload.phone.trim() : false;

    //Check for the optional fields
    var firstName = typeof(data.reqPayload.firstName) == 'string' && data.reqPayload.firstName.trim().length > 0 ? data.reqPayload.firstName.trim() : false;

    var lastName = typeof(data.reqPayload.lastName) == 'string' && data.reqPayload.lastName.trim().length > 0 ? data.reqPayload.lastName.trim() : false;

    var password = typeof(data.reqPayload.password) == 'string' && data.reqPayload.password.trim().length > 0 ? data.reqPayload.password.trim() : false;

    //Error if the phone is invalid
    if(phone){
        if(firstName || lastName || password){
            //Lookup the user 
            _data.read('users', phone, function(err,userData){
                if(!err && userData){
                    //Update the specified field
                    if(firstName){
                        userData.firstName = firstName;
                    }
                    if(lastName){
                        userData.lastName = lastName;
                    }
                    if(password){
                        userData.hashedPassword =helpers.hash(password);
                    }
                    //Store the new update
                    _data.update('users', phone,userData,function(err){
                        if(!err){
                            callback(200, {'Success':'User object updated'});
                        }else{
                            console.log(err);
                            callback(500, {'Error':'Could not update the user'})
                        }
                    })
                }else{
                    callback(400, {'Error': 'The specified user does not exist'});
                }
            })
        }else{
            //Error if nothing is sent to update
            callback(400, {'Error': 'Missing fields to Update'});
        }

    }else{
        callback(400, {'Error': 'Missing required field'});
    }

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