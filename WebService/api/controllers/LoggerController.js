/**
 * LoggerController
 *
 * @description :: Server-side actions for handling incoming requests.
 */

module.exports = {

    log :function(location, logMessage){

        var newlogMessage = '[' + location + '] ' + logMessage;

        Logger.create({timestamp: new Date(), message: newlogMessage}).exec(function(err){

            if(err){
                console.log(err);
            }
        });

        return null;
    },

};

