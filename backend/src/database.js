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
};

const getValueTags = async () => {
	try {
		return await new Promise( (resolve, reject) => {
			pool.query(`
			SELECT name, array_agg(value_id) AS value_ids
			FROM value_tags
			WHERE name NOT IN (SELECT thing_name FROM things)
			GROUP BY name;
			`, (error, results) => {
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
};

const getValueLogs = async (valueID, timeStart, timeEnd) => {

	console.log("!!! getValueLogs()")
	console.log("valueID:", valueID)
	console.log("timeStart:", timeStart)
	console.log("timeEnd:", timeEnd)

	let queryText = '';

	// quick solution for real-time query.
	if (timeStart == undefined || timeEnd == undefined) {
		console.log(">>> Getting real-time data.");
		queryText = `SELECT * 
		FROM value_logs
		WHERE created_at 
		BETWEEN (NOW() AT TIME ZONE 'Asia/Seoul' - INTERVAL '2 minute') 
		AND NOW() AT TIME ZONE 'Asia/Seoul'
		AND value_id = ${valueID}
		ORDER BY created_at`;
	}
	else {
		console.log(">>> Getting historic data");
		queryText  = 
		` SELECT *
		FROM value_logs
		WHERE created_at BETWEEN ${timeStart} AND ${timeEnd}
		AND value_id = ${valueID}
		ORDER BY created_at`;
	}

	try {
		return await new Promise( (resolve, reject) => {
			pool.query(queryText, (error, results) => {
				if (error) reject(error)
				if (results && results.rows) {
					console.log("!!! success.")
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

const getValueLogsByThingValue = async (thing, value, interval='1 minute') => {
	try {
		return await new Promise((resolve, reject) => {

			console.log(">>> getValueLogsByThingValue()");
			console.log("thing:", thing);
			console.log("value:", value);

			const query = `
			SELECT vl.created_at, vl.value, vl.value_string
			FROM value_logs vl
			JOIN values v ON v.value_id = vl.value_id
			JOIN things t ON t.thing_id = v.thing_id
			WHERE t.thing_name = '${thing}'
			AND v.value_name = '${value}'
			AND vl.created_at 
			BETWEEN (NOW() AT TIME ZONE 'Asia/Seoul' - INTERVAL '${interval}') 
					AND NOW() AT TIME ZONE 'Asia/Seoul'
			ORDER BY vl.created_at DESC`;

			console.log("query:", query);
			
			pool.query(query, (error, results) => {
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
};

const getThingsByValueTags = async (valueName, tagNames) => {
	try {
		return await new Promise( (resolve, reject) => {

			console.log(">>> getThingsByValueTags()");
			console.log("valueName:", valueName);
			console.log("tagNames:", tagNames);
			console.log("tagNamesStr:", tagNames.join(', '));

			// const query = `
			// 	SELECT t.thing_name AS thing_name
			// 	FROM things t
			// 	JOIN values v ON v.thing_id = t.thing_id
			// 	JOIN value_tags vt ON vt.value_id = v.value_id
			// 	WHERE v.value_name = '${valueName}'
			// 	${tagNames.map((t) => `AND vt.name = '${t}'`).join(' ')}
			// 	`;

			const query = `
				SELECT t.thing_name
				FROM things t
				JOIN values v ON v.thing_id = t.thing_id
				JOIN value_tags vt ON vt.value_id = v.value_id
				WHERE v.value_name = '${valueName}'
				AND vt.name IN ('${tagNames.join('\', \'')}')
				GROUP BY t.thing_name
				HAVING COUNT(DISTINCT vt.name) = ${tagNames.length};			
			`

			console.log("query:", query);
			
			pool.query(query, (error, results) => {
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
};


const getValueNamesByTag = async (tag) => {
	try {
		return await new Promise( (resolve, reject) => {

			console.log(">>> getValueNamesByTag()");
			console.log("tag:", tag);

			const query = `
			SELECT DISTINCT v.value_name
			FROM values v
			JOIN value_tags vt ON vt.value_id = v.value_id
			WHERE vt.name = '${tag}'`;

			console.log("query:", query);
			
			pool.query(query, (error, results) => {
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
};

const getTagsByThings = async (things) => {
	try {
		return await new Promise( (resolve, reject) => {

			console.log(">>> getTagNamesByThings()");
			console.log("things:", things.join(', '));

			// const query = `
			// SELECT DISTINCT v.value_name
			// FROM values v
			// JOIN value_tags vt ON vt.value_id = v.value_id
			// WHERE vt.name = '${tag}'`;

			const query = `
			SELECT DISTINCT 
				vt.name as tag_name,
				CASE
					WHEN vt.name IN (SELECT thing_name FROM things) THEN TRUE
					ELSE FALSE
				END AS is_thing
			FROM value_tags vt
			JOIN values v ON v.value_id = vt.value_id
			JOIN things t ON t.thing_id = v.thing_id
			WHERE t.thing_name IN ('${things.join(',')}')
			`;

			console.log("query:", query);
			
			pool.query(query, (error, results) => {
				if (error) reject(error)
				if (results && results.rows) {
					console.log('>>> success!');
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
};


module.exports = {
	getThings,
	getValueMetadata,
	getValueLogs,
	getValueLogsByThingValue, // better version
	getValueTags,
	getThingsByValueTags,
	getValueNamesByTag,
	getTagsByThings,
}
