const axios = require("axios");
const fs = require("fs-extra");

const LANG_ALIASES = {
	en: "en", english: "en",
	bn: "bn", bengali: "bn", bangla: "bn",
	hi: "hi", hindi: "hi",
	ar: "ar", arabic: "ar", ع: "ar", عربي: "ar", العربية: "ar",
	fr: "fr", french: "fr",
	de: "de", german: "de",
	es: "es", spanish: "es",
	ja: "ja", japanese: "ja",
	ko: "ko", korean: "ko",
	zh: "zh", chinese: "zh",
	ru: "ru", russian: "ru",
	pt: "pt", portuguese: "pt",
	tr: "tr", turkish: "tr",
	vi: "vi", vietnamese: "vi",
	id: "id", indonesian: "id",
};

module.exports = {
	config: {
		name: "قول",
		aliases: ["say", "speak", "tts"],
		version: "2.1.0",
		author: "SIFAT",
		countDown: 5,
		role: 0,
		description: { ar: "تحويل النص إلى صوت مسموع" },
		category: "خدمات",
		guide: { ar: "{pn} <النص> — نطق باللغة الإنجليزية افتراضياً\n{pn} <النص> | <اللغة> — لتحديد اللغة (مثال: ar للعربية)\n◈ قم بالرد على أي رسالة لقراءتها صوتياً\n◈ اللغات المدعومة: ar, en, fr, de, hi..." }
	},

	onStart: async function ({ args, message, event }) {
		let text, lang = "ar"; // جعل اللغة الافتراضية العربية لتناسب طلبك

		if (event.type === "message_reply") {
			text = event.messageReply.body;
			if (args[0]) {
				const lcode = (args[0] || "").toLowerCase();
				lang = LANG_ALIASES[lcode] || lcode;
			}
		} else {
			if (!args.length) return message.reply("⌀ يرجى كتابة نص أو الرد على رسالة لترجمتها إلى صوت.");
			if (args.includes("|")) {
				const parts = args.join(" ").split("|").map(a => a.trim());
				text = parts[0];
				const lcode = (parts[1] || "ar").toLowerCase();
				lang = LANG_ALIASES[lcode] || lcode;
			} else {
				text = args.join(" ");
			}
		}

		if (!text || !text.trim()) return message.reply("⌀ لم يتم العثور على أي نص.");
		if (text.length > 500) text = text.slice(0, 500);

		const tmpPath = `${__dirname}/tmp/tts_${Date.now()}.mp3`;
		await fs.ensureDir(`${__dirname}/tmp`);

		try {
			const chunks = text.match(/.{1,150}/g) || [text];
			for (let i = 0; i < chunks.length; i++) {
				const res = await axios({
					method: "get",
					url: `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(chunks[i])}`,
					responseType: "stream"
				});
				const writer = fs.createWriteStream(tmpPath, { flags: i === 0 ? "w" : "a" });
				res.data.pipe(writer);
				await new Promise(resolve => writer.on("finish", resolve));
			}
			await message.reply({ body: `🔊 اللغة: ${lang}`, attachment: fs.createReadStream(tmpPath) });
			setTimeout(() => fs.remove(tmpPath).catch(() => {}), 60000);
		} catch {
			fs.remove(tmpPath).catch(() => {});
			return message.reply("⌀ فشل في توليد الملف الصوتي، يرجى المحاولة لاحقاً.");
		}
	}
};
