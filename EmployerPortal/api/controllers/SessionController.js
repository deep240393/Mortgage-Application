/**
 * SessionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    userid: function(req,res){

        //get the ID which was passed from the login screen
        var id = req.param('id');
        var firstName = req.param('userFirstName');
        var lastName = req.param('userLastName');
        req.session.userid = id;
        req.session.firstName = firstName;
        req.session.lastName = lastName;

        return res.view('pages/form', {userId: id, firstName: firstName, lastName: lastName});
    }

};

