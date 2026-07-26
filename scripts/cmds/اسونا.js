const axios = require("axios");

module.exports = {
  config: {
    name: "asuna",
    version: "1.1",
    author: "Arafat (Modified)",
    countDown: 10,
    role: 0,
    shortDescription: "اسونا",
    longDescription: "أمر لجلب فيديو عشوائي لشخصية أسونا مع إمكانية البحث بكلمات مفتاحية",
    category: "Anime",
    guide: { en: "{pn} | {pn} <keyword>" }
  },

  onStart: async function ({ api, event, args }) {
    const EMOJIS = ["🎀", "💖", "✨", "🌸", "💫", "💝", "🩷", "🌷"];
    const EMOJI = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    const TEXT = {
      title: `${EMOJI} فديو أسونا`,
      notFound: "❌ لم يتم العثور على أي فيديو بهذا الاسم.",
      error: "😒 حدث خطأ أثناء معالجة الفيديو.",
      blocked: "❌ تم حظر البوت مؤقتاً من إرسال الرسائل (Anti-Spam / Block)."
    };

    let keyword = "asuna sao";
    if (args.length) keyword = `asuna ${args.join(" ")}`;

    try {
      const res = await axios.get(
        `https://short-video-api-by-arafat.vercel.app/arafat?keyword=${encodeURIComponent(keyword)}`,
        { timeout: 15000 }
      );

      if (!Array.isArray(res.data) || res.data.length === 0)
        return api.sendMessage(TEXT.notFound, event.threadID, event.messageID);

      const d = res.data[Math.floor(Math.random() * res.data.length)];
      if (!d.videoUrl)
        return api.sendMessage(TEXT.error, event.threadID, event.messageID);

      try {
        await api.sendMessage(
          {
            body: `${TEXT.title}\n⏱ المدة: ${d.duration || "?"} ثانية`,
            attachment: await global.utils.getStreamFromURL(d.videoUrl)
          },
          event.threadID,
          event.messageID
        );
      } catch { 
        api.sendMessage(TEXT.blocked, event.threadID, event.messageID); 
      }

    } catch { 
      api.sendMessage(TEXT.blocked, event.threadID, event.messageID); 
    }
  }
};
