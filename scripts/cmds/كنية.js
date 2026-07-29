"use strict";

// خريطة لتخزين حالة الإيقاف لكل مجموعة
const activeLoops = new Map();

module.exports = {
	config: {
		name: "كنية",
		aliases: ["nickname", "nick", "setnick"],
		version: "2.1.0",
		author: "Fares Kouachi",
		countDown: 5,
		role: 0,
		description: {
			ar: "تغيير كنية الأعضاء أو تفعيل وضع التغيير الجماعي التفاعلي مع إمكانية الإيقاف الفوري"
		},
		category: "box chat",
		guide: {
			ar:
				"{pn} تشغيل → تفعيل وضع تغيير كنية جميع الأعضاء تفاعلياً\n" +
				"{pn} ايقاف → إيقاف عملية تغيير الكنيات فوراً\n" +
				"{pn} [الكنية] → تغيير كنية جميع الأعضاء فوراً"
		}
	},

	langs: {
		ar: {
			noName: "❌ | اكتب الكنية الجديدة.",
			promptAll: "✏️ | أرسل الآن الكنية التي تريد تطبيقها على **جميع أعضاء المجموعة** (أمامك 60 ثانية):",
			stopped: "🛑 | تم إيقاف عملية تغيير الكنيات فوراً بنجاح.",
			notRunning: "⚠️ | لا توجد عملية تغيير كنيات تعمل حالياً في هذه المجموعة.",
			done: "✅ | تم تغيير الكنية بنجاح.",
			doneAll: "✅ | تم الانتهاء من تغيير كنية جميع الأعضاء بنجاح.",
			error: "❌ | حدث خطأ أثناء تغيير الكنية."
		}
	},

	onStart: async function ({ api, event, args, message, getLang }) {
		const { threadID, senderID, messageReply, mentions } = event;
		const action = args[0] ? args[0].toLowerCase() : "";

		// 1. أمر الإيقاف الفوري
		if (action === "ايقاف") {
			if (activeLoops.has(threadID)) {
				activeLoops.set(threadID, false); // إرسال إشارة إيقاف الحلقة
				return message.reply(getLang("stopped"));
			} else {
				return message.reply(getLang("notRunning"));
			}
		}

		// 2. أمر التشغيل
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
			if (!uid && action !== "بوت" && Object.keys(mentions).length === 0 && !messageReply) {
				const threadInfo = await api.getThreadInfo(threadID);
				activeLoops.set(threadID, true); // تفعيل حالة التشغيل

				for (const user of threadInfo.userInfo) {
					// التحقق في كل خطوة ما إذا طلب المستخدم الإيقاف
					if (activeLoops.get(threadID) === false) break;
					if (!user || !user.id) continue;

					try {
						await api.changeNickname(nickname, threadID, user.id);
						await new Promise(resolve => setTimeout(resolve, 500));
					} catch (e) {
						console.log(`Failed: ${user.id}`);
					}
				}

				activeLoops.delete(threadID);
				return message.reply(getLang("doneAll"));
			}

			if (uid) {
				await api.changeNickname(nickname, threadID, uid);
				return message.reply(getLang("done"));
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
		if (Reply.type !== "setAllNicknames") return;

		const nickname = body.trim();
		if (!nickname) return message.reply(getLang("noName"));

		try {
			global.GoatBot.onReply.delete(Reply.messageID);
			api.setMessageReaction("⌛", messageID, () => {}, true);

			const threadInfo = await api.getThreadInfo(threadID);
			activeLoops.set(threadID, true); // تفعيل حالة التشغيل للحلقة

			for (const user of threadInfo.userInfo) {
				// التحقق الفوري من أمر الإيقاف أثناء التغيير
				if (activeLoops.get(threadID) === false) break;
				if (!user || !user.id) continue;

				try {
					await api.changeNickname(nickname, threadID, user.id);
					await new Promise(resolve => setTimeout(resolve, 500));
				} catch (e) {
					console.log(`Failed: ${user.id}`);
				}
			}

			activeLoops.delete(threadID);
			api.setMessageReaction("✅", messageID, () => {}, true);
			return message.reply(getLang("doneAll"));
		} catch (err) {
			activeLoops.delete(threadID);
			console.log(err);
			api.setMessageReaction("❌", messageID, () => {}, true);
			return message.reply(getLang("error"));
		}
	}
};
