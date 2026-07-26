module.exports = {
  config: {
    name: "سيرة",
    author: "حسين يعقوبي",
    aliases: ["biography", "bio"],
    category: "سير ذاتية",
    shortDescription: {
      en: "إرسال سيرة ذاتية عشوائية.",
      tl: "Magpadala ng random na bio."
    },
    longDescription: {
      en: "سيرسل هذا الأمر سيرة ذاتية إنجليزية مزخرفة مع شرحها بالعربية وصورة فخمة.",
      tl: "Magpapadala ito ng bold styled english bio na قدوة."
    },
    guide: {
      en: "{p}سيرة",
      tl: "{p}bio"
    }
  },
  onStart: async function ({ message, api, event }) {
    try {
      const dataList = [
        {
          bio: "𝗣𝗲𝗼𝗽𝗹𝗲 𝘄𝗶𝗹𝗹 𝗳𝗼𝗿𝗴𝗲𝘁 𝘄𝗵𝗮𝘁 𝘆𝗼𝘂 𝘀𝗮𝗶𝗱, 𝗯𝘂𝘁 𝘁𝗵𝗲𝘆 𝘄𝗶𝗹𝗹 𝗻𝗲𝘃𝗲𝗿 𝗳𝗼𝗿𝗴𝗲𝘁 𝗵𝗼𝘄 𝘆𝗼𝘂 𝗺𝗮𝗱𝗲 𝘁𝗵𝗲𝗺 𝗳𝗲𝗲𝗹 🍓✨🩵\n▪️ المعنى: سيقصد الناس ما قلت، لكنهم لن ينسا أبداً شعورهم معك.\n▪️ الشرح: الأثر الطيب والأخلاق الحسنة هما ما يبقى خالداً في قلوب الآخرين.",
          link: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"
        }
      ];

      const randomItem = dataList[Math.floor(Math.random() * dataList.length)];

      api.setMessageReaction("💖", event.messageID, () => {}, true);
    
      const stream = await global.utils.getStreamFromURL(randomItem.link);

      return message.reply({
        body: randomItem.bio,
        attachment: stream
      });

    } catch (error) {
      console.error("خطأ في أمر سيرة:", error);
      return message.reply("حدث خطأ أثناء تنفيذ الأمر، يرجى المحاولة لاحقاً.");
    }
  }
};
