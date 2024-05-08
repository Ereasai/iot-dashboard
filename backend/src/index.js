const express = require('express')
const app = express()
const port = 3001

const database = require('./database')

app.use(express.json())
app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "localhost");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
	res.setHeader(
	  "Access-Control-Allow-Headers",
	  "Content-Type, Access-Control-Allow-Headers"
	);
	next();
});

// higher order function for handling requests/responses
const handleDatabaseOperation = (operation) => (req, res) => {
	operation()
	.then(response => {
		res.status(200).send(response);
	})
	.catch(error => {
		res.status(500).send(error);
	})
}

app.get('/get-things', 
	handleDatabaseOperation(() => database.getThings()))

app.get('/get-value-metadata',
	handleDatabaseOperation(() => database.getValueMetadata()))

app.get('/get-value-logs/:valueID', (req, res) => {
	const { valueID } = req.params;
	const { timeStart, timeEnd } = req.query;
	handleDatabaseOperation(() => database.getValueLogs(valueID, timeStart, timeEnd))(req, res);
});

app.listen(port, () => {
	console.log(`app running on port ${port}.`)
});
