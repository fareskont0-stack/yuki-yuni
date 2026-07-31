const { config } = global.GoatBot;
const { client } = global;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "مجموعات",
		aliases: ["wlt"],
		version: "1.7",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			en: "Add, remove, edit whiteListThreadIds role",
			ar: "إضافة، إزالة، أو تعديل المجموعات المسموح لها باستخدام البوت"
		},
		category: "admin",
		guide: {
			ar: '   {pn} إضافة (أو +) : لإضافة المجموعة الحالية'
				+ '\n   {pn} إزالة (أو -) : لإزالة المجموعة الحالية'
				+ '\n   {pn} قائمة : لعرض قائمة المجموعات'
				+ '\n   {pn} تشغيل / إيقاف : لتفعيل أو إلغاء وضع القائمة البيضاء'
		}
	},

	langs: {
		ar: {
			added: `\n╭─✦✅ | تم إضافة %1 مجموعة/مجموعات بنجاح\n%2`,
			alreadyAdmin: `╭✦⚠️ | مجموعات مضافة مسبقاً (%1 مجموعة)\n%2\n`,
			removed: `\n╭─✦✅ | تم إزالة %1 مجموعة/مجموعات\n%2`,
			notAdmin: `╭✦❎ | لم يتم العثور على %1 مجموعة في القائمة\n%2\n`,
			listAdmin: `╭✦✨ | قائمة المجموعات المسموح لها\n%1\n╰─────────────────⧕`,
			turnedOn: "✅ | تم تفعيل وضع حصر استخدام البوت على المجموعات المسموح لها فقط",
			turnedOff: "❎ | تم إيقاف وضع حصر البوت (البوت متاح للجميع الآن)",
			turnedOnNoti: "✅ | تم تفعيل إشعارات التنبيه للمجموعات غير المسموحة",
			turnedOffNoti: "❎ | تم إيقاف إشعارات التنبيه",
			invalidArg: "⚠️ | الأمر غير مخصص هكذا. استخدم: مجموعات إضافة، مجموعات قائمة، أو مجموعات +"
		}
	},

	onStart: async function ({ message, args, event, getLang, api }) {
		const action = args[0] ? args[0].toLowerCase() : "";

		switch (action) {
			case "إضافة":
			case "اضافة":
			case "add":
			case "-a":
			case "+": {
				let tids = args.slice(1).filter(arg => !isNaN(arg));
				if (tids.length <= 0) tids.push(event.threadID);

				const notAdminIds = [], alreadyAdded = [];
				for (const tid of tids) {
					if (config.whiteListModeThread.whiteListThreadIds.includes(tid))
						alreadyAdded.push(tid);
					else
						notAdminIds.push(tid);
				}

				config.whiteListModeThread.whiteListThreadIds.push(...notAdminIds);
				const getNames = await Promise.all(tids.map(async tid => {
					const info = await api.getThreadInfo(tid) || {};
					return { tid, name: info.threadName || "غير معروف" };
				}));

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(notAdminIds.length > 0 ? getLang("added", notAdminIds.length,
						getNames.filter(({ tid }) => notAdminIds.includes(tid))
							.map(({ tid, name }) => `├‣ اسم المجموعة: ${name}\n╰‣ معرف المجموعة: ${tid}`).join("\n")) : "") +
					(alreadyAdded.length > 0 ? getLang("alreadyAdmin", alreadyAdded.length,
						alreadyAdded.map(tid => `╰‣ معرف المجموعة: ${tid}`).join("\n")) : "")
				);
			}

			case "إزالة":
			case "ازالة":
			case "remove":
			case "rm":
			case "-r":
			case "-": {
				let tids = args.slice(1).filter(arg => !isNaN(arg));
				if (tids.length <= 0) tids.push(event.threadID);

				const removed = [], notFound = [];
				for (const tid of tids) {
					if (config.whiteListModeThread.whiteListThreadIds.includes(tid))
						removed.push(tid);
					else
						notFound.push(tid);
				}

				for (const tid of removed)
					config.whiteListModeThread.whiteListThreadIds.splice(
						config.whiteListModeThread.whiteListThreadIds.indexOf(tid), 1);

				const getNames = await Promise.all(removed.map(async tid => {
					const info = await api.getThreadInfo(tid) || {};
					return { tid, name: info.threadName || "غير معروف" };
				}));

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				return message.reply(
					(removed.length > 0 ? getLang("removed", removed.length,
						getNames.map(({ tid, name }) => `├‣ اسم المجموعة: ${name}\n╰‣ معرف المجموعة: ${tid}`).join("\n")) : "") +
					(notFound.length > 0 ? getLang("notAdmin", notFound.length,
						notFound.map(tid => `╰‣ معرف المجموعة: ${tid}`).join("\n")) : "")
				);
			}

			case "قائمة":
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.whiteListModeThread.whiteListThreadIds.map(async tid => {
					const info = await api.getThreadInfo(tid) || {};
					return { tid, name: info.threadName || "غير معروف" };
				}));

				return message.reply(getLang("listAdmin",
					getNames.map(({ tid, name }) => `├‣ اسم المجموعة: ${name}\n├‣ معرف المجموعة: ${tid}`).join("\n")));
			}

			case "تشغيل":
			case "ايقاف":
			case "إيقاف":
			case "mode":
			case "m":
			case "-m": {
				let isSetNoti = false;
				let index = 1;
				if (args[1] === "noti" || args[1] === "إشعارات") {
					isSetNoti = true;
					index = 2;
				}

				let valArg = args[index] ? args[index].toLowerCase() : "";
				const value = (valArg === "on" || valArg === "تشغيل") ? true : (valArg === "off" || valArg === "إيقاف" || valArg === "ايقاف") ? false : null;
				
				if (value === null && (action === "تشغيل" || action === "ايقاف" || action === "إيقاف")) {
					config.whiteListModeThread.enable = (action === "تشغيل");
					writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(getLang(config.whiteListModeThread.enable ? "turnedOn" : "turnedOff"));
				}

				if (value === null)
					return message.reply("⚠️ | يرجى تحديد (تشغيل) أو (إيقاف).");

				if (isSetNoti) {
					config.hideNotiMessage.whiteListModeThread = !value;
					message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
				} else {
					config.whiteListModeThread.enable = value;
					message.reply(getLang(value ? "turnedOn" : "turnedOff"));
				}

				writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
				break;
			}

			default:
				return message.reply(getLang("invalidArg"));
		}
	}
};
