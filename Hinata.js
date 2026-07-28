process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

import axios from "axios";
import fs from "fs-extra";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import { execSync } from 'child_process';
import log from './logger/log.js';
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0; 

function validJSON(pathDir) {
	try {
		if (!fs.existsSync(pathDir))
			throw new Error(`File "${pathDir}" not found`);
		execSync(`npx jsonlint "${pathDir}"`, { stdio: 'pipe' });
		return true;
	}
	catch (err) {
		let msgError = err.message;
		msgError = msgError.split("\n").slice(1).join("\n");
		const indexPos = msgError.indexOf("    at");
		msgError = msgError.slice(0, indexPos != -1 ? indexPos - 1 : msgError.length);
		throw new Error(msgError);
	}
}

// ———————————————— FIXED PATHS (NO MORE .DEV) ———————————————— //
const dirConfig = path.normalize(`${__dirname}/config.json`);
const dirConfigCommands = path.normalize(`${__dirname}/configCommands.json`);
const dirAccount = path.normalize(`${__dirname}/account.txt`);

for (const pathDir of [dirConfig, dirConfigCommands]) {
	try {
		validJSON(pathDir);
	}
	catch (err) {
		log.error("CONFIG", `Invalid JSON file "${pathDir.replace(__dirname, "")}":\n${err.message.split("\n").map(line => `  ${line}`).join("\n")}\nPlease fix it and restart bot`);
		process.exit(0);
	}
}
const config = JSON.parse(fs.readFileSync(dirConfig, 'utf-8'));
if (config.whiteListMode?.whiteListIds && Array.isArray(config.whiteListMode.whiteListIds))
	config.whiteListMode.whiteListIds = config.whiteListMode.whiteListIds.map(id => id.toString());
const configCommands = JSON.parse(fs.readFileSync(dirConfigCommands, 'utf-8'));

global.GoatBot = {
	startTime: Date.now() - process.uptime() * 1000, 
	commands: new Map(), 
	eventCommands: new Map(), 
	commandFilesPath: [], 
	eventCommandsFilesPath: [], 
	aliases: new Map(), 
	onFirstChat: [], 
	onChat: [], 
	onEvent: [], 
	onReply: new Map(), 
	onReaction: new Map(), 
	onAnyEvent: [], 
	config, 
	configCommands, 
	envCommands: {}, 
	envEvents: {}, 
	envGlobal: {}, 
	reLoginBot: function () { }, 
	Listening: null, 
	oldListening: [], 
	callbackListenTime: {}, 
	storage5Message: [], 
	fcaApi: null, 
	botID: null 
};

global.db = {
	allThreadData: [],
	allUserData: [],
	allDashBoardData: [],
	allGlobalData: [],
	threadModel: null,
	userModel: null,
	dashboardModel: null,
	globalModel: null,
	threadsData: null,
	usersData: null,
	dashBoardData: null,
	globalData: null,
	receivedTheFirstMessage: {}
};

global.client = {
	dirConfig,
	dirConfigCommands,
	dirAccount,
	countDown: {},
	cache: {},
	database: {
		creatingThreadData: [],
		creatingUserData: [],
		creatingDashBoardData: [],
		creatingGlobalData: []
	},
	commandBanned: configCommands.commandBanned
};

import utils from "./utils.js";
global.utils = utils;
const { colors } = utils;

global.temp = {
	createThreadData: [],
	createUserData: [],
	createThreadDataError: [], 
	filesOfGoogleDrive: {
		arraybuffer: {},
		stream: {},
		fileNames: {}
	},
	contentScripts: {
		cmds: {},
		events: {}
	}
};

const watchAndReloadConfig = (dir, type, prop, logName) => {
	let lastModified = fs.statSync(dir).mtimeMs;
	let isFirstModified = true;

	fs.watch(dir, (eventType) => {
		if (eventType === type) {
			const oldConfig = global.GoatBot[prop];

			setTimeout(() => {
				try {
					if (isFirstModified) {
						isFirstModified = false;
						return;
					}
					if (lastModified === fs.statSync(dir).mtimeMs) {
						return;
					}
					global.GoatBot[prop] = JSON.parse(fs.readFileSync(dir, 'utf-8'));
					log.success(logName, `Reloaded ${dir.replace(process.cwd(), "")}`);
				}
				catch (err) {
					log.warn(logName, `Can't reload ${dir.replace(process.cwd(), "")}`);
					global.GoatBot[prop] = oldConfig;
				}
				finally {
					lastModified = fs.statSync(dir).mtimeMs;
				}
			}, 200);
		}
	});
};

