const axios = require("axios");

module.exports = {
  config: {
    name: "زواج",
    version: "1.5.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "عقد زواج وتوافق بين شخصين"
    },
    longDescription: {
      ar: "يقوم بعمل عقد زواج افتراضي وحساب نسبة التوافق بالصور من خلال الرد على رسالة الشخص"
    },
    category: "تسلية",
    guide: {
      ar: "{p}زواج (بالرد على رسالة الشخص)"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      let user1ID = event.senderID;
      let user2ID = "";

      // التحقق من الرد (Reply)
      if (event.type === "message_reply") {
        user2ID = event.messageReply.senderID;
      } 
      // التحقق من المنشن المباشر إذا وجد
      else if (event.mentions && Object.keys(event.mentions).length > 0) {
        user2ID = Object.keys(event.mentions)[0];
      }

      if (!user2ID) {
        return message.reply("🥺 **يا زميلي، قم بعمل (رد / Reply) على رسالة الشخص الذي تريد الزواج به واكتب `.زواج`!**");
      }

      if (user1ID === user2ID) {
        return message.reply("😂 **ما تقدرش تتزوج روحك يا زميلي! اختر شخصاً آخر.**");
      }

      if (message.react) message.react("⏳");

      // استخدام روابط صور الأفاتار مباشرة بدون طلب معلومات معقدة لتجنب الأخطاء
      const avatar1 = encodeURIComponent(`https://graph.facebook.com/${user1ID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`);
      const avatar2 = encodeURIComponent(`https://graph.facebook.com/${user2ID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`);

      // رابط PopCat Ship API لجلب صورة الزواج مباشرة
      const apiUrl = `https://api.popcat.xyz/ship?user1=${avatar1}&user2=${avatar2}`;

      const response = await axios.get(apiUrl, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      if (message.react) message.react("💍");

      const msgText = 
        `💍✨ **عقد زواج مبارك** ✨💍\n` +
        `-------------------------\n` +
        `💖 **ألف مبروك للعروسين، ربي يجمع بيناتكم بالخير!** 🌸✨`;

      return message.reply({
        body: msgText,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Marry Command Error:", error?.message || error);
      if (message.react) message.react("🥺");
      return message.reply("🥺 **حدث خطأ بسيط في السيرفر، عاود جرب بعد قليل!**");
    }
  }
};
