/**
 * MBRController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var Logger = require('./LoggerController');

//suporter function for generating unqiue mortgage id
function generateId(length){

    //Resource: https://developer.mozilla.org/en-US/docs/web/javascript/reference/global_objects/math/random

    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';

    for(var i = 0; i < length; i++){

        var randomIndex = Math.floor( Math.random() * characters.length )
        result += characters.charAt(randomIndex);
    }

    return result;
}

//suporter function for generating unqiue mortgage id
async function isUniqueMortgageId(value){
    
    var records = await MBR.find({ mortgage_ID: value });
    
    if(records.length == 0){
        return true;
    }else{
        return false;
    }
}

//This will generate a unqie mortgageId which is not currently in database
//@param length: length of MortgageId
//call with: var x = await generateIdUniqueMortgageId(mortgageIdLength)
async function generateIdUniqueMortgageId(length){

    var id = '';
    var isUnique = false;

    while(isUnique == false){
        id = generateId(length);
        isUnique = await isUniqueMortgageId(id);
    }

    return id;
}


module.exports = {

    newApplication: async function (req, res) {

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
        var enctyptedPassword = '';
        var mortgageID = generateIdUniqueMortgageId(8);
        
        console.log("[MBR] New application requested.");

        Logger.log("MBR", "[newApplication] Details: name:"+name+" email:"+email+" address:"+address+
            " phone:"+phone+" employer:"+employer+" employee_ID:"+employee_ID+" mortgage value:"+mortgage_value+
            " MlsID:"+MlsID);

        await mortgageID.then(function(result) {
            mortgageID = result
    
         })

       

        if (mortgage_value !== undefined && mortgage_value != '') {
            mortgage_value = mortgage_value.replace(",", "");   // remove commas from value
        }

        // encrypt the password. It is encrypted by Caesar cipher algorithm.
        // The key is 13.
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

        // https://stackoverflow.com/a/46181/8243992
        const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const nameRegexp = /^[A-Za-z\s]+$/;

        if (email === undefined || address === undefined || name === undefined || phone === undefined
            || employer === undefined || password === undefined || employee_ID === undefined ||
            mortgage_value === undefined || MlsID === undefined) {

            Logger.log("MBR", "[ValidationError][newApplication] Enter all the details!!");
            return res.send({ error_message: "Please enter all the details!" });
        }
        else if (email == '' || address == '' || name == '' || phone == '' ||
            employer == '' || password == '' || employee_ID == '' || mortgage_value == '' || MlsID == '') {

            Logger.log("MBR", "[ValidationError][newApplication] Employee details can not be null!!");
            return res.send({ error_message: "Employee details can not be null!!" });

        }
        else if (!emailRegexp.test(email.toLowerCase())) {
            Logger.log("MBR", "[ValidationError][newApplication] Email not valid - New application!! Email: "+email);
            return res.send({ error_message: "Email not valid" });
        }
        else if (!nameRegexp.test(name.toLowerCase())) {
            Logger.log("MBR", "[ValidationError][newApplication] Name not valid - New application!! Name: "+name);
            return res.send({ error_message: "Name not valid" });
        }
        else if (isNaN(mortgage_value) || parseFloat(mortgage_value) < 0) {
            Logger.log("MBR", "[ValidationError][newApplication] Mortgage Value not valid - New application!! Mortgage value: "+mortgage_value);
            return res.send({ error_message: "Mortgage Value not valid" });
        }
        else {
            // ORM to insert data into table
            // Here, the status will be "pending" for new application
            MBR.create({
                mortgage_ID: mortgageID,
                name: name,
                email: email,
                phone: phone,
                mailing_address: address,
                employer_name: employer,
                password: enctyptedPassword,
                employee_ID: employee_ID,
                MlsID: MlsID,
                mortgage_value: mortgage_value,
                status: "pending",
                EMP_confirmation: "false",
                INSinc_confirmation: "false",
            }, async function (err, MBRdata) {
                if (err) {

                    Logger.log("MBR", "[RegistrationError][newApplication] Error in registering new applicant: " + name);
                    return res.send({ error_message: err });
                }

                var fetch_data = await MBR.findOne({
                    name: name, email: email, phone: phone, mailing_address: address, mortgage_ID: mortgageID, 
                    employer_name: employer, password: enctyptedPassword, employee_ID: employee_ID, MlsID: MlsID,
                    mortgage_value: mortgage_value, status: "pending"
                }, function (err, row) {

                    Logger.log("MBR", "[Success][newApplication] New Application for " + name + " successfully created in MBR!");
                    delete row['password'];   // remove password from row because it should not be returned to frontend
                    return res.send({ data: row });
                });
            });
        }
    },

    check_credentials: function (req, res) {

        // Fetch the data
        var user_id = req.param("user_id");
        var password = req.param("password");
        var error_message = '';
        var enctyptedPassword = '';

        console.log("[MBR] check_credentials called.");

        Logger.log("MBR", "[check_credentials] Request to check credentials for mortgage ID: "+user_id);

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

        // Check credentials
        MBR.findOne({ mortgage_ID: user_id, password: enctyptedPassword }).exec(function (err, data) {
            if (err) {
                error_message = "Something went wrong while fetching data.";
                Logger.log("MBR", "[Service Down][check_credentials]" + error_message + " Error: " + err);
            }
            else if (!data) {

                error_message = "The credentials are not matched. Try again with correct credentials.";
                Logger.log("MBR", "[Wrong Credentials][check_credentials] for mortgage id [ " + user_id + " ] :  " + error_message);
            }
            if (error_message == '') {

                Logger.log("MBR", "[Success][check_credentials] Login Successful for mortgage id : [ " + user_id + " ]");
                return res.send({
                    data: {
                        id: data.id, mortgage_ID: data.mortgage_ID, name: data.name, email: data.email, phone: data.phone,
                        mailing_address: data.mailing_address, employer_name: data.employer_name,
                        status: data.status, MlsID: data.MlsID, mortgage_value: data.mortgage_value,
                        employment_duration: data.employment_duration, employee_salary: data.employee_salary,
                        employee_ID: data.employee_ID, insured_value: data.insured_value, deductible_value: data.deductible_value,
                        EMP_confirmation: data.EMP_confirmation, INSinc_confirmation: data.INSinc_confirmation
                    },
                    error_message: error_message
                });  // Send data to show status
            }
            else {
                Logger.log("MBR", "[Error][check_credentials] Login error mortgage id : [ " + user_id + " ], error message: " + error_message);
                return res.send({
                    error_message: error_message
                });  // Send data to show status
            }

        });
    },

    // Function to validate user data from Employer side
    validateApplication: async function (req, res) {
        // Fetch variables
        var employer_name = req.param("employer_name");
        var mortgageID = req.param("mortgageID");
        var employeeName = req.param("employeeName");
        var employee_salary = req.param("salary");
        var employment_duration = req.param("employment_length");
        var employee_ID = req.param("employeeID");
        var error_message = '';
        const nameRegexp = /^[A-Za-z\s]+$/;

        console.log("[MBR] validationApplication called from employer.");
        Logger.log("MBR", "[validateApplication][Employer] Requested to validate application. "+
            "Employee name:"+employeeName+" Employer name:"+employer_name+" MortgageID:"+mortgageID+
            " Employee salary:"+employee_salary+" Employment duration:"+employment_duration+" Employee ID:"+employee_ID);

        if (employee_salary !== undefined && employee_salary != '') {
            employee_salary = employee_salary.replace(",", "");
        }

        // Check if all parametes are passed
        if (employer_name === undefined || mortgageID === undefined || employeeName === undefined
            || employee_salary === undefined || employment_duration === undefined || employee_ID === undefined){
            error_message = "Please provide all parameters.";
            Logger.log("MBR", "[ValidationError][Employer] All parameters not passed from Employer");
            return res.send({
                status: "ERROR",
                error_message: error_message
            });
        }

        // Check if any parameter is not empty
        else if (employer_name == '' || mortgageID == '' || employeeName == ''
            || employee_salary == '' || employment_duration == '' || employee_ID == ''){
            error_message = "Any parameter cannot be null.";
            Logger.log("MBR", "[ValidationError][Employer] Empty value passed from Employer");
            return res.send({
                status: "ERROR",
                error_message: error_message
            });
        }

        else if (!nameRegexp.test(employeeName)) {
            error_message = "Employee name not valid.";
            Logger.log("MBR", "[ValidationError][Employer] Employee name not valid - value passed from Employer. Name: ", employeeName);
            return res.send({
                status: "ERROR",
                error_message: error_message
            });
        }
        else if (isNaN(employee_salary) || parseFloat(employee_salary) < 0) {
            error_message = "Employee salary not valid.";
            Logger.log("MBR", "[ValidationError][Employer] Employee salary not valid - value passed from Employer. Salary: ", employee_salary);
            return res.send({
                status: "ERROR",
                error_message: error_message
            });
        }

        MBR.findOne({ mortgage_ID: mortgageID }).exec(async function (err, data) {
            if (err) {
                // database connection error. Log error
                error_message = "Something went wrong while fetching data.";
                Logger.log("MBR", "[Service Down][Employer] while validating application from employer side! " + error_message);
                return res.send({
                    status: "ERROR",
                    error_message: error_message
                });
            }
            else if (!data) {
                // wrong id is submitted
                error_message = "No such data available with broker. Check with our IT department if your information submitted to broker matches our database.";
                Logger.log("MBR", "[Data Not Matched][Employer] while validating application from employer side! " + error_message);
                return res.send({
                    status: "ERROR",
                    error_message: error_message
                });
            }
            else {
                // id is matched
                var check_application = await MBR.findOne({ mortgage_ID: mortgageID, name: employeeName, employee_ID: employee_ID, employer_name: employer_name, status: 'pending' });
                if (!check_application) {
                    var check_status = await MBR.findOne({ mortgage_ID: mortgageID, name: employeeName, employee_ID: employee_ID, employer_name: employer_name });
                    if (!check_status && data.EMP_confirmation != 'true') {
                        // wrong data is submitted. Reject the application
                        var reject_application = await MBR.updateOne({ mortgage_ID: mortgageID }).set({ status: 'rejected' });
                        if (!reject_application) {
                            // database connection error. Log error
                            error_message = "Something went wrong while rejecting application.";
                            Logger.log("MBR", "[Service Down][Employer] while rejecting application from employer side! " + error_message);
                            return res.send({
                                status: "ERROR",
                                error_message: error_message
                            });
                        }
                        else {
                            // return response
                            error_message = "Application is rejected. Wrong data submitted.";
                            Logger.log("MBR", "[Rejected][Employer] for mortgage Id [ " + mortgageID + " ]");
                            return res.send({
                                status: "REJECTED",
                                error_message: error_message
                            });
                        }
                    }
                    else {
                        if (data.EMP_confirmation == 'true') {
                            error_message = "Application is already submitted.";
                            Logger.log("MBR", "[Application Already Submitted][Employer] for mortgage Id [ " + mortgageID + " ]: from employer side");
                            return res.send({
                                status: "ERROR",
                                error_message: error_message
                            });
                        }
                        // This loop will be only reached if application is already accepted or rejected
                        if (data.status == 'accepted') {
                            // Though it is not error message, it is written just to avoid ambiguity for employer
                            error_message = "Application is already accepted.";
                            Logger.log("MBR", "[Application Already Accepted][Employer] for mortgage Id [ " + mortgageID + " ]");
                            return res.send({
                                status: "ACCEPTED",
                                error_message: error_message
                            });
                        }
                        else {
                            // Though it is not error message, it is written just to avoid ambiguity for employer
                            error_message = "Application is already rejected.";
                            Logger.log("MBR", "[Application Already Rejected][Employer] for mortgage Id [ " + mortgageID + " ]");
                            return res.send({
                                status: "REJECTED",
                                error_message: error_message
                            });
                        }
                    }
                }
                else {
                    // Application status is pending
                    if (check_application.EMP_confirmation == 'true') {
                        // Data from employer is already submitted.
                        // Though it is not error message, it is written just to avoid ambiguity for employer
                        error_message = "Application is already submitted.";
                        Logger.log("MBR", "[Application Already Submitted][Employer] for mortgage Id [ " + mortgageID + " ]: from employer side");
                        return res.send({
                            status: "ERROR",
                            error_message: error_message
                        });
                    }
                    else {
                        if (check_application.INSinc_confirmation == 'true') {
                            // if data from INSinc is also validated, accept the application.
                            var updateData = await MBR.updateOne({ mortgage_ID: mortgageID, name: employeeName, employer_name: employer_name })
                                .set({ employment_duration: employment_duration, employee_salary: employee_salary, EMP_confirmation: 'true', status: 'accepted' });
                            if (!updateData) {
                                // This loop will only be reached if service is down
                                error_message = "Something went wrong while updating data. Please try again later";
                                Logger.log("MBR", "[Service Down][Employer] while validating application from employer side! " + error_message);
                                return res.send({
                                    status: "ERROR",
                                    error_message: error_message
                                });
                            }
                            else {
                                // Though it is not error message, it is written just to avoid ambiguity for employer
                                error_message = "Employer data matched. Application is accepted";
                                Logger.log("MBR", "[Success both portal][Employer] for mortgage Id [ " + mortgageID + " ]");
                                return res.send({
                                    status: "ACCEPTED",
                                    error_message: error_message
                                });
                            }
                        }
                        else {
                            // if data from INSinc is not validated yet, just update MBR table.
                            var updateData = await MBR.updateOne({ mortgage_ID: mortgageID, name: employeeName, employer_name: employer_name })
                                .set({ employment_duration: employment_duration, employee_salary: employee_salary, EMP_confirmation: 'true' });
                            if (!updateData) {
                                // This loop will only be reached if service is down
                                error_message = "Something went wrong while updating data. Please try again later";
                                Logger.log("MBR", "[Service Down][Employer] while validating application from employer side! " + error_message);
                                return res.send({
                                    status: "ERROR",
                                    error_message: error_message
                                });
                            }
                            else {
                                // Though it is not error message, it is written just to avoid ambiguity for employer
                                error_message = "Employer data matched. Employer data has been accepted. Insurance company has not submitted your data yet.";
                                Logger.log("MBR", "[Success employer portal][Employer] for mortgage Id [ " + mortgageID + " ]");
                                return res.send({
                                    status: "ACCEPTED",
                                    error_message: error_message
                                });
                            }
                        }
                    }
                }
            }
        });
    },

    insuranceUpdate: async function (req, res) {

        var mortgageID = req.param('MortID');
        var MlsID = req.param('MlsID');
        var name = req.param('FullName');
        var deductible_value = req.param('DeductableValue');
        var insured_value = req.param('InsuredValue');
        
        console.log("[MBR] insuranceUpdate called from insurance company.");
        Logger.log("MBR", "[insuranceUpdate][Insurance] insuranceUpdate called. MortgageID:"+mortgageID+
            " MlsID:"+MlsID+" Name:"+name+" Deductible value:"+deductible_value+" Insured value:"+insured_value);

        // Check if all parameters are passed
        if (mortgageID === undefined || MlsID === undefined || name === undefined || deductible_value === undefined
            || insured_value === undefined){
            error_message = "Please provide all parameters.";
            Logger.log("MBR", "[ValidationError][Insurance] All parameters not passed from INSinc");
            return res.send([error_message]);
        }

        // Check if any parameter is not empty
        else if (mortgageID == '' || MlsID == '' || name == '' || deductible_value == '' || insured_value == ''){
            error_message = "Any parameter cannot be null.";
            Logger.log("MBR", "[ValidationError][Insurance] Empty value passed from INSinc");
            return res.send([error_message]);
        }

        deductible_value = deductible_value.replace(",", "");
        insured_value = insured_value.replace(",", "");
        if (isNaN(deductible_value) || isNaN(insured_value) || parseFloat(deductible_value) < 0 || parseFloat(insured_value) < 0) {
            error_message = "Deductible or insured value is wrong.";
            Logger.log("MBR", "[ValidationError][Insurance] Wrong deductible or insured value passed from INSinc. Deductible value: ", deductible_value, " Insured value: ", insured_value);
            return res.send([error_message]);
        }

        MBR.findOne({mortgage_ID: mortgageID }).exec(async function (err, data) {
            if (err) {
                // database connection error. Log error
                error_message = "Something went wrong while fetching data.";
                Logger.log("MBR", "[Service Down][Insurance] while validating application from RE side! " + error_message);
                return res.send([error_message]);
            }
            else if (!data) {
                // wrong id is submitted
                error_message = "No such data available with broker. Check with our IT department if your information submitted to broker matches our database.";
                Logger.log("MBR", "[Data Not Matched][Insurance] while validating application from RE side! " + error_message);
                return res.send([error_message]);
            }
            else {
                // id is matched
                var check_application = await MBR.findOne({mortgage_ID: mortgageID, name: name, MlsID: MlsID, status: 'pending' });
                if (!check_application) {
                    var check_status = await MBR.findOne({mortgage_ID: mortgageID, name: name, MlsID: MlsID });
                    if (!check_status && data.INSinc_confirmation != 'true') {
                        // wrong data is submitted. Reject the application
                        var reject_application = await MBR.updateOne({ mortgage_ID: mortgageID }).set({ status: 'rejected' });
                        if (!reject_application) {
                            // database connection error. Log error
                            error_message = "Something went wrong while rejecting application.";
                            Logger.log("MBR", "[Service Down][Insurance] while rejecting application from RE side! " + error_message);
                            return res.send([error_message]);
                        }
                        else {
                            // return response
                            error_message = "Application is rejected. Wrong data submitted.";
                            Logger.log("MBR", "[Rejected][Insurance] for mortgage Id [ " + mortgageID + " ]");
                            return res.send([error_message]);
                        }
                    }
                    else {
                        if (data.INSinc_confirmation == 'true') {
                            error_message = "Application is already submitted.";
                            Logger.log("MBR", "[Application Already Submitted][Insurance] for mortgage Id [ " + mortgageID + " ]: from RE side");
                            return res.ok();
                        }
                        // This loop will be only reached if application is already accepted or rejected
                        if (data.status == 'accepted') {
                            // Though it is not error message, it is written just to avoid ambiguity for employer
                            error_message = "Application is already accepted.";
                            Logger.log("MBR", "[Application Already Accepted][Insurance] for mortgage Id [ " + mortgageID + " ]");
                            return res.ok();
                        }
                        else {
                            // Though it is not error message, it is written just to avoid ambiguity for employer
                            error_message = "Application is already rejected.";
                            Logger.log("MBR", "[Application Already Rejected][Insurance] for mortgage Id [ " + mortgageID + " ]");
                            return res.send([error_message]);
                        }
                    }
                }
                else {
                    // Application status is pending
                    if (check_application.INSinc_confirmation == 'true') {
                        // Data from employer is already submitted.
                        // Though it is not error message, it is written just to avoid ambiguity for employer
                        error_message = "Application is already submitted.";
                        Logger.log("MBR", "[Application Already Submitted][Insurance] for mortgage Id [ " + mortgageID + " ]: from RE side");
                        return res.ok();
                    }
                    else {
                        if (check_application.EMP_confirmation == 'true') {
                            // if data from employer is also validated, accept the application.
                            var updateData = await MBR.updateOne({ mortgage_ID: mortgageID, name: name, MlsID: MlsID })
                                .set({ insured_value: insured_value, deductible_value: deductible_value, INSinc_confirmation: 'true', status: 'accepted' });
                            if (!updateData) {
                                // This loop will only be reached if service is down
                                error_message = "Something went wrong while updating data. Please try again later";
                                Logger.log("MBR", "[Service Down][Insurance] while validating application from RE side! " + error_message);
                                return res.send([error_message]);
                            }
                            else {
                                // Though it is not error message, it is written just to avoid ambiguity for employer
                                error_message = "RE data matched. Application is accepted";
                                Logger.log("MBR", "[Success both portal][Insurance] for mortgage Id [ " + mortgageID + " ]");
                                return res.ok();
                            }
                        }
                        else {
                            // if data from INSinc is not validated yet, just update MBR table.
                            var updateData = await MBR.updateOne({ mortgage_ID: mortgageID, name: name, MlsID: MlsID })
                                .set({ insured_value: insured_value, deductible_value: deductible_value, INSinc_confirmation: 'true' });
                            if (!updateData) {
                                // This loop will only be reached if service is down
                                error_message = "Something went wrong while updating data. Please try again later";
                                Logger.log("MBR", "[Service Down][Insurance] while validating application from RE side! " + error_message);
                                return res.send([error_message]);
                            }
                            else {
                                // Though it is not error message, it is written just to avoid ambiguity for employer
                                error_message = "Employer data matched. RE data has been accepted. Employer company has not submitted your data yet.";
                                Logger.log("MBR", "[Success RE portal][Insurance] for mortgage Id [ " + mortgageID + " ]");
                                return res.ok();
                            }
                        }
                    }
                }
            }
        });
    },

};

