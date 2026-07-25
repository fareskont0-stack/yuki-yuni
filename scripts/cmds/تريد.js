const axios = require("axios");

module.exports = {
  config: {
    name: "تريد",
    version: "1.1.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "تأثير Triggered على الصورة"
    },
    longDescription: {
      ar: "توليد صورة متحركة بصيغة GIF بتأثير الاهتزاز الشهير على صورتك أو صورة العضو المحدّد"
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

      // 1. تحديد الصورة من الريبلاي، المنشن، أو العضو الحالي
      if (event.type === "message_reply") {
        userID = event.messageReply.senderID;
        if (event.messageReply.attachments && event.messageReply.attachments.length > 0 && event.messageReply.attachments[0].type === "photo") {
          imageUrl = event.messageReply.attachments[0].url;
        }
      } else if (Object.keys(event.mentions || {}).length > 0) {
        userID = Object.keys(event.mentions)[0];
      }

      // 2. جلب رابط صورة البروفايل المباشر المضمون من فيسبوك
      if (!imageUrl) {
        try {
          const userInfo = await api.getUserInfo(userID);
          if (userInfo && userInfo[userID] && userInfo[userID].thumbSrc) {
            imageUrl = userInfo[userID].thumbSrc;
          }
        } catch (e) {}
      }

      // صورة بديلة مضمونة 100% في حال تعذر جلب البروفايل
      if (!imageUrl) {
        imageUrl = "https://i.imgur.com/6EaXf9v.png";
      }

      if (message.react) message.react("⏳");

      // 3. تشفير رابط الصورة وبناء رابط الـ API
      const encodedAvatar = encodeURIComponent(imageUrl);
      const apiUrl = `https://some-random-api.com/canvas/overlay/triggered?avatar=${encodedAvatar}`;

      // 4. جلب ملف الـ GIF
      const response = await axios.get(apiUrl, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      if (message.react) message.react("🔥");

      return message.reply({
        body: `🔥 | **تفضل يا حبة قلبي، الصورة بتأثير Triggered واجدة لعيونك:** ✨🌸`,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Triggered Command Error:", error?.response?.data || error?.message || error);
      if (message.react) message.react("🥺");
      return message.reply("🥺 **سامحني يا غالي، صرا مشكل مع السيرفر.. عاود جرب بالرد (Reply) على صورة مباشرة!**");
    }
  }
};