watchAndReloadConfig(dirConfigCommands, 'change', 'configCommands', 'CONFIG COMMANDS');
watchAndReloadConfig(dirConfig, 'change', 'config', 'CONFIG');

global.GoatBot.envGlobal = global.GoatBot.configCommands.envGlobal;
global.GoatBot.envCommands = global.GoatBot.configCommands.envCommands;
global.GoatBot.envEvents = global.GoatBot.configCommands.envEvents;

// ———————————————— LOAD LANGUAGE ———————————————— //
const getText = global.utils.getText;

// ———————————————— AUTO RESTART ———————————————— //
if (config.autoRestart) {
	const time = config.autoRestart.time;
	if (!isNaN(time) && time > 0) {
		utils.log.info("AUTO RESTART", getText("Goat", "autoRestart1", utils.convertTime(time, true)));
		setTimeout(() => {
			utils.log.info("AUTO RESTART", "Restarting...");
			process.exit(2);
		}, time);
	}
	else if (typeof time == "string" && time.match(/^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$/gmi)) {
		utils.log.info("AUTO RESTART", getText("Goat", "autoRestart2", time));
		import("node-cron").then(cron => {
			cron.schedule(time, () => {
				utils.log.info("AUTO RESTART", "Restarting...");
				process.exit(2);
			});
		});
	}
}

(async () => {
	// ———————————————— SETUP MAIL ———————————————— //
	const { gmailAccount } = config.credentials;
	const { email, clientId, clientSecret, refreshToken } = gmailAccount;
	const OAuth2 = google.auth.OAuth2;
	const OAuth2_client = new OAuth2(clientId, clientSecret);
	OAuth2_client.setCredentials({ refresh_token: refreshToken });
	let accessToken;
	try {
		accessToken = await OAuth2_client.getAccessToken();
	}
	catch (err) {
		throw new Error(getText("Goat", "googleApiTokenExpired"));
	}
	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		service: 'Gmail',
		auth: {
			type: 'OAuth2',
			user: email,
			clientId,
			clientSecret,
			refreshToken,
			accessToken
		}
	});

	async function sendMail({ to, subject, text, html, attachments }) {
		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			service: 'Gmail',
			auth: {
				type: 'OAuth2',
				user: email,
				clientId,
				clientSecret,
				refreshToken,
				accessToken
			}
		});
		const mailOptions = {
			from: email,
			to,
			subject,
			text,
			html,
			attachments
		};
		const info = await transporter.sendMail(mailOptions);
		return info;
	}

	global.utils.sendMail = sendMail;
	global.utils.transporter = transporter;

	// ———————————————— CHECK VERSION ———————————————— //
	try {
		const { data: { version } } = await axios.get("https://raw.githubusercontent.com/mahmudx7/Hinata-Bot-V3/main/package.json");
		const currentVersion = JSON.parse(fs.readFileSync(path.normalize(`${__dirname}/package.json`), 'utf-8')).version;
		if (compareVersion(version, currentVersion) === 1)
			utils.log.master("NEW VERSION", getText(
				"Goat",
				"newVersionDetected",
				colors.gray(currentVersion),
				colors.hex("#eb6a07", version),
				colors.hex("#eb6a07", "node update")
			));
	} catch (e) {}

	// —————————— CHECK FOLDER GOOGLE DRIVE —————————— //
	const parentIdGoogleDrive = await utils.drive.checkAndCreateParentFolder("GoatBot");
	utils.drive.parentID = parentIdGoogleDrive;
	
	// ———————————————————— LOGIN (ALWAYS READ login.js) ———————————————————— //
	await import(`./bot/login/login.js`);
})();

function compareVersion(version1, version2) {
	const v1 = version1.split(".");
	const v2 = version2.split(".");
	for (let i = 0; i < 3; i++) {
		if (parseInt(v1[i]) > parseInt(v2[i]))
			return 1; 
		if (parseInt(v1[i]) < parseInt(v2[i]))
			return -1; 
	}
	return 0; 
}
