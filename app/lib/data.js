/*
 * Library for storing and editing data
 */

 //Dependencies
    var fs = require('fs');
    //Normalize the path to different directories
    var path = require('path');

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




//Export the module
module.exports = lib;