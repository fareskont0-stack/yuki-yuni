const sentVideos = new Map();

module.exports = {
  config: {
    name: "تصميم",
    aliases: ["biography", "bio"],
    version: "1.0",
    author: "حسين يعقوبي",
    category: "سير ذاتية",
    role: 0,
    countDown: 2,
    shortDescription: {
      ar: "إرسال تصميم عشوائي",
      en: "Send random design"
    },
    longDescription: {
      ar: "يرسل فيديو تصميم عشوائي بدون تكرار حتى تنتهي جميع الفيديوهات.",
      en: "Send random design video without repeating."
    },
    guide: {
      ar: "{p}تصميم",
      en: "{p}design"
    }
  },

  onStart: async function ({ message, event, api }) {
    try {
      const videos = [
        "https://stream.vidhosting.in/videos/6cc8c91f.mp4",
        "https://stream.vidhosting.in/videos/b0ea160c.mp4",
        "https://stream.vidhosting.in/videos/f58342d2.mp4",
        "https://stream.vidhosting.in/videos/c2daec84.mp4",
        "https://stream.vidhosting.in/videos/c7794e4f.mp4",
        "https://stream.vidhosting.in/videos/070e8890.mp4",
        "https://stream.vidhosting.in/videos/c016baf2.mp4",
        "https://stream.vidhosting.in/videos/e656c2b9.mp4"
      ];

      const threadID = event.threadID;

      if (!sentVideos.has(threadID))
        sentVideos.set(threadID, []);

      let used = sentVideos.get(threadID);

      if (used.length === videos.length)
        used = [];

      const available = videos.filter(v => !used.includes(v));

      const videoLink =
        available[Math.floor(Math.random() * available.length)];

      used.push(videoLink);
      sentVideos.set(threadID, used);

      api.setMessageReaction("💖", event.messageID, () => {}, true);

      const stream = await global.utils.getStreamFromURL(videoLink);

      return message.reply({
        body: "تفضل يا عمري 💖",
        attachment: stream
      });

    } catch (err) {
      console.error(err);
      return message.reply("❌ حدث خطأ أثناء إرسال الفيديو.");
    }
  }
}; 
