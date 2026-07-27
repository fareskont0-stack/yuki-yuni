module.exports = {
	config: {
		name: "stickerid",
		aliases: ["sid", "sticker"],
		version: "1.0",
		author: "ChatGPT",
		countDown: 2,
		role: 0,
		description: {
			ar: "الحصول على معرف الملصق"
		},
		category: "tools",
		guide: {
			ar: "{pn} (قم بالرد على ملصق)"
		}
	},

	onStart: async function ({ event, message }) {
		const reply = event.messageReply;

		if (!reply)
			return message.reply("❌ قم بالرد على ملصق.");

		if (!reply.stickerID)
			return message.reply("❌ الرسالة التي رددت عليها ليست ملصقًا.");

		return message.reply(
			`📌 Sticker ID:\n${reply.stickerID}`
		);
	}
};
