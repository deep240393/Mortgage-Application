var Logger = require('../controllers/LoggerController');
var jwt = require('jsonwebtoken');

module.exports = {
	'sign': function(payload) {
		Logger.log("jwToken", "[sign] Generating token");
		return jwt.sign({
			data: payload
		}, 'mysecret', {expiresIn: '1m'});
	},
	'verify': function(token, callback) {
		Logger.log("jwToken", "[verify] Verifying token: "+token);
		jwt.verify(token, 'mysecret', callback);
	}
};