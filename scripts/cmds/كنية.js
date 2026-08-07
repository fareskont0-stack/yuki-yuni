"use strict";

// خريطة لتخزين حالة الإيقاف والعمليات لكل مجموعة
const activeLoops = new Map();

// ضع هنا رابط ملفك الشخصي على فيسبوك
const FB_PROFILE = "https://www.facebook.com/YOUR_PROFILE_HERE";

module.exports = {
	config: {
		name: "كنية",
		aliases: ["nickname", "nick", "setnick"],
		version: "2.5.0",
		author: "Fares Kouachi",
		countDown: 3,
		role: 0,
		description: {
			ar: "تغيير أو حذف كنية الأعضاء بالليجة الجزائرية"
		},
		category: "box chat",
		guide: {
			ar:
				"{pn} تشغيل [الكنية] → بدء التغيير المستمر بلا حبس\n" +
				"{pn} حذف (أو حذف للجميع) → حذف كنيات جميع الأعضاء مرة واحدة\n" +
				"{pn} حذف تشغيل → حذف واستمرار مسح الكنيات بلا حبس\n" +
				"{pn} ايقاف (أو ايقاف حذف) → حبس العملية فالحال\n" +
				"{pn} [الكنية] → تبديل كنية الناس الكل ضربة وحدة"
		}
	},

	langs: {
		ar: {
			noName: " 🌸 اكتب كنية لي راك حابها بلخف",
			promptAll: "ابعثلي كنية لي راك حابة ياعمري 🌸:",
			stopped: "صاي غيرت/حذفت كامل كنيات 🌸",
			notRunning: "راك غالط، ما كاش حتى عملية تبديل/حذف كنيات ماشية درك.",
			done: "سلكت، رانا بدلنا الكنية بنجاح.",
			doneAll: "تم تغيير الكنية بنجاح 🌸",
			resetAll: "تم حذف جميع الكنيات وإرجاع الأسماء الأصلية بنجاح 🌸",
			error: "يا ربي سترك، جرا خطأ ولا الفيسبوك قفل علينا البواب."
		}
	},

	onStart: async function ({ api, event, args, message, getLang }) {
		const { threadID, senderID, messageReply, mentions } = event;
		const action = args[0] ? args[0].toLowerCase() : "";
		const subAction = args[1] ? args[1].toLowerCase() : "";

		// تحقق من صلاحيات الأدمن (إذا أردت حصر الأمر للمطور فقط)
		// يمكنك إلغاء التعليق عن السطور التالية لوضع الآيدي الخاص بك:
		/*
		const ADMIN_ID = "YOUR_FB_ID_HERE";
		if (senderID !== ADMIN_ID) {
			return message.reply(`⚠️ هذا الأمر مخصص للمطور فقط.\n\nتواصل مع المطور ليسمح لك باستخدام البوت:\n${FB_PROFILE}`);
		}
		*/

		// 1. أمر الإيقاف الفوري (ايقاف / ايقاف حذف)
		if (action === "ايقاف" || (action === "ايقاف" && subAction === "حذف")) {
			if (activeLoops.has(threadID)) {
				activeLoops.set(threadID, false);
				return message.reply(getLang("stopped"));
			} else {
				return message.reply(getLang("notRunning"));
			}
		}

		// إذا كانت هناك عملية جارية، نوقفها قبل البدء في عملية جديدة
		if (activeLoops.has(threadID)) {
			activeLoops.set(threadID, false);
			await new Promise(resolve => setTimeout(resolve, 600));
		}

		// 2. أمر الحذف التكراري المستمر (حذف تشغيل)
		if (action === "حذف" && subAction === "تشغيل") {
			message.reply(`يا فنان! رانا دكينا وضع حذف الكنيات بلا حبس للجميع 🇩🇿🔥\nكي تحب تحبسها، أكتب: .كنية ايقاف`);
			this.startInfiniteLoop(api, threadID, "", message, getLang);
			return;
		}

		// 3. أمر الحذف الجماعي لمرة واحدة (حذف / حذف للجميع / مسح)
		if (action === "حذف" || action === "مسح" || (action === "حذف" && subAction === "للجميع")) {
			message.reply(`راني رايح نحذف كنيات الجميع، اصبر عليا شوية برك...`);
			activeLoops.set(threadID, true);

			try {
				const threadInfo = await api.getThreadInfo(threadID);
				for (const user of threadInfo.userInfo) {
					if (activeLoops.get(threadID) === false) break;
					if (!user || !user.id) continue;

					try {
						// إرسال نص فارغ "" يحذف الكنية ويعيد الاسم الأصلي
						await api.changeNickname("", threadID, user.id);
						await new Promise(resolve => setTimeout(resolve, 800));
					} catch (e) {
						console.log(`Failed to reset nickname for user: ${user.id}`);
					}
				}

				activeLoops.delete(threadID);
				return message.reply(getLang("resetAll"));
			} catch (err) {
				activeLoops.delete(threadID);
				console.log(err);
				return message.reply(getLang("error"));
			}
		}

		// 4. أمر التشغيل للتكرار المستمر بكنية معينة
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
						// إرسال "" يحذف الكنية وإذا كانت هناك كنية محددة سيتم وضعها
						await api.changeNickname(nickname, threadID, user.id);
						await new Promise(resolve => setTimeout(resolve, 1000));
					} catch (e) {
						// تجاوز الأخطاء
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
