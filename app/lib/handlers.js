/*
*Request handlers 
*/

//Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');

//Define the handlers
var handlers = {};

//Users
handlers.users = function(data,callback){
    var acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];
    if(acceptableMethods.indexOf(data.method)>-1){
        //console.log(data);
        handlers._users[data.method](data,callback);
        
    }else{
        //Method not allowed status code
        callback(405, {'Error':'Not allowed method'});
    }
};

//Container for the users methods(private methods)
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
                            //console.log(err);
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
handlers._users.GET = function(data, callback){
    //Check that the provided phone number is valid 
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        //Get the token from the handlers 
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        //Verify that the given token is valid for the phone number 
        //console.log(token);
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
            if(tokenIsValid){
                //Lookup the user
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
                callback(403, {'Error': 'Missing required token in header, or token is invalid'});
            }
        });
        
    }else{
        callback(400, {'Error':'Missing required field'})
    }
};


//Users - put
//Required data : phone
//Optional data : firstName, lastName, Password(at least one must be specified)

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
            //Get the token from the handlers 
            var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            //Verify that the given token is valid for the phone number 
            handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
                if(tokenIsValid){
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
                            //console.log(err);
                            callback(500, {'Error':'Could not update the user'})
                        }
                    })
                }else{
                    callback(400, {'Error': 'The specified user does not exist'});
                }
            })
                }else{
                    callback(403, {'Error': 'Missing required token in header, or token is invalid'});
                }
            });
            
        }else{
            //Error if nothing is sent to update
            callback(400, {'Error': 'Missing fields to Update'});
        }

    }else{
        callback(400, {'Error': 'Missing required field'});
    }

};


//Users - delete
//Required field : phone 
//@TODO Only let an authenticated user delete their object. Don't let them delete anyone
//@TODO Cleanup (delete) any other data files associated with user 
handlers._users.DELETE = function(data, callback){
    //Check that the provided phone number is valid 
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){

         //Get the token from the handlers 
         var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
         //Verify that the given token is valid for the phone number 
         handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
             if(tokenIsValid){
            //Look up the user
            _data.read('users', phone, function(err,data){
            if(!err && data){
                _data.delete('users', phone, function(err){
                    if(!err){
                        callback(200, {'Success' : 'User Deleted Successfully'});
                    }else{
                        callback(500, {'Error' : 'Could not delete the specified user'});
                    }
                });
            }else{ 
                //Not found
               callback(400, {'Error': 'Could not find the specified user'});
            }
        });
             }else{
                callback(403, {'Error': 'Missing required token in header, or token is invalid'});
             }
            });
    }else{
        callback(400, {'Error':'Missing required field'});
    }
};

//Tokens
handlers.tokens = function(data,callback){
    var acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];
    if(acceptableMethods.indexOf(data.method)>-1){
        //console.log(data);
        handlers._tokens[data.method](data,callback);
        
    }else{
        //Method not allowed status code
        callback(405, {'Error':'Not allowed method'});
    }
};


//Container for all the tokens methods
handlers._tokens = {};

//Tokens - POST
//Required data : password and phone
//Optional data : None
handlers._tokens.POST = function(data, callback){
    var phone = typeof(data.reqPayload.phone) == 'string' && data.reqPayload.phone.trim().length == 10 ? data.reqPayload.phone.trim() : false;

    var password = typeof(data.reqPayload.password) == 'string' && data.reqPayload.password.trim().length > 0 ? data.reqPayload.password.trim() : false;
    
    if(phone && password){
        //Lookup the user who matches the phone number
        _data.read('users', phone, function(err, userData){
            if(!err && userData){
                //Hash the received password, and compare it to the password in the user object
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){

                    //If valid, create a new token with a random string. 
                    var tokenId = helpers.createRandomString(20);
                    //Set expiration date 1 hour in the future.
                    var expires = Date.now() + 1000 * 60 * 60;

                    var tokenObject = {
                        'phone' : phone,
                        'id' : tokenId,
                        'expires' : expires
                    };

                    //Store the token
                    _data.create('tokens', tokenId, tokenObject, function(err){
                        if(!err){
                            callback(200, tokenObject)
                        } else {
                            callback(500, {'Error' : 'Could not create the new token'});
                        }
                    });

                } else {
                    callback(400, {'Error': 'Password did not match the specified user\'s stored password' })
                }
            } else {
                callback(400, {'Error' : 'Could not find specified user'})
            }
        })
    }else{
        callback(400, {'Error':'Missing required fields'})
    }
};

//Tokens - GET
//Required data : id
//Optional data: none
handlers._tokens.GET = function(data, callback){
    //Check that the provided id is valid 
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    //console.log(data.queryStringObject.id);
    if(id){
        _data.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
                callback(200,tokenData);
            }else{ 
               callback(404, {'Error' : 'ID not found'});//Not found
            }
        });
    }else{
        callback(400, {'Error':'Missing required field'})
    }
};

//Tokens - PUT
//Required data : ID, Extend
//Optional data : None
handlers._tokens.PUT = function(data, callback){
    var id = typeof(data.reqPayload.id) == 'string' && data.reqPayload.id.trim().length == 20 ? data.reqPayload.id.trim() : false;
    
    var extend = data.reqPayload.extend.toUpperCase() === 'TRUE' ? true : false;

    //console.log(extend);

    if(id && extend){
        //Lookup the token 
        _data.read('tokens', id, function(err, tokenData){
            if(!err && tokenData){
                //Check the token to make sure the token isn't already expired 
                if(tokenData.expires > Date.now()){
                    //Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    //Store the new updates 
                    _data.update('tokens', id, tokenData, function(err){
                        if(!err){
                            callback(200, {'Success' : 'Token expiration extended'});
                        }else{
                            callback(500, {'Error': 'Could not update the token\'s expiration '})
                        }
                    });
                }else{
                    callback(500, {'Error' : 'The Token has already expired, and cannot be extended'});
                }
            }else{
                callback(400, {'Error' : 'Specified token does not exist'})
            }
        })
    }else{
        callback(400, {'Error': 'Missing required field or field is Invalid'});
    }
};

