
var jwt = require('jsonwebtoken');

module.exports = {
	'sign': function(payload) {
		return jwt.sign({
			data: payload
		}, 'mysecret', {expiresIn: '1m'});
	},
	'verify': function(token, callback) {
		jwt.verify(token, 'mysecret', callback);
	}
};