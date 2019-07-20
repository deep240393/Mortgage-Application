/**
 * MBRController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var Logger = require('./LoggerController');

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

        if (mortgage_value !== undefined && mortgage_value != '') {
            mortgage_value = mortgage_value.replace(",", "");   // remove commas from value
        }

        // https://stackoverflow.com/a/46181/8243992
        const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const nameRegexp = /^[A-Za-z\s]+$/;

        if (email === undefined || address === undefined || name === undefined || phone === undefined
            || employer === undefined || password === undefined || employee_ID === undefined ||
            mortgage_value === undefined || MlsID === undefined) {

            Logger.log("MBR", "[ValidationError] Enter all the details!!");
            return res.send({ error_message: "Please enter all the details!" });
        }
        else if (email == '' || address == '' || name == '' || phone == '' ||
            employer == '' || password == '' || employee_ID == '' || mortgage_value == '' || MlsID == '') {

            Logger.log("MBR", "[ValidationError] Employee details can not be null!!");
            return res.send({ error_message: "Employee details can not be null!!" });

        }
        else if (!emailRegexp.test(email.toLowerCase())) {
            Logger.log("MBR", "[ValidationError] Email not valid - New application!!");
            return res.send({ error_message: "Email not valid" });
        }
        else if (!nameRegexp.test(name.toLowerCase())) {
            Logger.log("MBR", "[ValidationError] Name not valid - New application!!");
            return res.send({ error_message: "Name not valid" });
        }
        else if (isNaN(mortgage_value) || parseFloat(mortgage_value) < 0) {
            Logger.log("MBR", "[ValidationError] Mortgage Value not valid - New application!!");
            return res.send({ error_message: "Mortgage Value not valid" });
        }
        else {
            // ORM to insert data into table
            // Here, the status will be "pending" for new application
            MBR.create({
                name: name,
                email: email,
                phone: phone,
                mailing_address: address,
                employer_name: employer,
                password: password,
                employee_ID: employee_ID,
                MlsID: MlsID,
                mortgage_value: mortgage_value,
                status: "pending",
                EMP_confirmation: "false",
                INSinc_confirmation: "false",
            }, async function (err, MBRdata) {
                if (err) {

                    Logger.log("MBR", "[RegistrationError] Error in registering new applicant  " + name);
                    return res.send({ data: err });
                }

                var fetch_data = await MBR.findOne({
                    name: name, email: email, phone: phone, mailing_address: address,
                    employer_name: employer, password: password, employee_ID: employee_ID, MlsID: MlsID,
                    mortgage_value: mortgage_value, status: "pending"
                }, function (err, row) {

                    Logger.log("MBR", "[Success] New Application for " + name + " successfully created in MBR!");
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

        // Check credentials
        MBR.findOne({ id: user_id, password: password }).exec(function (err, data) {
            if (err) {
                error_message = "Something went wrong while fetching data.";
                Logger.log("MBR", "[Service Down]" + error_message);
            }
            else if (!data) {

                error_message = "The credentials are not matched. Try again with correct credentials.";
                Logger.log("MBR", "[Wrong Credentials] for user id [ " + user_id + " ] :  " + error_message);
            }
            if (error_message == '') {

                Logger.log("MBR", "[Success] Login Successful for user id : [ " + user_id + " ]");
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
            else {
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

        if (employee_salary !== undefined && employee_salary != '') {
            employee_salary = employee_salary.replace(",", "");
        }

        // Check if all parametes are passed
        if (employer_name === undefined || mortgageID === undefined || employeeName === undefined
            || employee_salary === undefined || employment_duration === undefined || employee_ID === undefined){
            error_message = "Please provide all parameters.";
            Logger.log("MBR", "[ValidationError] All parameters not passed from Employer");
            return res.send({
                status: "ERROR",
                error_message: error_message
            });
        }

        // Check if any parameter is not empty
        else if (employer_name == '' || mortgageID == '' || employeeName == ''
            || employee_salary == '' || employment_duration == '' || employee_ID == ''){
            error_message = "Any parameter cannot be null.";
            Logger.log("MBR", "[ValidationError] Empty value passed from Employer");
            return res.send({
                status: "ERROR",
                error_message: error_message
            });
        }

        else if (!nameRegexp.test(employeeName)) {
            error_message = "Employee name not valid.";
            Logger.log("MBR", "[ValidationError] Employee name not valid - value passed from Employer. Name: ", employeeName);
            return res.send({
                status: "ERROR",
                error_message: error_message
            });
        }
        else if (isNaN(employee_salary) || parseFloat(employee_salary) < 0) {
            error_message = "Employee salary not valid.";
            Logger.log("MBR", "[ValidationError] Employee salary not valid - value passed from Employer. Salary: ", employee_salary);
            return res.send({
                status: "ERROR",
                error_message: error_message
            });
        }

        MBR.findOne({ id: mortgageID }).exec(async function (err, data) {
            if (err) {
                // database connection error. Log error
                error_message = "Something went wrong while fetching data.";
                Logger.log("MBR", "[Service Down] while validating application from employer side! " + error_message);
                return res.send({
                    status: "ERROR",
                    error_message: error_message
                });
            }
            else if (!data) {
                // wrong id is submitted
                error_message = "No such data available with broker. Check with our IT department if your information submitted to broker matches our database.";
                Logger.log("MBR", "[Data Not Matched] while validating application from employer side! " + error_message);
                return res.send({
                    status: "ERROR",
                    error_message: error_message
                });
            }
            else {
                // id is matched
                var check_application = await MBR.findOne({ id: mortgageID, name: employeeName, employee_ID: employee_ID, employer_name: employer_name, status: 'pending' });
                if (!check_application) {
                    var check_status = await MBR.findOne({ id: mortgageID, name: employeeName, employee_ID: employee_ID, employer_name: employer_name });
                    if (!check_status && data.EMP_confirmation != 'true') {
                        // wrong data is submitted. Reject the application
                        var reject_application = await MBR.updateOne({ id: mortgageID }).set({ status: 'rejected' });
                        if (!reject_application) {
                            // database connection error. Log error
                            error_message = "Something went wrong while rejecting application.";
                            Logger.log("MBR", "[Service Down] while rejecting application from employer side! " + error_message);
                            return res.send({
                                status: "ERROR",
                                error_message: error_message
                            });
                        }
                        else {
                            // return response
                            error_message = "Application is rejected. Wrong data submitted.";
                            Logger.log("MBR", "[Rejected] for mortgage Id [ " + mortgageID + " ]");
                            return res.send({
                                status: "REJECTED",
                                error_message: error_message
                            });
                        }
                    }
                    else {
                        if (data.EMP_confirmation == 'true') {
                            error_message = "Application is already submitted.";
                            Logger.log("MBR", "[Application Already Submitted] for mortgage Id [ " + mortgageID + " ]: from employer side");
                            return res.send({
                                status: "ERROR",
                                error_message: error_message
                            });
                        }
                        // This loop will be only reached if application is already accepted or rejected
                        if (data.status == 'accepted') {
                            // Though it is not error message, it is written just to avoid ambiguity for employer
                            error_message = "Application is already accepted.";
                            Logger.log("MBR", "[Application Already Accepted] for mortgage Id [ " + mortgageID + " ]");
                            return res.send({
                                status: "ACCEPTED",
                                error_message: error_message
                            });
                        }
                        else {
                            // Though it is not error message, it is written just to avoid ambiguity for employer
                            error_message = "Application is already rejected.";
                            Logger.log("MBR", "[Application Already Rejected] for mortgage Id [ " + mortgageID + " ]");
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
                        Logger.log("MBR", "[Application Already Submitted] for mortgage Id [ " + mortgageID + " ]: from employer side");
                        return res.send({
                            status: "ERROR",
                            error_message: error_message
                        });
                    }
                    else {
                        if (check_application.INSinc_confirmation == 'true') {
                            // if data from INSinc is also validated, accept the application.
                            var updateData = await MBR.updateOne({ id: mortgageID, name: employeeName, employer_name: employer_name })
                                .set({ employment_duration: employment_duration, employee_salary: employee_salary, EMP_confirmation: 'true', status: 'accepted' });
                            if (!updateData) {
                                // This loop will only be reached if service is down
                                error_message = "Something went wrong while updating data. Please try again later";
                                Logger.log("MBR", "[Service Down] while validating application from employer side! " + error_message);
                                return res.send({
                                    status: "ERROR",
                                    error_message: error_message
                                });
                            }
                            else {
                                // Though it is not error message, it is written just to avoid ambiguity for employer
                                error_message = "Employer data matched. Application is accepted";
                                Logger.log("MBR", "[Success both portal] for mortgage Id [ " + mortgageID + " ]");
                                return res.send({
                                    status: "ACCEPTED",
                                    error_message: error_message
                                });
                            }
                        }
                        else {
                            // if data from INSinc is not validated yet, just update MBR table.
                            var updateData = await MBR.updateOne({ id: mortgageID, name: employeeName, employer_name: employer_name })
                                .set({ employment_duration: employment_duration, employee_salary: employee_salary, EMP_confirmation: 'true' });
                            if (!updateData) {
                                // This loop will only be reached if service is down
                                error_message = "Something went wrong while updating data. Please try again later";
                                Logger.log("MBR", "[Service Down] while validating application from employer side! " + error_message);
                                return res.send({
                                    status: "ERROR",
                                    error_message: error_message
                                });
                            }
                            else {
                                // Though it is not error message, it is written just to avoid ambiguity for employer
                                error_message = "Employer data matched. Employer data has been accepted. Insurance company has not submitted your data yet.";
                                Logger.log("MBR", "[Success employer portal] for mortgage Id [ " + mortgageID + " ]");
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
        
        // Check if all parameters are passed
        if (mortgageID === undefined || MlsID === undefined || name === undefined || deductible_value === undefined
            || insured_value === undefined){
            error_message = "Please provide all parameters.";
            Logger.log("MBR", "[ValidationError] All parameters not passed from INSinc");
            return res.send([error_message]);
        }

        // Check if any parameter is not empty
        else if (mortgageID == '' || MlsID == '' || name == '' || deductible_value == '' || insured_value == ''){
            error_message = "Any parameter cannot be null.";
            Logger.log("MBR", "[ValidationError] Empty value passed from INSinc");
            return res.send([error_message]);
        }

        deductible_value = deductible_value.replace(",", "");
        insured_value = insured_value.replace(",", "");
        if (isNaN(deductible_value) || isNaN(insured_value) || parseFloat(deductible_value) < 0 || parseFloat(insured_value) < 0) {
            error_message = "Deductible or insured value is wrong.";
            Logger.log("MBR", "[ValidationError] Wrong deductible or insured value passed from INSinc. Deductible value: ", deductible_value, " Insured value: ", insured_value);
            return res.send([error_message]);
        }

        MBR.findOne({ id: mortgageID }).exec(async function (err, data) {
            if (err) {
                // database connection error. Log error
                error_message = "Something went wrong while fetching data.";
                Logger.log("MBR", "[Service Down] while validating application from RE side! " + error_message);
                return res.send([error_message]);
            }
            else if (!data) {
                // wrong id is submitted
                error_message = "No such data available with broker. Check with our IT department if your information submitted to broker matches our database.";
                Logger.log("MBR", "[Data Not Matched] while validating application from RE side! " + error_message);
                return res.send([error_message]);
            }
            else {
                // id is matched
                var check_application = await MBR.findOne({ id: mortgageID, name: name, MlsID: MlsID, status: 'pending' });
                if (!check_application) {
                    var check_status = await MBR.findOne({ id: mortgageID, name: name, MlsID: MlsID });
                    if (!check_status && data.INSinc_confirmation != 'true') {
                        // wrong data is submitted. Reject the application
                        var reject_application = await MBR.updateOne({ id: mortgageID }).set({ status: 'rejected' });
                        if (!reject_application) {
                            // database connection error. Log error
                            error_message = "Something went wrong while rejecting application.";
                            Logger.log("MBR", "[Service Down] while rejecting application from RE side! " + error_message);
                            return res.send([error_message]);
                        }
                        else {
                            // return response
                            error_message = "Application is rejected. Wrong data submitted.";
                            Logger.log("MBR", "[Rejected] for mortgage Id [ " + mortgageID + " ]");
                            return res.send([error_message]);
                        }
                    }
                    else {
                        if (data.INSinc_confirmation == 'true') {
                            error_message = "Application is already submitted.";
                            Logger.log("MBR", "[Application Already Submitted] for mortgage Id [ " + mortgageID + " ]: from RE side");
                            return res.ok();
                        }
                        // This loop will be only reached if application is already accepted or rejected
                        if (data.status == 'accepted') {
                            // Though it is not error message, it is written just to avoid ambiguity for employer
                            error_message = "Application is already accepted.";
                            Logger.log("MBR", "[Application Already Accepted] for mortgage Id [ " + mortgageID + " ]");
                            return res.ok();
                        }
                        else {
                            // Though it is not error message, it is written just to avoid ambiguity for employer
                            error_message = "Application is already rejected.";
                            Logger.log("MBR", "[Application Already Rejected] for mortgage Id [ " + mortgageID + " ]");
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
                        Logger.log("MBR", "[Application Already Submitted] for mortgage Id [ " + mortgageID + " ]: from RE side");
                        return res.ok();
                    }
                    else {
                        if (check_application.EMP_confirmation == 'true') {
                            // if data from employer is also validated, accept the application.
                            var updateData = await MBR.updateOne({ id: mortgageID, name: name, MlsID: MlsID })
                                .set({ insured_value: insured_value, deductible_value: deductible_value, INSinc_confirmation: 'true', status: 'accepted' });
                            if (!updateData) {
                                // This loop will only be reached if service is down
                                error_message = "Something went wrong while updating data. Please try again later";
                                Logger.log("MBR", "[Service Down] while validating application from RE side! " + error_message);
                                return res.send([error_message]);
                            }
                            else {
                                // Though it is not error message, it is written just to avoid ambiguity for employer
                                error_message = "RE data matched. Application is accepted";
                                Logger.log("MBR", "[Success both portal] for mortgage Id [ " + mortgageID + " ]");
                                return res.ok();
                            }
                        }
                        else {
                            // if data from INSinc is not validated yet, just update MBR table.
                            var updateData = await MBR.updateOne({ id: mortgageID, name: name, MlsID: MlsID })
                                .set({ insured_value: insured_value, deductible_value: deductible_value, INSinc_confirmation: 'true' });
                            if (!updateData) {
                                // This loop will only be reached if service is down
                                error_message = "Something went wrong while updating data. Please try again later";
                                Logger.log("MBR", "[Service Down] while validating application from RE side! " + error_message);
                                return res.send([error_message]);
                            }
                            else {
                                // Though it is not error message, it is written just to avoid ambiguity for employer
                                error_message = "Employer data matched. RE data has been accepted. Employer company has not submitted your data yet.";
                                Logger.log("MBR", "[Success RE portal] for mortgage Id [ " + mortgageID + " ]");
                                return res.ok();
                            }
                        }
                    }
                }
            }
        });
    },

};

