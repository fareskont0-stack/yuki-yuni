"use strict";

module.exports = {
	config: {
		name: "كنية",
		aliases: ["nickname", "nick", "setnick"],
		version: "1.0.0",
		author: "Fares",
		countDown: 5,
		role: 0,
		description: {
			ar: "تغيير كنية عضو أو جميع أعضاء المجموعة"
		},
		category: "box chat",
		guide: {
			ar:
				"{pn} [الكنية] → تغيير كنية جميع الأعضاء\n" +
				"{pn} @شخص [الكنية] → تغيير كنية شخص\n" +
				"الرد على رسالة ثم {pn} [الكنية] → تغيير كنية صاحب الرسالة\n" +
				"{pn} بوت [الكنية] → تغيير كنية البوت"
		}
	},

	langs: {
		ar: {
			noName: "❌ | اكتب الكنية الجديدة.",
			done: "✅ | تم تغيير الكنية بنجاح.",
			doneAll: "✅ | تم تغيير كنية جميع أعضاء المجموعة.",
			error: "❌ | حدث خطأ أثناء تغيير الكنية."
		}
	},

	onStart: async function ({ api, event, args, message }) {
		const { threadID, senderID, messageReply, mentions } = event;

		if (!args.length)
			return message.reply("❌ | اكتب الكنية الجديدة.");

		let uid = null;
		let nickname = "";

		// تغيير كنية البوت
		if (args[0].toLowerCase() == "بوت") {
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

		// إذا لم يتم تحديد شخص سيتم تغيير كنية الجميع
		else {
			nickname = args.join(" ");
      			try {
				// تغيير كنية جميع الأعضاء
				if (!uid) {
					const threadInfo = await api.getThreadInfo(threadID);

					for (const user of threadInfo.userInfo) {
						if (!user || !user.id) continue;

						try {
							await api.changeNickname(
								nickname,
								threadID,
								user.id
							);

							// تأخير بسيط حتى لا يعتبره فيسبوك سبام
							await new Promise(resolve => setTimeout(resolve, 500));
						}
						catch (e) {
							console.log(
								`Failed: ${user.id}`
							);
						}
					}

					return message.reply(
						"✅ | تم تغيير كنية جميع أعضاء المجموعة."
					);
				}

				// تغيير كنية عضو واحد أو البوت
				await api.changeNickname(
					nickname,
					threadID,
					uid
				);

				return message.reply(
					"✅ | تم تغيير الكنية بنجاح."
				);
			}
			catch (err) {
				console.log(err);

				return message.reply(
					"❌ | حدث خطأ أثناء تغيير الكنية."
				);
			}
            }
    	}
};
