/*
* Create and Export configuration variables
*
*/

//Container for all Environments
//We have two environments, Staging and Production

var environments = {};

//Staging (Default) Environment
environments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks' : 5

};
//Production Environment
environments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName': 'production',
    'hashingSecret' : 'thisIsAlsoASecret',
    'maxChecks' : 5
}

//Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//Check if the current Environment is one of the environment above, if not, default is staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;
