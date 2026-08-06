module.exports = {
  config: {
    name: "owner",
    version: "1.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    description: "Owner only",
    category: "system",
    guide: "{pn}owner"
  },

  onStart: async function ({ api, event }) {

    const OWNER_UID = "61592703210940";

    if (event.senderID != OWNER_UID) {
      return api.sendMessage(
        "🔒 هذا الأمر خاص بالمطور فقط.\n\n" +
        "👤 المطور: Fares\n" +
        "📩 تواصل معه:\n" +
        "https://www.facebook.com/profile.php?id=61592703210940",
        event.threadID,
        event.messageID
      );
    }

    return api.sendMessage(
      "✅ مرحباً أيها المطور.",
      event.threadID,
      event.messageID
    );
  }
};
