module.exports = {
  config: {
    name: "تصميم",
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
      const bioText = "تفضل ياعمري 💖";
      
      // قائمة الروابط الصحيحة داخل مصفوفة لضمان عدم حدوث خطأ برمجي
      const videos = [
        "https://stream.vidhosting.in/videos/6cc8c91f.mp4",
        "https://stream.vidhosting.in/videos/b0ea160c.mp4",
        "https://stream.vidhosting.in/videos/f58342d2.mp4",
        "
        // يمكنك إضافة باقي الروابط هنا لاحقاً بنفس الطريقة بين علامتي التنصيص وتفصل بينها بفاصلة
      ];

      // اختيار فيديو عشوائي تلقائياً في كل مرة يعمل فيها الأمر
      const videoLink = videos[Math.floor(Math.random() * videos.length)];

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
