require('dotenv').config();

console.log('Pool setting:');
console.log({user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT});

const Pool = require('pg').Pool;
const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASS,
	port: process.env.DB_PORT,
});

const getThings = async () => {

	try {
		return await new Promise( (resolve, reject) => {
			pool.query("SELECT * FROM things", (error, results) => {
				if (error) reject(error)
				if (results && results.rows) {
					resolve(results.rows);
				} else {
					reject(new Error("No results found"));
				}
			})
		})
	}
	catch (error_1) {
		console.error(error_1);
		throw new Error("Internal server error");
	}
}

const getValueMetadata = async () => {

	try {
		return await new Promise( (resolve, reject) => {
			pool.query("SELECT * FROM values", (error, results) => {
				if (error) reject(error)
				if (results && results.rows) {
					resolve(results.rows);
				} else {
					reject(new Error("No results found"));
				}
			})
		})
	}
	catch (error_1) {
		console.error(error_1);
		throw new Error("Internal server error");
	}
}

const getValueLogs = async (valueID, timeStart, timeEnd) => {

	const queryText = 
		`SELECT * 
		FROM value_logs
		WHERE created_at 
		BETWEEN (NOW() AT TIME ZONE 'Asia/Seoul' - INTERVAL '2 minute') 
		AND NOW() AT TIME ZONE 'Asia/Seoul'
		AND value_id = ${valueID}
		ORDER BY created_at`

	try {
		return await new Promise( (resolve, reject) => {
			pool.query(queryText, (error, results) => {
				if (error) reject(error)
				if (results && results.rows) {
					resolve(results.rows);
				} else {
					reject(new Error("No results found"));
				}
			})
		})
	}
	catch (error_1) {
		console.error(error_1);
		throw new Error("Internal server error");
	}
}

module.exports = {
	getThings,
	getValueMetadata,
	getValueLogs,
}
