const axios = require("axios");

module.exports = {
  config: {
    name: "تريد",
    version: "1.0.0",
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

      // إذا لم توجد صورة مرفقة، نستخدم أفتار الفيسبوك
      if (!imageUrl) {
        imageUrl = `https://graph.facebook.com/${userID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`;
      }

      if (message.react) message.react("⏳");

      // 2. تشفير رابط الصورة وبناء رابط الـ API من Some Random API
      const encodedAvatar = encodeURIComponent(imageUrl);
      const apiUrl = `https://api.some-random-api.com/canvas/overlay/triggered?avatar=${encodedAvatar}`;

      // 3. جلب ملف الـ GIF كـ Stream مباشر
      const response = await axios.get(apiUrl, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      if (message.react) message.react("🔥");

      // 4. إرسال النتيجة إلى المحادثة
      return message.reply({
        body: `🔥 | **تفضل يا حبة قلبي، الصورة بتأثير Triggered واجدة لعيونك:** ✨🌸`,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Triggered Command Error:", error?.message || error);
      if (message.react) message.react("🥺");
      return message.reply("🥺 **سامحني يا غالي، صرا مشكل مع السيرفر.. عاود جرب بعد شوية برك!**");
    }
  }
};
