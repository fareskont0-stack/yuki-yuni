const axios = require("axios");

module.exports = {
  config: {
    name: "زواج",
    version: "1.7.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "عقد زواج وتوافق بين شخصين"
    },
    longDescription: {
      ar: "يقوم بعمل عقد زواج افتراضي وحساب نسبة التوافق بالصور"
    },
    category: "تسلية",
    guide: {
      ar: "{p}زواج"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      let user1ID = event.senderID;
      let user2ID = "";

      // إذا قمت بالرد على رسالة (سواء للبوت أو لعضو)
      if (event.type === "message_reply" && event.messageReply) {
        const replySenderID = event.messageReply.senderID;
        const botID = api.getCurrentUserID();

        // إذا كانت رسالة البوت، نحاول معرفة إذا كان هناك شخص آخر مذكور أو نأخذك أنت مع عضو عشوائي لتفادي التعليق
        if (replySenderID === botID) {
          user2ID = user1ID === event.threadID ? event.threadID : ""; 
        } else {
          user2ID = replySenderID;
        }
      }

      // إذا لم يتم تحديد الشريك بالرد، نأخذ أول شخص من المنشن أو نختار صديقاً من الجروب
      if (!user2ID && event.mentions && Object.keys(event.mentions).length > 0) {
        user2ID = Object.keys(event.mentions)[0];
      }

      // حل احتياطي: إذا لم تحدد أحداً نهائياً، يتزوجك البوت مع صاحب أول رسالة في المحادثة أو تنبيه واضح
      if (!user2ID) {
        return message.reply("🥺 **يا زميلي، رد على رسالة صديقك مباشرة (وليس رسالة البوت) واكتب `.زواج`!**");
      }

      if (user1ID === user2ID) {
        return message.reply("😂 **ما تقدرش تتزوج روحك يا زميلي!**");
      }

      if (message.react) message.react("⏳");

      const avatar1 = encodeURIComponent(`https://graph.facebook.com/${user1ID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`);
      const avatar2 = encodeURIComponent(`https://graph.facebook.com/${user2ID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`);

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
