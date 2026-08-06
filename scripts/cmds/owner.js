module.exports = {
  config: {
    name: "owner",
    version: "1.0",
    author: "Fares",
    category: "system",
    guide: "{pn}owner",
    shortDescription: "معلومات المطور"
  },

  onStart: async function ({ message, event }) {

    const OWNER_UID = "61592703210940";

    if (event.senderID === OWNER_UID) {
      return message.reply("👋 مرحباً بك أيها المطور ❤️");
    }

    return message.reply(
`🔒 هذا الأمر خاص بالمطور فقط.

👤 المطور: Fares Khenchli
📩 للتواصل:
https://www.facebook.com/profile.php?id=61592703210940
    );
  }
};
