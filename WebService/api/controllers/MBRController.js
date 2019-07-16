/**
 * MBRController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var Logger = require('./LoggerController');

module.exports = {
  
    newApplication: async function(req,res){

        // Fetch data of the form
        var email = req.param('email');
        var address = req.param('address');
        var name = req.param('name');
        var phone = req.param('phone');
        var employer = req.param('employer');
        var password = req.param('password');
        var employee_ID = req.param('employee_ID');
        var mortgage_value = req.param('mortgage_value');
        var MlsID = req.param('MlsID');

        if (email === undefined || address === undefined || name === undefined || phone === undefined 
            || employer === undefined || password === undefined || employee_ID === undefined ||
            mortgage_value === undefined || MlsID === undefined) {

            Logger.log("MBR","[ValidationError] Enter all the details!!");
            return res.send({error_message : "Please enter all the details!"});
        }
        else if (email == '' || address == '' || name == '' || phone == '' ||
         employer == '' || password == '' || employee_ID == '' || mortgage_value == '' || MlsID == '') {
           
            Logger.log("MBR","[ValidationError] Employee details can not be null!!");
            return res.send({error_message : "Employee details can not be null!!"});

        }
        else
        {
        // ORM to insert data into table
        // Here, the status will be "pending" for new application
        MBR.create({
            name:name,
            email:email,
            phone:phone,
            mailing_address:address,
            employer_name:employer,
            password:password,
            employee_ID:employee_ID,
            MlsID:MlsID,
            mortgage_value:mortgage_value,
            status:"pending",
            EMP_confirmation:"false",
            INSinc_confirmation:"false",
        }, async function(err, MBRdata){
            if(err){

                Logger.log("MBR","[RegistrationError] Error in registering new applicant  "+ name);
                return res.send({data: err});
            }
            
            var fetch_data = await MBR.findOne({name:name, email:email, phone:phone, mailing_address:address,
                employer_name:employer, password:password, employee_ID:employee_ID, MlsID:MlsID, 
                mortgage_value:mortgage_value, status:"pending"}, function(err, row){

                    Logger.log("MBR","[Success] New Application for "+ name + " successfully created in MBR!");
                    return res.send({data: row});
                });
            });
         }
    },

    check_credentials: function(req, res){

        // Fetch the data
        var user_id = req.param("user_id");
        var password = req.param("password");
        var error_message = '';

        // Check credentials
        MBR.findOne({id: user_id, password: password}).exec(function(err, data){
            if (err){
                error_message = "Something went wrong while fetching data.";
                Logger.log("MBR","[Service Down]"+error_message);
            }
            else if (!data){
                
                error_message = "The credentials are not matched. Try again with correct credentials.";
                Logger.log("MBR","[Wrong Credentials] for user id [ "+user_id+" ] :  "+error_message);
            }
            if (error_message == ''){

                Logger.log("MBR","[Success] Login Successful for user id : [ "+user_id+" ]");
                return res.send({
                    data: {
                        id: data.id, name: data.name, email: data.email, phone: data.phone, 
                        mailing_address: data.mailing_address, employer_name: data.employer_name, 
                        status: data.status, MlsID: data.MlsID, mortgage_value: data.mortgage_value,
                        employment_duration: data.employment_duration, employee_salary: data.employee_salary,
                        employee_ID: data.employee_ID, insured_value: data.insured_value, deductible_value: data.deductible_value,
                        EMP_confirmation: data.EMP_confirmation, INSinc_confirmation: data.INSinc_confirmation
                    },
                    error_message: error_message
                });  // Send data to show status
            }
            else{
                return res.send({
                    error_message: error_message
                });  // Send data to show status
            }
            
        });
    },

    // Function to validate user data from Employer side
    validateApplication: async function(req, res){
        // Fetch variables
        var employer_name = req.param("employer_name");
        var mortgageID = req.param("mortgageID");
        // var webServiceLinkID = req.param("webServiceLink").split('/')[4];   // https://stackoverflow.com/a/25965556
        var employeeName = req.param("employeeName");
        var employee_salary = req.param("salary");
        var employment_duration = req.param("employment_length");
        var employee_ID = req.param("employeeID");
        var authenticated = false;   // will be set to true if request is accepted
        var error_message = '';
        
        MBR.findOne({id: mortgageID, name: employeeName, employee_ID: employee_ID, employer_name: employer_name, status: "pending"}).exec(async function(err, data){
            if (err){
                error_message = "Something went wrong while fetching data.";
                Logger.log("MBR","[Service Down] while validating application! "+error_message);
            }
            else if (data){
                var updateData = await MBR.updateOne({id: mortgageID, name: employeeName, employer_name: employer_name, EMP_confirmation: 'false', status: "pending"})
                    .set({employment_duration: employment_duration, employee_salary: employee_salary, EMP_confirmation: 'true'});
                if (updateData){
                    Logger.log("MBR","[Success] for mortgage Id [ "+mortgageID+" ] :  Employer data submitted!!");
                    return res.send({
                        status: "ACCEPTED",
                        error_message: error_message
                    });
                }
                else {
                    error_message = "Something went wrong while updating request. Please try again later or check broker page for status.";
                    Logger.log("MBR","[UpdateStatusError] for mortgage Id [ "+mortgageID+" ] : "+error_message);
                    return res.send({
                        status: "ERROR",
                        error_message: error_message
                    });
                }
            }
            else {
                var updateData = await MBR.updateOne({id: mortgageID, status: 'pending', EMP_confirmation: 'false'})
                    .set({EMP_confirmation: 'false', status: 'rejected'});
                if (updateData){
                    error_message = 'Wrong data submitted. Application has been rejected.';
                    Logger.log("MBR","[RejectedApplication] for mortgage Id [ "+mortgageID+" ]");
                    return res.send({
                        status: "REJECTED",
                        error_message: error_message
                        
                    });
                }
                else {
                    error_message = "Something went wrong while updating request. Please try again later or check broker page for status.";
                    Logger.log("MBR","[UpdateStatusError] for mortgage Id [ "+mortgageID+" ] : "+error_message);
                    return res.send({
                        status: "ERROR",
                        error_message: error_message
                    });
                }
            }
            
        });

        // // Check credentials
        // MBR.findOne({id: mortgageID, name: employeeName, employer_name: employer_name, employee_salary: employee_salary, employment_duration: employment_duration, status: "pending"}).exec(async function(err, data){
        //     if (err){
        //         error_message = "Something went wrong while fetching data.";
        //         Logger.log("MBR","[Service Down] while validating application! "+error_message);
               
        //     }
        //     else if (!data){
        //         error_message = "Wrong data submitted. Application has been rejected.";
        //         // https://sailsjs.com/documentation/reference/waterline-orm/models/update-one
        //         var updateRequest = await MBR.updateOne({id: mortgageID, status: "pending"}).set({status: "rejected"});
        //         if (updateRequest){

        //             Logger.log("MBR","[RejectedApplication] for mortgage Id [ "+mortgageID+" ]");
        //             return res.send({
        //                 status: "REJECTED",
        //                 error_message: error_message
                        
        //             });
        //         }
        //         else{
        //             error_message = "Something went wrong while updating request. Please try again later or check broker page for status.";
        //             Logger.log("MBR","[UpdateStatusError] for mortgage Id [ "+mortgageID+" ] : "+error_message);
        //             return res.send({
        //                 status: "ERROR",
        //                 error_message: error_message
        //             });
        //         }
        //     }

        //     if (error_message == ''){

        //         // https://sailsjs.com/documentation/reference/waterline-orm/models/update-one
        //         var updateRequest = await MBR.updateOne({id: mortgageID, status: "pending"}).set({status: "accepted"});
        //         if (updateRequest){
        //             authenticated = true;
        //             Logger.log("MBR","[Success] for mortgage Id [ "+mortgageID+" ] :  Application Accepted!!");
        //             return res.send({
        //                 status: "ACCEPTED",
        //                 error_message: error_message
        //             });
        //         }
        //         else{
        //             error_message = "Something went wrong while updating request. Please try again later or check broker page for status.";
        //             Logger.log("MBR","[UpdateStatusError] for mortgage Id [ "+mortgageID+" ] :  "+error_message);
        //             return res.send({
        //                 status: "ERROR",
        //                 error_message: error_message
        //             });
        //         }
        //     }
        //     else {
        //         return res.send({
        //             status: "ERROR",
        //             error_message: error_message
        //         });  
        //     }
        // });        
        
    },

};

