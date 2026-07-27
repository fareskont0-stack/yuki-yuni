module.exports = {
	config: {
		name: "stickerid",
		version: "1.0",
		author: "ChatGPT",
		countDown: 2,
		role: 0,
		category: "tools"
	},

	onStart: async function ({ event, message }) {
		if (!event.messageReply)
			return message.reply("❌ قم بالرد على ملصق.");

		const attach = event.messageReply.attachments?.[0];

		if (!attach || attach.type !== "sticker")
			return message.reply("❌ الرسالة التي رددت عليها ليست ملصقًا.");

		return message.reply(
			JSON.stringify(attach, null, 2)
		);
	}
};
