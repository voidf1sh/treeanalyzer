const dotenv = require('dotenv');
dotenv.config();
const debugMode = process.env.DEBUG || true;
const mysql = require('mysql');
const { GuildInfo } = require('./CustomClasses.js');

/* Table Structures
guild_info
+------------------------+-------------+------+-----+---------+----------------+
| Field                  | Type        | Null | Key | Default | Extra          |
+------------------------+-------------+------+-----+---------+----------------+
| guild_id               | varchar(50) | NO   | PRI | NULL    | auto_increment |
| tree_name				 | varchar(100)| NO   |     |         |				   |
| tree_height            | varchar(10) | NO   |     | 0       |                |
| tree_message_id        | varchar(50) | NO   |     |         |                |
| tree_channel_id        | varchar(50) | NO   |     |         |                |
| leaderboard_message_id | varchar(50) | NO   |     |         |                |
| leaderboard_channel_id | varchar(50) | NO   |     |         |                |
+------------------------+-------------+------+-----+---------+----------------+
*/
/*
leaderboard
+-------------+--------------+------+-----+---------+----------------+
| Field       | Type         | Null | Key | Default | Extra          |
+-------------+--------------+------+-----+---------+----------------+
| id          | int(10)      | NO   | PRI | NULL    | auto_increment |
| guild_id    | varchar(50)  | NO   |     |         |                |
| tree_name   | varchar(100) | NO   |     |         |                |
| tree_rank   | int(10)      | NO   |     |         |                |
| tree_height | int(10)      | NO   |     | 1       |                |
| has_pin     | tinyint(1)   | NO   |     | 0       |                |
| timestamp   | varchar(50)  | NO   |     |         |                |
+-------------+--------------+------+-----+---------+----------------+
*/

