const express = require('express');
const app = express();

const { PORT } = process.env;

app.use('/', express.static('./public'));

app.get('/colors', require('./routes/colors.js'));

async function init(port) {
	await app.listen(port);
	console.log(`app listening at ${port}`);
}

init(PORT);
