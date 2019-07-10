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
};

