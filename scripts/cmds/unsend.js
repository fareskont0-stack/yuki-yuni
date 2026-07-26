module.exports = {
	config: {
		name: "حذف",
		aliases: ["uns", "un", "u", "احذف"],
		version: "1.3",
		author: "NTKhang & MahMUD",
		countDown: 5,
		role: 0,
		description: {
			ar: "حذف رسالة البوت بالرد عليها",
			vi: "Gỡ tin nhắn của bot",
			en: "Unsend bot's message"
		},
		category: "box chat",
		guide: {
			ar: "دير ريبلاي على رسالة البوت اللي حاب تحذفها واكتب {pn}",
			vi: "reply tin nhắn muốn gỡ của bot và gọi lệnh {pn}",
			en: "reply the message you want to unsend and call the command {pn}"
		}
	},

	langs: {
		ar: {
			syntaxError: "رد على رسالة بوت واكتب امر حذف 💖"
		},
		vi: {
			syntaxError: "Vui lòng reply tin nhắn muốn gỡ của bot"
		},
		en: {
			syntaxError: "Please reply the message you want to unsend"
		}
	},

	onStart: async function ({ message, event, api, getLang }) {
		if (!event.messageReply || event.messageReply.senderID != api.getCurrentUserID())
			return message.reply(getLang("syntaxError"));
		
		try {
			await message.unsend(event.messageReply.messageID);
			return api.setMessageReaction("🗑️", event.messageID, () => {}, true);
		} catch (err) {
			console.error("Unsend Error:", err);
		}
	}
};
