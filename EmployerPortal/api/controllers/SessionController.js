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
        req.session.userid = id;
        
        //[SessionController / debug] user id now stred in req.session.userid
        console.log("[SessionController] Session userid: " + req.session.userid)

        return res.view('pages/form', {userId: id});
    }

};

