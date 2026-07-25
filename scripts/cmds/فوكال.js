const axios = require("axios");

module.exports = {
  config: {
    name: "فوكال",
    version: "1.0",
    author: "ChatGPT",
    role: 0,
    shortDescription: "اختبار Fish Audio",
    longDescription: "تحويل النص إلى صوت",
    category: "AI",
    guide: {
      en: "{pn} <text>"
    }
  },

  onStart: async ({ message, args }) => {
    if (!args.length) {
      return message.reply("اكتب نصًا بعد الأمر.");
    }

    const text = args.join(" ");

    try {
      const res = await axios.post(
        "https://api.fish.audio/v1/tts",
        {
          text
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.1c582f665eba4274b1afb6c8c29c88a9}`,
            "Content-Type": "application/json"
          },
          responseType: "arraybuffer"
        }
      );

      return message.reply({
        body: "🎤",
        attachment: Buffer.from(res.data)
      });

    } catch (e) {
      console.log(e.response?.data || e.message);
      return message.reply("❌ فشل تحويل النص إلى صوت.");
    }
  }
};
