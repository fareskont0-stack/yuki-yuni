"use strict";

module.exports = {
	config: {
		name: "كنية",
		aliases: ["nickname", "nick", "setnick"],
		version: "2.0.0",
		author: "Fares Kouachi",
		countDown: 5,
		role: 0,
		description: {
			ar: "تغيير كنية الأعضاء أو تفعيل وضع التغيير الجماعي التفاعلي"
		},
		category: "box chat",
		guide: {
			ar:
				"{pn} تشغيل → تفعيل وضع تغيير كنية جميع الأعضاء تفاعلياً\n" +
				"{pn} ايقاف → إلغاء تفعيل الوضع\n" +
				"{pn} [الكنية] → تغيير كنية جميع الأعضاء فوراً\n" +
				"{pn} @شخص [الكنية] → تغيير كنية شخص\n" +
				"الرد على رسالة ثم {pn} [الكنية] → تغيير كنية صاحب الرسالة\n" +
				"{pn} بوت [الكنية] → تغيير كنية البوت"
		}
	},

	langs: {
		ar: {
			noName: "❌ | اكتب الكنية الجديدة.",
			promptAll: "✏️ | مرحباً يا غالي، أرسل الآن الكنية التي تريد تطبيقها على **جميع أعضاء المجموعة** (أمامك 60 ثانية):",
			stopped: "🛑 | تم إيقاف وضع تغيير الكنية الجماعي.",
			done: "✅ | تم تغيير الكنية بنجاح.",
			doneAll: "✅ | تم تغيير كنية جميع أعضاء المجموعة بنجاح.",
			error: "❌ | حدث خطأ أثناء تغيير الكنية."
		}
	},

	onStart: async function ({ api, event, args, message, getLang }) {
		const { threadID, senderID, messageReply, mentions } = event;
		const action = args[0] ? args[0].toLowerCase() : "";

		// 1. أمر التشغيل (لتفعيل نظام الرد الجماعي)
		if (action === "تشغيل") {
			return message.reply(getLang("promptAll"), (err, info) => {
				if (err) return;
				global.GoatBot.onReply.set(info.messageID, {
					commandName: this.config.name,
					messageID: info.messageID,
					author: senderID,
					type: "setAllNicknames"
				});
			});
		}

		// 2. أمر الإيقاف
		if (action === "ايقاف") {
			return message.reply(getLang("stopped"));
		}

		if (!args.length)
			return message.reply(getLang("noName"));

		let uid = null;
		let nickname = "";

		// تغيير كنية البوت
		if (action === "بوت") {
			uid = api.getCurrentUserID();
			nickname = args.slice(1).join(" ");
		}
		// تغيير كنية شخص بالمنشن
		else if (Object.keys(mentions).length > 0) {
			uid = Object.keys(mentions)[0];
			nickname = args.slice(1).join(" ");
		}
		// تغيير كنية شخص بالرد
		else if (messageReply) {
			uid = messageReply.senderID;
			nickname = args.join(" ");
		}
		// تغيير كنية الجميع مباشرة
		else {
			nickname = args.join(" ");
		}

		try {
			if (!uid && action !== "بوت" && Object.keys(mentions).length === 0 && !messageReply) {
				const threadInfo = await api.getThreadInfo(threadID);
				for (const user of threadInfo.userInfo) {
					if (!user || !user.id) continue;
					try {
						await api.changeNickname(nickname, threadID, user.id);
						await new Promise(resolve => setTimeout(resolve, 500));
					} catch (e) {
						console.log(`Failed: ${user.id}`);
					}
				}
				return message.reply(getLang("doneAll"));
			}

			if (uid) {
				await api.changeNickname(nickname, threadID, uid);
				return message.reply(getLang("done"));
			}
		} catch (err) {
			console.log(err);
			return message.reply(getLang("error"));
		}
	},

	onReply: async function ({ api, event, Reply, message, getLang }) {
		const { senderID, body, messageID, threadID } = event;

		if (Reply.author !== senderID) return;
		if (Reply.type !== "setAllNicknames") return;

		const nickname = body.trim();
		if (!nickname) return message.reply(getLang("noName"));

		try {
			// حذف الرد من الذاكرة حتى لا يتكرر التفاعل
			global.GoatBot.onReply.delete(Reply.messageID);
			api.setMessageReaction("⌛", messageID, () => {}, true);

			const threadInfo = await api.getThreadInfo(threadID);
			for (const user of threadInfo.userInfo) {
				if (!user || !user.id) continue;
				try {
					await api.changeNickname(nickname, threadID, user.id);
					await new Promise(resolve => setTimeout(resolve, 500));
				} catch (e) {
					console.log(`Failed: ${user.id}`);
				}
			}

			api.setMessageReaction("✅", messageID, () => {}, true);
			return message.reply(getLang("doneAll"));
		} catch (err) {
			console.log(err);
			api.setMessageReaction("❌", messageID, () => {}, true);
			return message.reply(getLang("error"));
		}
	}
};
