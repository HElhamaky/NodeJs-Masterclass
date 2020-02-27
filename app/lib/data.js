/*
 * Library for storing and editing data
 */

 //Dependencies
    var fs = require('fs');
    //Normalize the path to different directories
    var path = require('path');
    //Call helpers
    var helpers = require('./helpers');

//Container for the module (to be exported)

var lib = {};

//Define the Base Directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

//Function to write data to a file 
lib.create = function(dir, file, data, callback){
    //Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err, fileDescriptor){
        if(!err && fileDescriptor){
            //Convert data to string (from JSON)
            var stringData = JSON.stringify(data);

            //Write to file and close it
            fs.writeFile(fileDescriptor, stringData, function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false);
                        }else{
                            callback('Error closing new file')
                        }
                    })
                }else{
                    callback('Error writing to new file');
                }
            })
        }else{
            callback('Could not create new file, it may already exist.')
        }
    });
}

//Read Data from file
lib.read = function(dir, file, callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
        if(!err && data){
            var parseData = helpers.parseJsonToObject(data);
            callback(false, parseData);
        }else{
            callback(err, data);
        }
    });
}

//Update data inside a file
lib.update = function(dir, file, data, callback){
    //Open the file for writing using the switch r+
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDescriptor){
        if(!err && fileDescriptor){
            //Convert data to string (from JSON)
            var stringData = JSON.stringify(data);

            //Truncate the file
            fs.ftruncate(fileDescriptor, function(err){
                if(!err){
                    //Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, function(err){
                        if(!err){
                            fs.close(fileDescriptor, function(err){
                                if(!err){
                                    callback(false)
                                }else{
                                    callback('Error closing existing file')
                                }
                            });
                        }else{
                            callback('Error writing to existing file');
                        }
                    });
                }else{
                    callback('Error truncating file')
                }
            });

        }else{
            callback('Could not open the file for updating, it may not exist yet');
        }
    });
};


//Delete a file
lib.delete = function(dir, file, callback){
    //Unlink the file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
        if(!err){
            callback(false);
        }else{
            callback('Error deleting file')
        }
    });
}


//Export the module
module.exports = lib;