//Tokens - Delete
//Required data : id
//Optional data : none
handlers._tokens.DELETE = function(data, callback){
     //Check that the ID is valid 
     var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
     if(id){
         //Look up the token
         _data.read('tokens', id, function(err,data){
             if(!err && data){
                 _data.delete('tokens', id, function(err){
                     if(!err){
                         callback(200, {'Success' : 'Token Deleted Successfully'});
                     }else{
                         callback(500, {'Error' : 'Could not delete the specified token'});
                     }
                 });
             }else{ 
                 //Not found
                callback(400, {'Error': 'Could not find the specified token'});
             }
         });
     }else{
         callback(400, {'Error':'Missing required field'});
     }
};


//Verify if a given ID is currently valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback){
    //Lookup the token
    _data.read('tokens', id , function(err, tokenData){
        if(!err && tokenData){
            //Check that the token is for the given user and has not expired 
            if(tokenData.phone == phone && tokenData.expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    })
}

//Checks
handlers.checks = function(data,callback){
    var acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];
    if(acceptableMethods.indexOf(data.method)>-1){
        //console.log(data);
        handlers._checks[data.method](data,callback);
    }else{
        //Method not allowed status code
        callback(405, {'Error':'Not allowed method'});
    }
};

//Container for all the checks methods
handlers._checks = {};

//Checks - POST
//Required data : protocol, url, method, successCodes, timeoutSeconds
//Optional data : none
handlers._checks.POST = function(data, callback){
    //Validate Inputs
    var protocol = typeof(data.reqPayload.protocol) == 'string' && ['https', 'http'].indexOf(data.reqPayload.protocol) > -1  ? data.reqPayload.protocol : false;

    var url = typeof(data.reqPayload.url) == 'string' && data.reqPayload.url.trim().length > 0 ? data.reqPayload.url.trim() : false;

    var method = typeof(data.reqPayload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.reqPayload.method) > -1  ? data.reqPayload.method : false;

    var successCodes = typeof(data.reqPayload.successCodes) == 'object' && data.reqPayload.successCodes instanceof Array && data.reqPayload.successCodes.length > 0 ? data.reqPayload.successCodes : false;

    var timeoutSeconds = typeof(data.reqPayload.timeoutSeconds) == 'number' && data.reqPayload.timeoutSeconds % 1 === 0 && data.reqPayload.timeoutSeconds >= 1 && data.reqPayload.timeoutSeconds <= 5 ? data.reqPayload.timeoutSeconds : false;

    //console.log(protocol, url, method, successCodes, timeoutSeconds);
    if(protocol && url && method && successCodes && timeoutSeconds){
        //Get the token from the headers 
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        //console.log(token);
        //Lookup the user by reading the token
        _data.read('tokens', token, function(err, tokenData){
            if(!err && tokenData){
                var userPhone = tokenData.phone;

                //Lookup the user data
                _data.read('users', userPhone, function(err,userData){
                    if(!err && userData){
                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                        //Verify that the user has less than the number of max-checks-per-user
                        if(userChecks.length < config.maxChecks){
                             //Create a random id for checks
                            var checkId = helpers.createRandomString(20);

                            //Create the check object, and include the user's phone
                            var checkObject = {
                                'id' : checkId,
                                'userPhone' : userPhone,
                                'protocol' : protocol,
                                'url' : url,
                                'method' : method, 
                                'successCodes' : successCodes,
                                'timeoutSeconds' : timeoutSeconds
                            };

                            //Save the object
                            _data.create('checks', checkId, checkObject, function(err){
                                if(!err){
                                    //Add the checkId to the user's object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    //Save the new user data 
                                    _data.update('users', userPhone, userData, function(err){
                                        if(!err){
                                            //Return the data about the new check
                                            callback(200, checkObject);
                                        }else{
                                            callback(500,{'Error':'Could not update the user with the new check'});
                                        }
                                    })
                                }else{
                                    callback(500, {'Error' : 'Could not create the new check'})
                                }
                            });
                        } else {
                            callback(400, {'Error': 'The user already has the maximum number of checks ('+config.maxChecks+')'});
                        }
                    } else {
                        callback(403, {'Error' : 'Can not read User Data'});
                    }
                });

            }else{
                callback(403, {'Error' : 'Can not read user\'s token'});
            }
        })
    } else {
        callback(400, {'Error' : 'Missing required inputs, or inputs are invalid'});
    }
};

//Checks - get
// Required data: id
//Optional data: none
handlers._checks.GET = function(data, callback){
    //Check that the provided phone number is valid 
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id){

        //Lookup the check
        _data.read('checks', id, function(err, checkData){
            if(!err && checkData){
                //Get the token from the handlers 
                var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                //Verify that the given token is valid and belongs for the user who created the check
                handlers._tokens.verifyToken(token,checkData.userPhone, function(tokenIsValid){
                    
                    if(tokenIsValid){
                       //Return the check data
                       callback(200, checkData);
                    }else{
                        callback(403, {'Error': 'Missing required token in header, or token is invalid'});
                    }
                });

            }else{
                callback(404, {'Error' : 'Check Not found'});
            }
        });
    }else{
        callback(400, {'Error':'Missing required field'});
    }
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