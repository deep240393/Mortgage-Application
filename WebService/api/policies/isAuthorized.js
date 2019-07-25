module.exports = function(req, res, next) {
    var token;
    console.log('Reached here');
    //Check if authorization header is present
    console.log("Headers" , req.headers);
    console.log("Authorization", req.headers['authorization']);
	if(req.headers && req.headers['authorization']) {
        //authorization header is present
        console.log('Reached here 1');
		var parts = req.headers['authorization'].split(' ');
		if(parts.length == 2) {
            console.log('Reached here 2');
			var scheme = parts[0];
			var credentials = parts[1];
			
			if(/^Bearer$/i.test(scheme)) {
                console.log('Reached here 3');
				token = credentials;
			}
		} else {
            console.log("Format err");
			return res.json(401, {err: 'Format is Authorization: Bearer [token]'});
		}
	} else {
        console.log("Auth err");
		//authorization header is not present
		return res.json(401, {err: 'No Authorization header was found'});
	}
	jwToken.verify(token, function(err, decoded) {
		if(err) {
            console.log("Wrong err")
			return res.json(401, {err: 'Invalid token'});
		}
		req.employee = decoded;
		next();
	});
};
