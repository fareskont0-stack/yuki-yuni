module.exports = {
  config: {
    name: "bio",
    version: "1.0.0",
    author: "Priyansh Rajput",
    role: 2,
    category: "admin",
    shortDescription: "تغيير نبذة البوت",
    longDescription: "تغيير السيرة الشخصية لحساب البوت",
    guide: "{pn} <النص>",
    countDown: 5
  },

  onStart: async function ({ api, event, args }) {
    const bio = args.join(" ");

    if (!bio)
      return api.sendMessage(
        "⚠️ | الرجاء إدخال السيرة الجديدة.",
        event.threadID,
        event.messageID
      );

    api.changeBio(bio, (err) => {
      if (err)
        return api.sendMessage(
          `❌ | حدث خطأ:\n${err}`,
          event.threadID,
          event.messageID
        );

      api.sendMessage(
        `✅ | تم تغيير سيرة البوت إلى:\n\n${bio}`,
        event.threadID,
        event.messageID
      );
    });
  }
};
