module.exports = {
  config: {
    name: "سيرة",
    author: "حسين يعقوبي",
    aliases: ["biography", "bio"],
    category: "سير ذاتية",
    shortDescription: {
      en: "إرسال سيرة ذاتية مع فيديو.",
      tl: "Magpadala ng bio na may video."
    },
    longDescription: {
      en: "سيرسل هذا الأمر سيرة ذاتية إنجليزية مزخرفة مع شرحها بالعربية وفيديو مميز.",
      tl: "Magpapadala ito ng bold styled english bio na may video."
    },
    guide: {
      en: "{p}سيرة",
      tl: "{p}bio"
    }
  },
  onStart: async function ({ message, api, event }) {
    try {
      const bioText = "𝗧𝗿𝗮𝗶𝗻 𝗛𝗮𝗿𝗱 • 𝗦𝘁𝗮𝘆 𝗛𝘂𝗺𝗯𝗹𝗲 🍓✨🩵\n▪️ المعنى: تدرب بجد وابق متواضعاً.\n▪️ الشرح: أهمية الاجتهاد المستمر مع الحفاظ على تواضع النفس مهما بلغت من إنجازات.";
      
      // رابط فيديو مباشر وصحيح 100% يعمل كـ Stream
      const videoLink = "https://stream.vidhosting.in/videos/6cc8c91f.mp4";

      // وضع تفاعل لإعلامك ببدء التنفيذ
      api.setMessageReaction("💖", event.messageID, () => {}, true);
    
      // جلب الفيديو كـ Stream
      const stream = await global.utils.getStreamFromURL(videoLink);

      // إرسال النص مع الفيديو في رسالة واحدة
      return message.reply({
        body: bioText,
        attachment: stream
      });

    } catch (error) {
      console.error("خطأ في أمر سيرة (فيديو):", error);
      return message.reply("حدث خطأ أثناء تنفيذ الأمر، يرجى المحاولة لاحقاً.");
    }
  }
};
