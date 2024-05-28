const express = require('express')
const app = express()
const port = 3001

const database = require('./database')

app.use(express.json())
app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
	res.setHeader(
	  "Access-Control-Allow-Headers",
	  "Content-Type, Access-Control-Allow-Headers"
	);
	next();
});

// higher order function for handling requests/responses + error
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

app.get('/get-value-logs-by-thing-value', (req, res) => {
	const { thing, value, interval, start, end, latest } = req.query
	handleDatabaseOperation(() => database.getValueLogsByThingValue(thing, value, interval, start, end, latest))(req, res);
});



app.get('/get-value-names-by-tag', (req, res) => {
	const tag = req.query.tag;
	handleDatabaseOperation(() => database.getValueNamesByTag(tag))(req, res);
});

app.get('/get-things-by-value-tags/', (req, res) => {
	const valueName = req.query.valueName;
	const tagNames = req.query.tagNames.split(',');
	handleDatabaseOperation(() => database.getThingsByValueTags(valueName, tagNames))(req, res);
});

app.get('/get-tags-by-things/', (req, res) => {
	const things = req.query.things.split(',');
	handleDatabaseOperation(() => database.getTagsByThings(things))(req, res);
});




app.get('/get-value-tags/',
	handleDatabaseOperation(() => database.getValueTags()));


app.listen(port, () => {
	console.log(`app running on port ${port}.`)
});
