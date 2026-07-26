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
      tl: "https://stream.vidhosting.in/videos/6cc8c91f.mp4"
    },
    guide: {
      en: "{p}سيرة",
      tl: "{p}bio"
    }
  },
  onStart: async function ({ message, api, event }) {
    try {
      const bioText = "𝗧𝗿𝗮𝗶𝗻 𝗛𝗮𝗿𝗱 • 𝗦𝘁𝗮𝘆 𝗛𝘂𝗺𝗯𝗹𝗲 🍓✨🩵\n▪️ المعنى: تدرب بجد وابق متواضعاً.\n▪️ الشرح: أهمية الاجتهاد المستمر مع الحفاظ على تواضع النفس مهما بلغت من إنجازات.";
      
      // رابط الفيديو المباشر الذي طلبته
      const videoLink = "https://sharevideo.org/qu83QB86I7VJUh4/watch";

      // وضع تفاعل لإعلامك ببدء التنفيذ
      api.setMessageReaction("💖", event.messageID, () => {}, true);
    
      // جلب الفيديو كـ Stream (يعمل بنفس كفاءة الصور تماماً مع الـ mp4)
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
