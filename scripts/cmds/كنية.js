"use strict";

// خريطة لتخزين حالة الإيقاف والعمليات لكل مجموعة
const activeLoops = new Map();

module.exports = {
	config: {
		name: "كنية",
		aliases: ["nickname", "nick", "setnick"],
		version: "2.4.0",
		author: "Fares Kouachi",
		countDown: 3,
		role: 0,
		description: {
			ar: "تغيير كنية الأعضاء بلا إنقطاع بالهضجة الجزائرية الحنينة"
		},
		category: "box chat",
		guide: {
			ar:
				"{pn} تشغيل [الكنية] → بدء التغيير المستمر بلا حبس يا خوتي\n" +
				"{pn} ايقاف → حبس العملية فالحال\n" +
				"{pn} [الكنية] → تبديل كنية الناس الكل ضربة وحدة"
		}
	},

	langs: {
		ar: {
			noName: " 🌸 اكتب كنية لي راك حابها بلخف",
			promptAll: "ابعثلي كنية لي راك حابة ياعمري 🌸:",
			stopped: "صاي غيرت كامل كنيات 🌸",
			notRunning: "راك غالط، ما كاش حتى عملية تبديل كنيات ماشية درك.",
			done: "سلكت، رانا بدلنا الكنية بنجاح.",
			doneAll: "تم تغيير الكنية بنجاح 🌸",
			error: "يا ربي سترك، جرا خطأ ولا الفيسبوك قفل علينا البواب."
		}
	},

	onStart: async function ({ api, event, args, message, getLang }) {
		const { threadID, senderID, messageReply, mentions } = event;
		const action = args[0] ? args[0].toLowerCase() : "";

		// 1. أمر الإيقاف الفوري
		if (action === "ايقاف") {
			if (activeLoops.has(threadID)) {
				activeLoops.set(threadID, false);
				return message.reply(getLang("stopped"));
			} else {
				return message.reply(getLang("notRunning"));
			}
		}

		// إذا كانت كاين خدمة قديمة، نوقفها باش الجديدة تمشي بالزربة
		if (activeLoops.has(threadID)) {
			activeLoops.set(threadID, false);
			await new Promise(resolve => setTimeout(resolve, 600));
		}

		// 2. أمر التشغيل
		if (action === "تشغيل") {
			const directNickname = args.slice(1).join(" ");
			if (directNickname) {
				message.reply(`يا فنان! رانا دكينا وضع التدوير بلا حبس بالكنية: "${directNickname}" 🇩🇿🔥`);
				this.startInfiniteLoop(api, threadID, directNickname, message, getLang);
				return;
			}
			
			return message.reply(getLang("promptAll"), (err, info) => {
				if (err) return;
				global.GoatBot.onReply.set(info.messageID, {
					commandName: this.config.name,
					messageID: info.messageID,
					author: senderID,
					type: "setAllNicknamesInfinite"
				});
			});
		}

		if (!args.length)
			return message.reply(getLang("noName"));

		let uid = null;
		let nickname = "";

		if (action === "بوت") {
			uid = api.getCurrentUserID();
			nickname = args.slice(1).join(" ");
		} else if (Object.keys(mentions).length > 0) {
			uid = Object.keys(mentions)[0];
			nickname = args.slice(1).join(" ");
		} else if (messageReply) {
			uid = messageReply.senderID;
			nickname = args.join(" ");
		} else {
			nickname = args.join(" ");
		}

		try {
			// تغيير لواحد برك
			if (uid) {
				await api.changeNickname(nickname, threadID, uid);
				return message.reply(getLang("done"));
			}

			// تغيير جماعي لمرة وحدة
			if (!uid && Object.keys(mentions).length === 0 && !messageReply) {
				message.reply(`راني رايح نخدمها لك، اصبر عليا شوية برك...`);
				activeLoops.set(threadID, true);

				const threadInfo = await api.getThreadInfo(threadID);
				for (const user of threadInfo.userInfo) {
					if (activeLoops.get(threadID) === false) break;
					if (!user || !user.id) continue;

					try {
						await api.changeNickname(nickname, threadID, user.id);
						await new Promise(resolve => setTimeout(resolve, 800));
					} catch (e) {
						console.log(`Failed for user: ${user.id}`);
					}
				}

				activeLoops.delete(threadID);
				return message.reply(getLang("doneAll"));
			}
		} catch (err) {
			activeLoops.delete(threadID);
			console.log(err);
			return message.reply(getLang("error"));
		}
	},

	onReply: async function ({ api, event, Reply, message, getLang }) {
		const { senderID, body, messageID, threadID } = event;

		if (Reply.author !== senderID) return;
		if (Reply.type !== "setAllNicknamesInfinite") return;

		const nickname = body.trim();
		if (!nickname) return message.reply(getLang("noName"));

		global.GoatBot.onReply.delete(Reply.messageID);
		api.setMessageReaction("⌛", messageID, () => {}, true);
		message.reply(`يا خويا، راه‌ي مشات الحكاية بلا حبس بالكنية: "${nickname}" 🇩🇿\nكي تحب تحبسها، أكتب وحدك: .كنية ايقاف`);

		this.startInfiniteLoop(api, threadID, nickname, message, getLang);
	},

	startInfiniteLoop: async function (api, threadID, nickname, message, getLang) {
		activeLoops.set(threadID, true);
		
		while (activeLoops.get(threadID) === true) {
			try {
				const threadInfo = await api.getThreadInfo(threadID);
				if (activeLoops.get(threadID) !== true) break;

				for (const user of threadInfo.userInfo) {
					if (activeLoops.get(threadID) !== true) break;
					if (!user || !user.id) continue;

					try {
						await api.changeNickname(nickname, threadID, user.id);
						await new Promise(resolve => setTimeout(resolve, 1000));
					} catch (e) {
						// تجاوز الصامتين
					}
				}

				if (activeLoops.get(threadID) === true) {
					await new Promise(resolve => setTimeout(resolve, 3000));
				}
			} catch (err) {
				console.log("Loop error: ", err);
				await new Promise(resolve => setTimeout(resolve, 5000));
			}
		}
		
		activeLoops.delete(threadID);
	}
};
