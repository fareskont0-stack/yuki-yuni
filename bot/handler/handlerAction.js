const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

const request = require("request");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
	const handlerEvents = require(process.env.NODE_ENV == 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

	return async function (event) {
		const message = createFuncMessage(api, event);

		message.success = (text) =>
			message.reply(text || messages.random(messages.success));

		message.error = (text) =>
			message.reply(text || messages.random(messages.error));

		message.loading = (text) =>
			message.reply(text || messages.random(messages.loading));

		message.noPermission = (text) =>
			message.reply(text || messages.random(messages.noPermission));

		message.botNoPermission = (text) =>
			message.reply(text || messages.random(messages.botNoPermission));

		message.done = (text) =>
			message.reply(text || messages.random(messages.done));

		message.wait = (text) =>
			message.reply(text || messages.random(messages.wait));

		message.welcome = (text) =>
			message.reply(text || messages.random(messages.welcome));

		message.goodbye = (text) =>
			message.reply(text || messages.random(messages.goodbye));

		message.ai = (text) =>
			message.reply(text || messages.random(messages.ai));

		message.download = (text) =>
			message.reply(text || messages.random(messages.download));

		message.upload = (text) =>
			message.reply(text || messages.random(messages.upload));

		message.onlyOwner = (text) =>
			message.reply(text || messages.random(messages.onlyOwner));

		message.onlyAdmin = (text) =>
			message.reply(text || messages.random(messages.onlyAdmin));

		message.onlyGroup = (text) =>
			message.reply(text || messages.random(messages.onlyGroup));

		message.cooldown = (text) =>
			message.reply(text || messages.random(messages.cooldown));

		message.notFound = (text) =>
			message.reply(text || messages.random(messages.notFound));

		try {
			await handlerCheckDB(usersData, threadsData, event);
		} catch (err) {
			console.error("Error in handlerCheckDB:", err);
		}

		const handlerChat = await handlerEvents(event, message);
		if (!handlerChat)
			return;

		const { onStart, onChat, onReply, onEvent, handlerEvent, onReaction, typ, presence, read_receipt } = handlerChat;

		switch (event.type) {
			case "message":
			case "message_reply":
				// تشغيل الأوامر أولاً، ثم الردود التلقائية، ثم الرد على الرسائل بشكل مرتب وآمن
				if (typeof onStart === "function") await onStart();
				if (typeof onChat === "function") await onChat();
				if (typeof onReply === "function") await onReply();
				break;

			case "message_unsend":
				if (typeof onChat === "function") await onChat();
				if (typeof onReply === "function") await onReply();

				try {
					let resend = await threadsData.get(event.threadID, "settings.reSend");
					if (resend == true && event.senderID !== api.getCurrentUserID()) {
						if (global.reSend && global.reSend[event.threadID]) {
							let umid = global.reSend[event.threadID].findIndex(e => e.messageID === event.messageID);

							if (umid > -1) {
								let nname = await usersData.getName(event.senderID);
								let attch = [];
								if (global.reSend[event.threadID][umid].attachments && global.reSend[event.threadID][umid].attachments.length > 0) {
									let cn = 0;
									fs.ensureDirSync("scripts/cmds/tmp");
									for (var abc of global.reSend[event.threadID][umid].attachments) {
										if (abc.type == "audio") {
											cn += 1;
											let pts = `scripts/cmds/tmp/${cn}.mp3`;
											let res2 = (await axios.get(abc.url, {
												responseType: "arraybuffer"
											})).data;
											fs.writeFileSync(pts, Buffer.from(res2, "utf-8"));
											attch.push(fs.createReadStream(pts));
										} else {
											attch.push(await global.utils.getStreamFromURL(abc.url));
										}
									}
								}

								api.sendMessage({
									body: nname + " removed:\n\n" + (global.reSend[event.threadID][umid].body || ""),
									mentions: [{ id: event.senderID, tag: nname }],
									attachment: attch
								}, event.threadID);
							}
						}
					}
				} catch (e) {
					console.error("Error handling unsend message:", e);
				}
				break;

			case "event":
				if (typeof handlerEvent === "function") handlerEvent();
				if (typeof onEvent === "function") onEvent();
				break;

			case "message_reaction":
				if (typeof onReaction === "function") onReaction();
				if (event.reaction == "❗") {
					if (event.userID == "61589591233031") {
						api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
							if (err) return console.log(err);
						});
					} else {
						message.reply(":)");
					}
				}
				if (event.reaction == "😡") {
					if (event.senderID == api.getCurrentUserID()) {
						if (event.userID == "61589591233031") {
							if (typeof message.unsend === "function") {
								message.unsend(event.messageID);
							} else {
								api.unsendMessage(event.messageID);
							}
						} else {
							message.reply(":)");
						}
					}
				}
				break;

			case "typ":
				if (typeof typ === "function") typ();
				break;

			case "presence":
				if (typeof presence === "function") presence();
				break;

			case "read_receipt":
				if (typeof read_receipt === "function") read_receipt();
				break;

			default:
				break;
		}
	};
};
