const axios = require("axios");

module.exports = {
  config: {
    name: "تو",
    version: "1.2.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "تأثير Triggered بجودة عالية"
    },
    longDescription: {
      ar: "توليد صورة متحركة بصيغة GIF بتأثير الاهتزاز مع الحفاظ على جودة الصورة عالية HD"
    },
    category: "تسلية",
    guide: {
      ar: "{p}تريغرد (أو قم بعمل تاغ / ريبلاي على صورة)"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      let userID = event.senderID;
      let imageUrl = "";

      // 1. تحديد الصورة إذا كان هناك رد على صورة مباشرة (تكون بعالية الجودة)
      if (event.type === "message_reply") {
        userID = event.messageReply.senderID;
        if (event.messageReply.attachments && event.messageReply.attachments.length > 0 && event.messageReply.attachments[0].type === "photo") {
          imageUrl = event.messageReply.attachments[0].url;
        }
      } else if (Object.keys(event.mentions || {}).length > 0) {
        userID = Object.keys(event.mentions)[0];
      }

      // 2. إذا لم تكن هناك صورة مرفقة، نطلب صورة البروفايل بجودة عالية (720x720)
      if (!imageUrl) {
        imageUrl = `https://graph.facebook.com/${userID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`;
      }

      if (message.react) message.react("⏳");

      // 3. تشفير رابط الصورة وبناء طلب الـ API
      const encodedAvatar = encodeURIComponent(imageUrl);
      const apiUrl = `https://api.some-random-api.com/canvas/overlay/triggered?avatar=${encodedAvatar}`;

      // 4. جلب الصورة بـ Stream
      const response = await axios.get(apiUrl, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      if (message.react) message.react("🔥");

      return message.reply({
        body: `🔥 | **تفضل يا حبة قلبي، الصورة بتأثير Triggered بجودة عالية HD:** ✨🌸`,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Triggered Command Error:", error?.message || error);
      if (message.react) message.react("🥺");
      return message.reply("🥺 **سامحني يا غالي، صرا مشكل مع السيرفر.. عاود جرب بالرد (Reply) على صورة مباشرة!**");
    }
  }
};
