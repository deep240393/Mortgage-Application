/**
 * INSincController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var Logger = require('./LoggerController');

//function that calculates dedicatable amount given the appraisal value
function calculateDeductableAmount(appraisalValue){

    var percent = 20;

    if(appraisalValue <= 0 || isNaN(appraisalValue)){
        return 0;
    }else{
        return( appraisalValue * (percent/100) );
    }
}

//function that calculates insured amount given the appraisal value
function calculateInsuredAmount(appraisalValue){

    var percent = 150;

    if(appraisalValue <= 0 || isNaN(appraisalValue)){
        return 0;
    }else{
        return( appraisalValue * (percent/100) );
    }
}

module.exports = {
  
    insuranceQuote: function(req, res){

        try{
            
            //parse information from the RE request
            var mortID = req.param('MortID');
            var appraisalValue = parseFloat( req.param('AppraisalValue') );
            var mlsID = req.param('MlsID');
            var fullname = req.param('FullName');
            
            console.log("[Insurance] Insurance quote requested.");
            Logger.log("INSinc", "[INSinc][insuranceQuote] New insurance quote. MortgageID:"+mortID+
                " appraisal value:"+appraisalValue+" MlsID:"+mlsID+" Full name:"+fullname);

           //calculat the insured value and deductable value
            var insuredValue = calculateInsuredAmount(appraisalValue);
            var deductableValue = calculateDeductableAmount(appraisalValue);
            
            //create the MBRWebURL string with parameters
            var MbrWebUrl = "https://webservicenimbus.herokuapp.com/mbr/insuranceUpdate/?";
            MbrWebUrl = MbrWebUrl + "MortID="+mortID+"&";
            MbrWebUrl = MbrWebUrl + "MlsID="+mlsID+"&";
            MbrWebUrl = MbrWebUrl + "FullName="+fullname+"&";
            MbrWebUrl = MbrWebUrl + "InsuredValue="+insuredValue+"&";
            MbrWebUrl = MbrWebUrl + "DeductableValue="+deductableValue;

            //send an http request to the MBR controller to update the db
            //https://stackoverflow.com/questions/30523872/make-a-http-request-in-your-controller-sails-js
            
            var request = require('request');
            Logger.log("INSinc", "[INSinc][MBRRequest] Prepared request URL: "+MbrWebUrl);

            request.get({ 
                url: MbrWebUrl
            }, function(error, response, body) {
                if (error) {

                    Logger.log("INSinc", "[Error] [MortId]: " + mortID + error)                    
                    return res.serverError(error);
                }
                else {

                    if(body=="OK"){
                        Logger.log("INSinc","[Success] Insurance value has been successfully sent to MBR [MortId]: " + mortID)
                        return res.ok();
                    }else{
                        Logger.log("INSinc","[Error] MBR return indicates an error with the data [MortId]: " + mortID + " [body]: " + body)
                        return res.send("[Error] MBR return indicates an error with the data [MortId]: " + mortID)
                    }
                }
            });

        }catch(err){
            Logger.log("INSinc","[Error] [MortId]: " + mortID + err)
            return res.serverError(err);
        }
    },
};

