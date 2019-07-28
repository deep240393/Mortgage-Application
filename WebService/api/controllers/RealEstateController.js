/**
 * RealEstateController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var Logger = require('./LoggerController');
module.exports = {

  // function to add property approval deatils of the applicant in the real estate table
    REApprovalForm: async function(req,res){

        // Fetch data of the approval form
        console.log("Data from client",req.body);
        var MlsID = req.param('MlsID');
        var Name = req.param('Name');
        var MortgageID= req.param('MortgageID');
        const nameRegexp = /^[A-Za-z\s]+$/;
        // log indicating request in received from the customer
        Logger.log("RealEstate Approval","[Success] New Application request for "+ Name + " successfully sent to RealEstate webservice!");
        
        if (MlsID === undefined || Name === undefined || MortgageID=== undefined) {

            Logger.log("RealEstate approval form","[ValidationError] Enter all the details!!");
            return res.send({error_message : "Please enter all the details!"});
        }
        else if (MlsID == '' || Name == '' || MortgageID == '' ) {
           
            Logger.log("RealEstate approval form","[ValidationError] Real estate approval form details can not be null!!");
            return res.send({error_message : "Real estate approval form details can not be null!!"});

        }

        else if (!nameRegexp.test(Name.toLowerCase())) {
            Logger.log("RealEstate approval form","[ValidationError] Name is not valid. Passed name: ", Name);
            res.send({ error_message: 'Name is not valid' });
        }
        else
        {
            console.log("Create data",req.body);
        // ORM to insert data into real estate table
        RealEstate.create({
            MlsID:MlsID,
            Name:Name,
            MortgageID:MortgageID,
        }, function(err, REApprovalFormData){
            if(err){
                // checking if user has made any error while registering
                Logger.log("RealEstate Approval","[RegistrationError] Error in registering new applicant"+ Name);
                console.log("unique value",err);
                return res.send({error_message: "Error in registering new applicant. Please check your Mortgage ID and other details"});
            }
            else{
                Logger.log("RealEstate Approval","[Success] New Application for "+ Name + " successfully created in RealEstate!");
                return res.send({data: "Your mortgage property deatils are send for approval"});
            }
            });
         }
    },
    // Authenticate the appraiser
    checkAppraisalCredentials: async function(req,res){
        console.log(req.body);
        var UserID = req.param("UserID");
        var password = req.param("Password");
        var error_message = "";
        var auth = false;
        var enctyptedPassword = '';
        Logger.log("Appraiser approval form: [Success] request for "+ UserID + " successfully sent to RealEstate webservice!");
        // encrypt the password which will be sent in request
        if (password !== undefined && password != '') {
            // http://codeniro.com/caesars-cipher-algorithm-javascript/

            for (var i=0; i<password.length; i++) {
                var c = password.charCodeAt(i);
                if (c >=65 && c<=90) {
                    enctyptedPassword += String.fromCharCode((c - 65 + 13) % 26 + 65);
                }
                else if (c >= 97 && c <= 122) {
                    enctyptedPassword += String.fromCharCode((c - 97 + 13) % 26 + 97);
                }
                else {
                    enctyptedPassword += password.charAt(i);
                }
            }
        }

        Appraiser.findOne({
            UserID: UserID,
            Password:enctyptedPassword
        }).exec(function(err,data){
            console.log(data);
            if(err){
                error_message = "Something went wrong while fetching data.";
                Logger.log("RealEstate appraisal","[Error] Something went wrong while fetching data. ");
            }
            else if(!data){
                error_message = "The credentials are not matched. Try again with correct credentials.";
                Logger.log("RealEstate appraisal","[Error] Incorrect credentials for user id : [ "+UserID+" ]");
            }
            // send data if credentials are correct
            if (error_message == ''){
                delete data['Password'];
                Logger.log("RealEstate appraisal","[Success] Login Successful for user id : [ "+UserID+" ]");
                return res.send({
                    data: data,
                    error_message: error_message
                });  
            }
            // send the error message
            else{
                Logger.log("invalid credentails");
                return res.send({
                    error_message: error_message
                });
            }
        })
    },
    // RE Data after login
    getREData: function(req,res){
       
        RealEstate.find({"Value":0}).exec(function(err,data){
            if(err){
                error_message = "Something went wrong while fetching data.";
                Logger.log("RealEstate appraisal","[Error] Something went wrong while fetching data. ");
                return res.send({data:err, errorPresent: true})
            }
            else{
                Logger.log("RealEstate appraisal","[Success] properties which are left for valuation successfully fetched. ");
                return res.send({
                    data:data,
                    errorPresent: false
                })
            }
        })
    },

    updateREData: function(req,res){
        Logger.log("RealEstate appraisal","[Success] received request for property values submitted by the appraisal ");
        var value = req.param("value");
        var id = req.param('id');

        if (value !== undefined && value != '') {
            value = value.replace(",", "");   // remove commas from value
        }

        if (value === undefined || value == '') {
            Logger.log("RE","[UpdateError] Appraiser didn't pass value");
            return res.send({error_message: "Please pass value"});
        }

        else if (isNaN(value) || parseFloat(value) < 0) {
            Logger.log("RE", "[UpdateError] Value not valid.");
            return res.send({ error_message: "Value not valid" });
        }

        RealEstate.update({
            //Value:value
            MlsID:id
        }).set({Value:value}).exec(function(err,data){
            if(err){
                Logger.log("RealEstate appraisal","[Error] Something went wrong while fetching data. ");
                return res.send({data:err})
            }else{
                
                console.log(value);
                console.log(id);
                // send all the values of each Mlsid which are updated by the appraiser
                Logger.log("RealEstate appraisal","[Success] properties values are updated and request is sent to the webservice of insurance company ");
                RealEstate.find({MlsID:id}).exec(function(err,data){
                    return res.send(data)
                })
                
            }
        })
    }
};

