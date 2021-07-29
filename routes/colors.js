const colors = require('../data/colors.json');

async function handler(req, res, next) {
	try {
		res.status(200).json(colors);
	} catch (e) {
		next(e);
	}
}

module.exports = handler;
