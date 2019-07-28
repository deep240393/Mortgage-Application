/**
 * EmployerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var Logger = require('./LoggerController');
var bcrypt = require('bcrypt');

module.exports = {

    authenticate: function (req, res) {

        console.log("[Employer][Authentication] authentication requested");

        var authorized = false;
        var errorMessage = "";
        var id = req.param('id');
        var password = req.param('pwd');
        var enctyptedPassword = '';
        var token = ''

        Logger.log("Employer", "[Employer][authenticate] Authentication requested for employee ID:"+id);

        // encrypt the password which will be sent in request
        if (password !== undefined && password != '') {
            // http://codeniro.com/caesars-cipher-algorithm-javascript/

            for (var i = 0; i < password.length; i++) {
                var c = password.charCodeAt(i);
                if (c >= 65 && c <= 90) {
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



        if (id === undefined || password === undefined) {

            Logger.log("Employer", "[ValidationError] Enter all the details!!");
            return res.send({ ErrorMessage: "Please enter all the details!" });
        }
        else if (id == '' || password == '') {

            Logger.log("Employer", "[ValidationError] Employee details can not be null!!");
            return res.send({ ErrorMessage: "Employee details can not be null!!" });

        }
        else {


            Employer.findOne({ employeeID: id, userPassword: enctyptedPassword }).exec(function (err, employee) {
                //Database error
                if (err) {

                    authorized = false;
                    errorMessage = "We are having troubles connecting to the database, please try again later";
                    Logger.log("Employer", "[Authentication] Troubles connecting to Employer database. Error: "+err);

                    //If undefined, employee does not exist
                } else if (!employee) {

                    authorized = false;
                    errorMessage = "Incorrect credentials, please try again";
                    Logger.log("Employer", "[Authentication] Employee not found in Employer database for employee ID: "+id);


                    //If found, user credientials are valid    
                } else {
                        Logger.log("Employer", "[Authentication] Employee successfully found in Employer database. Employee ID: "+id);
                        //password is a match
                        authorized = true,
                        employee = employee,
                        token = jwToken.sign(employee)
                        Logger.log("Employer", "[Employer] Token generated for Employee: "+id+" Token:"+token);
                }

                //return results
                return res.jsonp(
                    {
                        Authorized: authorized,
                        ErrorMessage: errorMessage,
                        Token: token,
                        Employee: employee
                    });

            });
        }
    },

    retrieveData: function (req, res) {

        console.log("[Employer][retrieveData] Request to retrieve data");

        var id = req.param('id');
        var errorMessage = "";
        Logger.log("Employer", "[retrieveData] Request to retrieve data for employee ID: "+id);

        Employer.findOne({ employeeID: id }).exec(function (err, employee) {

            //Database error
            if (err) {
                errorMessage = "We are having troubles connecting to the database, please try again later";
                Logger.log("Employer", "[retrieveData] Troubles connecting to Employer database. Error: "+err);
            }


            if (employee) {
                errorMessage = "Success"
                Logger.log("Employer", "[retrieveData] Employee data successfully retrieved found in Employer database. Employee ID: "+id);

            } else {
                errorMessage = "Employee not found";
                Logger.log("Employer", "[retrieveData] Employee data was not retrieved from Employer database. Employee ID: "+id);
            }

            //return results
            return res.jsonp(
                {
                    Employee: employee,
                    ErrorMessage: errorMessage
                });

        });

    }

};

