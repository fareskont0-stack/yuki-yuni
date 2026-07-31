const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

/**
* @author فارس خنشلي
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "حذاء",
    aliases: ["toqai"],
    version: "1.7",
    author: "فارس خنشلي",
    role: 0,
    category: "fun",
    cooldown: 10,
    guide: "[قم بالإشارة / الرد / أو أضف المعرف UID]",
  },

  onStart: async function({ api, event, args }) {
    const authorizedAuthor = "فارس خنشلي"; 
    if (module.exports.config.author !== authorizedAuthor) {
      return api.sendMessage(
        "أنت لست مخولاً بتغيير اسم المؤلف.\n", 
        event.threadID, 
        event.messageID
      );
    }

    const { senderID, mentions, threadID, messageID, messageReply } = event;
    let id;
    if (Object.keys(mentions).length > 0) {
      id = Object.keys(mentions)[0];
    } else if (messageReply) {
      id = messageReply.senderID;
    } else if (args[0]) {
      id = args[0]; 
    } else {
      return api.sendMessage(
        "❌ يرجى الإشارة إلى شخص، الرد على رسالته، أو إدخال معرف المستخدم (UID) لتطبيق الأمر.",
        threadID,
        messageID
      );
    }

    try {
      const apiUrl = await baseApiUrl();
      const url = `${apiUrl}/api/tokai?user=${id}`;

      const response = await axios.get(url, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, `tokai_${id}.png`);
      fs.writeFileSync(filePath, response.data);
      
      api.sendMessage(
        { attachment: fs.createReadStream(filePath), body: "إليك صورة Tokai الخاصة بك 🐸" },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );

    } catch (err) {
      api.sendMessage(` حدث خطأ، يرجى التواصل مع المطور فارس خنشلي.`, threadID, messageID);
    }
  }
};
