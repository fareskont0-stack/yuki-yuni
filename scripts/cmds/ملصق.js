module.exports = {
	config: {
		name: "ملصق",
		aliases: ["autosticker", "stickerauto"],
		version: "2.0",
		author: "ChatGPT",
		countDown: 3,
		role: 1,
		category: "group",
		description: {
			ar: "إدارة الملصقات التلقائية"
		},
		guide: {
			ar: "{pn} on\n{pn} off\n{pn} 2\n{pn} 5"
		}
	},

	onStart: async function ({ args, event, message, threadsData }) {

		if (!args[0]) {
			const enable = await threadsData.get(event.threadID, "data.autosticker");
			const count = await threadsData.get(event.threadID, "data.autostickerCount") || 2;

			return message.reply(
`📌 حالة الملصقات

الحالة: ${enable ? "✅ مفعلة" : "❌ متوقفة"}

عدد الرسائل: ${count}

الاستخدام:
.ملصق on
.ملصق off
.ملصق 2
.ملصق 5`
			);
		}

		const input = args[0].toLowerCase();

		if (input === "on") {
			await threadsData.set(event.threadID, true, "data.autosticker");
			return message.reply("✅ تم تشغيل الملصقات التلقائية.");
		}

		if (input === "off") {
			await threadsData.set(event.threadID, false, "data.autosticker");
			return message.reply("❌ تم إيقاف الملصقات التلقائية.");
		}

		if (!isNaN(input)) {
			const number = parseInt(input);

			if (number < 1)
				return message.reply("❌ أقل عدد هو 1.");

			await threadsData.set(event.threadID, number, "data.autostickerCount");

			return message.reply(`✅ سيتم إرسال ملصق كل ${number} رسالة.`);
		}

		return message.reply("❌ الاستخدام:\n.ملصق on\n.ملصق off\n.ملصق 2");
	}
};