module.exports = {
	getGuildInfo(guildId) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Get a server's tree information from the database
		const selectGuildInfoQuery = `SELECT * FROM guild_info WHERE guild_id = ${db.escape(guildId)}`;
		// TODO run this query and return a promise then structure the output into a GuildInfo object. resolve with { "status": , "data": guildInfo }
		return new Promise((resolve, reject) => {
			db.query(selectGuildInfoQuery, (err, res) => {
				if (err) {
					console.error(err);
					reject("Error fetching guild information: " + err.message);
					db.end();
					return;
				}
				if (res.length == 0) {
					reject("There is no database entry for your guild yet. Try running /setup");
					db.end();
					return;
				}
				row = res[0];
				const guildInfo = new GuildInfo()
					.setId(row.guild_id)
					.setName(row.tree_name)
					.setHeight(row.tree_height)
					.setTreeMessage(row.tree_message_id, row.tree_channel_id)
					.setLeaderboardMessage(row.leaderboard_message_id, row.leaderboard_channel_id)
					.setReminders(row.water_message, row.fruit_message, row.reminder_channel_id, row.watch_channel_id);

				db.end();
				resolve(guildInfo);
			});
		});
	},
	getAllGuildInfos() {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Get a server's tree information from the database
		const query = 'SELECT * FROM guild_info';
		// TODO run this query and return a promise then structure the output into a GuildInfo object. resolve with { "status": , "data": guildInfo }
		return new Promise((resolve, reject) => {
			db.query(query, (err, res) => {
				if (err) {
					console.error(err);
					reject("Error fetching all guild infos: " + err.message);
					db.end();
					return;
				}
				if (res.length == 0) {
					reject("There are no servers yet!");
					db.end();
					return;
				}
				let guildInfos = [];
				for (let i = 0; i < res.length; i++) {
					let row = res[i];
					guildInfos.push(new GuildInfo()
						.setId(row.guild_id)
						.setName(row.tree_name)
						.setHeight(row.tree_height)
						.setTreeMessage(row.tree_message_id, row.tree_channel_id)
						.setLeaderboardMessage(row.leaderboard_message_id, row.leaderboard_channel_id)
						.setReminders(row.water_message, row.fruit_message, row.reminder_channel_id, row.watch_channel_id)
					);
				}

				db.end();
				resolve(guildInfos);
			});
		});
	},
	setGuildInfo(query) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		return new Promise((resolve, reject) => {
			db.query(query, (err, res) => {
				if (err) {
					console.error(err);
					reject("Error setting the guild info: " + err.message);
					db.end();
					return;
				}
				db.end();
				resolve();
			});
		});
	},
	setTreeInfo(guildInfo) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Returns a Promise, resolve({ "status": "", "data": null })
		// guildInfo = { "guildId": "123", "treeName": "name", "treeHeight": 123, "treeMessageId": "123", "treeChannelId": "123", "leaderboardMessageId": "123", "leaderboardChannelId": "123"}
		// Set a server's tree information in the database)
		const insertGuildInfoQuery = `INSERT INTO guild_info (guild_id, tree_name, tree_height, tree_message_id, tree_channel_id) VALUES (${db.escape(guildInfo.guildId)}, ${db.escape(guildInfo.treeName)}, ${db.escape(guildInfo.treeHeight)},${db.escape(guildInfo.treeMessageId)}, ${db.escape(guildInfo.treeChannelId)}) ON DUPLICATE KEY UPDATE tree_name = ${db.escape(guildInfo.treeName)},tree_height = ${db.escape(guildInfo.treeHeight)},tree_message_id = ${db.escape(guildInfo.treeMessageId)},tree_channel_id = ${db.escape(guildInfo.treeChannelId)}`;
		// TODO run this query and return a promise, then resolve with { "status": , "data": null }
		return new Promise((resolve, reject) => {
			db.query(insertGuildInfoQuery, (err, res) => {
				if (err) {
					console.error(err);
					db.end();
					reject("Error setting the guild info: " + err.message);
					return;
				}
				db.end();
				resolve({ "status": "Successfully set the guild information", "data": null });
			});
		});
	},
	setLeaderboardInfo(guildInfo) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Returns a Promise, resolve({ "status": "", "data": null })
		// guildInfo = { "guildId": "123", "treeName": "name", "treeHeight": 123, "treeMessageId": "123", "treeChannelId": "123", "leaderboardMessageId": "123", "leaderboardChannelId": "123"}
		// Set a server's tree information in the database
		const insertGuildInfoQuery = `INSERT INTO guild_info (guild_id, leaderboard_message_id, leaderboard_channel_id) VALUES (${db.escape(guildInfo.guildId)}, ${db.escape(guildInfo.leaderboardMessageId)}, ${db.escape(guildInfo.leaderboardChannelId)}) ON DUPLICATE KEY UPDATE leaderboard_message_id = ${db.escape(guildInfo.leaderboardMessageId)},leaderboard_channel_id = ${db.escape(guildInfo.leaderboardChannelId)}`;
		// TODO run this query and return a promise, then resolve with { "status": , "data": null }
		return new Promise((resolve, reject) => {
			db.query(insertGuildInfoQuery, (err, res) => {
				if (err) {
					console.error(err);
					db.end();
					reject("Error setting the guild info: " + err.message);
					return;
				}
				db.end();
				resolve({ "status": "Successfully set the guild information", "data": null });
			});
		});
	},
	deleteGuildInfo(guildId) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Returns a Promise, resolve({ "status": "", "data": null })
		// guildInfo = { "guildId": "123", "treeName": "name", "treeHeight": 123, "treeMessageId": "123", "treeChannelId": "123", "leaderboardMessageId": "123", "leaderboardChannelId": "123"}
		// Set a server's tree information in the database
		const deleteGuildInfoQuery = `DELETE FROM guild_info WHERE guild_id = ${db.escape(guildId)}`;
		// TODO run this query and return a promise, then resolve with { "status": , "data": null }
		return new Promise((resolve, reject) => {
			db.query(deleteGuildInfoQuery, (err, res) => {
				if (err) {
					console.error(err);
					db.end();
					reject("Error deleting the guild info: " + err.message);
					return;
				}
				db.end();
				resolve({ "status": "Successfully deleted the guild information", "data": null });
			});
		});
	},
	getLeaderboard(guildId) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Returns a Promise, resolve({ "status": "", "data": leaderboard })
		const selectLeaderboardQuery = `SELECT id, tree_name, tree_rank, tree_height, has_pin FROM leaderboard WHERE guild_id = ${db.escape(guildId)} ORDER BY id DESC LIMIT 10`;
		// TODO run the query and return a promise then process the results. resolve with { "status": , "data": leaderboard }
		return new Promise((resolve, reject) => {
			db.query(selectLeaderboardQuery, (err, res) => {
				if (err) {
					console.error(err);
					db.end();
					reject("Error fetching the most recent leaderboard: " + err.message);
					return;
				}
				let leaderboard = [];
				res.forEach(row => {
					leaderboard.push({
						"treeName": row.tree_name,
						"treeRank": row.tree_rank,
						"treeHeight": row.tree_height,
						"hasPin": row.has_pin
					});
				});
				db.end();
				resolve({ "status": "Successfully fetched leaderboard.", "data": leaderboard });
			});
		});
	},
	uploadLeaderboard(leaderboard) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Returns a Promise, resolve({ "status": "", "data": res })
		// leaderboard = { "guildId": 1234, "entries": [ { "treeHeight": 12, "treeRank": 34, "treeName": "name", "hasPin": false }, {...}, {...} ] }
		const insertLeaderboardQuery = "INSERT INTO `leaderboard` (guild_id, tree_name, tree_rank, tree_height, has_pin) VALUES ?";
		const leaderboardValues = [];
		leaderboard.entries.forEach(ranking => {
			leaderboardValues.push([leaderboard.guildId, ranking.treeName, ranking.treeRank, ranking.treeHeight, ranking.hasPin]);
		});
		return new Promise((resolve, reject) => {
			db.query(insertLeaderboardQuery, [leaderboardValues], (err, res) => {
				if (err) {
					reject("Error uploading the leaderboard: " + err.message);
					db.end();
					console.error(err);
					return;
				}
				db.end();
				resolve({ "status": "Successfully uploaded the leaderboard", "data": res });
			});
		});
	},
	get24hTree(guildId, treeName) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Returns a Promise, resolve({ "status": "", "data": leaderboard })
		const select24hTreeQuery = `SELECT id, tree_name, tree_rank, tree_height, has_pin FROM leaderboard WHERE guild_id = ${db.escape(guildId)} AND tree_name = ${db.escape(treeName)} AND timestamp > date_sub(now(), interval 1 day) ORDER BY id ASC LIMIT 1`;
		// TODO run the query and return a promise then process the results. resolve with { "status": , "data": leaderboard }
		return new Promise((resolve, reject) => {
			db.query(select24hTreeQuery, (err, res) => {
				if (err) {
					console.error(err);
					db.end();
					reject("Error fetching the historic 24hr tree height: " + err.message);
					return;
				}
				let hist24hTree = {};
				if (res.length > 0) {
					hist24hTree = {
						"treeName": res[0].tree_name,
						"treeRank": res[0].tree_rank,
						"treeHeight": res[0].tree_height,
						"hasPin": res[0].has_pin
					}
				} else {
					hist24hTree = {

					}
				}

				db.end();
				resolve({ "status": "Successfully fetched historic 24hr tree.", "data": hist24hTree });
			});
		});
	},
	setReminderInfo(guildInfo) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Returns a Promise, resolve({ "status": "", "data": leaderboard })
		const insertReminderInfoQuery = `UPDATE guild_info SET waterMessage = ${db.escape(guildInfo.waterMessage)}, ping_channel_id = ${db.escape(reminderChannelId)}, fruit_message = ${db.escape(guildInfo.fruitMessage)} WHERE guild_id = ${db.escape(guildId)}`;
		// TODO run the query and return a promise then process the results. resolve with { "status": , "data": leaderboard }
		return new Promise((resolve, reject) => {
			db.query(insertReminderInfoQuery, (err, res) => {
				if (err) {
					console.error(err);
					db.end();
					reject("Error updating the reminder info: " + err.message);
					return;
				}
				db.end();
				resolve({ "status": `Your notification relay has been set up.\nWater Message: "${guildInfo.waterMessage}"\nFruit Message: "${guildInfo.fruitMessage}"\nRelay Channel: <#${guildInfo.reminderChannelId}>\nWatch Channel: <#${guildInfo.notificationChannelId}>`, "data": res });
			});
		});
	},
	setRemindedStatus(guildId, remindedStatus) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Returns a Promise, resolve({ "status": "", "data": leaderboard })
		const setRemindedStatusQuery = `UPDATE guild_info SET reminded_status = ${db.escape(remindedStatus)} WHERE guild_id = ${db.escape(guildId)}`;
		// TODO run the query and return a promise then process the results. resolve with { "status": , "data": leaderboard }
		return new Promise((resolve, reject) => {
			db.query(setRemindedStatusQuery, (err, res) => {
				if (err) {
					console.error(err);
					db.end();
					reject("Error updating the reminded status: " + err.message);
					return;
				}
				db.end();
				resolve({ "status": `Successfully set the reminded status to ${remindedStatus}`, "data": res });
				// console.log("Boop: " + remindedStatus);
			});
		});
	},
	setReminderOptIn(guildId, optIn) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Returns a Promise, resolve({ "status": "", "data": leaderboard })
		const setReminderOptInQuery = `UPDATE guild_info SET reminder_optin = ${db.escape(optIn)} WHERE guild_id = ${db.escape(guildId)}`;
		// TODO run the query and return a promise then process the results. resolve with { "status": , "data": leaderboard }
		return new Promise((resolve, reject) => {
			db.query(setReminderOptInQuery, (err, res) => {
				if (err) {
					console.error(err);
					db.end();
					reject("Error updating the reminder opt-in status: " + err.message);
					return;
				}
				db.end();
				resolve({ "status": `Successfully set the reminder opt-in status to ${optIn}`, "data": res });
			});
		});
	},
	getOptedInGuilds() {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Get a server's tree information from the database
		const getOptedInGuildsQuery = `SELECT * FROM guild_info WHERE reminder_optin = 1`;
		// TODO run this query and return a promise then structure the output into a GuildInfo object. resolve with { "status": , "data": guildInfo }
		return new Promise((resolve, reject) => {
			db.query(getOptedInGuildsQuery, (err, res) => {
				if (err) {
					console.error(err);
					reject("Error fetching guild information: " + err.message);
					db.end();
					return;
				}
				/*const guildInfo = { "guildId": "123",
					"treeName": "name",
					"treeHeight": 123,
					"treeMessageId": "123",
					"treeChannelId": "123",
					"leaderboardMessageId": "123",
					"leaderboardChannelId": "123",
					"reminderMessage": "Abc",
					"reminderChannelId": "123",
					"remindedStatus": 0,
					"comparisonMessageId": "123"
				};*/
				if (res.length == 0) {
					resolve({ "status": "No servers have opted in yet" });
					db.end();
					return;
				}
				row = res[0];
				let guilds = [];
				res.forEach(row => {
					guilds.push({
						"guildId": row.guild_id,
						"treeName": row.tree_name,
						"treeHeight": row.tree_height,
						"treeMessageId": row.tree_message_id,
						"treeChannelId": row.tree_channel_id,
						"leaderboardMessageId": row.leaderboard_message_id,
						"leaderboardChannelId": row.leaderboard_channel_id,
						"reminderMessage": row.ping_role_id,
						"reminderChannelId": row.ping_channel_id,
						"remindedStatus": row.reminded_status,
						"comparisonMessageId": row.comparison_message_id,
						"comparisonChannelId": row.comparison_channel_id
					});
				});
				db.end();
				resolve({ "status": "Successfully fetched guild information", "data": guilds });
			});
		});
	},
	setComparisonMessage(comparisonMessage, guildId) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Returns a Promise, resolve({ "status": "", "data": leaderboard })
		const setComparisonMessageQuery = `UPDATE guild_info SET comparison_message_id = ${db.escape(comparisonMessage.id)}, comparison_channel_id = ${db.escape(comparisonMessage.channel.id)} WHERE guild_id = ${db.escape(guildId)}`;
		// console.log(JSON.stringify(comparisonMessage));
		// TODO run the query and return a promise then process the results. resolve with { "status": , "data": leaderboard }
		return new Promise((resolve, reject) => {
			db.query(setComparisonMessageQuery, (err, res) => {
				if (err) {
					console.error(err);
					db.end();
					reject("Error updating the comparison message ID: " + err.message);
					return;
				}
				db.end();
				resolve({ "status": `Successfully set the comparison message ID: ${comparisonMessage}`, "data": res });
			});
		});
	},
	setNotificationChannel(id, guildId) {
		const db = mysql.createConnection({
			host: process.env.DBHOST,
			user: process.env.DBUSER,
			password: process.env.DBPASS,
			database: process.env.DBNAME,
			port: process.env.DBPORT
		});
		db.connect((err) => {
			if (err) throw `Error connecting to the database: ${err.message}`;
		});
		// Returns a Promise, resolve({ "status": "", "data": leaderboard })
		const query = `UPDATE guild_info SET notification_channel_id = ${db.escape(id)} WHERE guild_id = ${db.escape(guildId)}`;
		// console.log(JSON.stringify(comparisonMessage));
		// TODO run the query and return a promise then process the results. resolve with { "status": , "data": leaderboard }
		return new Promise((resolve, reject) => {
			db.query(query, (err, res) => {
				if (err) {
					console.error(err);
					db.end();
					reject("Error updating the notification channel ID: " + err.message);
					return;
				}
				db.end();
				resolve({ "status": `Successfully set the notification channel ID: ${comparisonMessage}`, "data": res });
			});
		});
	}
};