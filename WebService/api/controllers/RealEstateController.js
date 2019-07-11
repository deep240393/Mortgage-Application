/**
 * RealEstateController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  // function to add property approval deatils of the applicant in the real estate table
    REApprovalForm: async function(req,res){

        // Fetch data of the approval form
        console.log("Data from client",req.body);
        var MlsID = req.param('MlsID');
        var Name = req.param('Name');
        var MortgageID= req.param('MortgageID');
        
        if (MlsID === undefined || Name === undefined || MortgageID=== undefined) {

            // Logger.log("RealEstate approval form","[ValidationError] Enter all the details!!");
            return res.send({error_message : "Please enter all the details!"});
        }
        else if (MlsID == '' || Name == '' || MortgageID == '' ) {
           
            // Logger.log("RealEstate approval form","[ValidationError] Real estate approval form details can not be null!!");
            return res.send({error_message : "Real estate approval form details can not be null!!"});

        }
        else
        {
            console.log("Create data",req.body);
        // ORM to insert data into real estate table
        RealEstate.create({
            MlsID:MlsID,
            Name:Name,
            MortgageID:MortgageID,
        }, async function(err, REApprovalFormData){
            if(err){

                //Logger.log("RealEstate Approval","[RegistrationError] Error in registering new applicant"+ Name);
                return res.send({data: err});
            }
            else{
                //Logger.log("RealEstate Approval","[Success] New Application for "+ Name + " successfully created in RealEstate!");
                return res.send({data: "Your mortgage property deatils are send for approval"});
            }
            });
         }
    },
    // Authenticate the appraiser
    checkAppraisalCredentials: async function(req,res){
        console.log(req.body);
        var UserID = req.param("UserID");
        var Password = req.param("Password");
        var error_message = "";
        var auth = false;
        Appraiser.findOne({
            UserID: UserID,
            Password:Password
        }).exec(function(err,data){
            console.log(data);
            if(err){
                error_message = "Something went wrong while fetching data.";
            }
            else if(!data){
                error_message = "The credentials are not matched. Try again with correct credentials.";
            }
            // send data if credentials are correct
            if (error_message == ''){

                // Logger.log("RealEstate appraisal","[Success] Login Successful for user id : [ "+user_id+" ]");
                return res.send({
                    data: data,
                    error_message: error_message
                });  
            }
            // send the error message
            else{
                return res.send({
                    error_message: error_message
                });
            }
        })
    },
    // RE Data after login
    getREData: function(req,res){
       
        RealEstate.find().exec(function(err,data){
            if(err){
                error_message = "Something went wrong while fetching data.";
                return res.send({data:err})
            }
            else{
                return res.send({
                    data:data
                })
            }
        })
    }
};

