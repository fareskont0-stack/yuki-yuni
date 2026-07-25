const axios = require("axios");

module.exports = {
  config: {
    name: "زواج",
    version: "1.0.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "عقد زواج وتوافق بين شخصين"
    },
    longDescription: {
      ar: "يقوم بعمل عقد زواج افتراضي وحساب نسبة التوافق بالصور بينك وبين العضو المحدد، أو بين شخصين تقوم بعمل تاغ لهما"
    },
    category: "تسلية",
    guide: {
      ar: "{p}زواج @عضو أو {p}زواج @عضو1 @عضو2"
    }
  },

  onStart: async function ({ api, event, message, usersData }) {
    try {
      const mentions = Object.keys(event.mentions || {});
      let user1ID, user2ID;

      // 1. تحديد الشخصين
      if (mentions.length >= 2) {
        user1ID = mentions[0];
        user2ID = mentions[1];
      } else if (mentions.length === 1) {
        user1ID = event.senderID;
        user2ID = mentions[0];
      } else {
        return message.reply("🥺 **يا عمري، لازم تعمل تاغ للشخص اللي حاب تتزوج بيه!**\n💡 **مثال:** `.زواج @اسم_العضو`");
      }

      if (user1ID === user2ID) {
        return message.reply("😂 **ما تقدرش تتزوج روحك يا زميلي! منشن شخص ثاني.**");
      }

      if (message.react) message.react("⏳");

      // 2. جلب أسماء الطرفين
      let name1 = "الطرف الأول";
      let name2 = "الطرف الثاني";

      try {
        if (usersData && typeof usersData.getName === "function") {
          name1 = await usersData.getName(user1ID);
          name2 = await usersData.getName(user2ID);
        } else {
          const info1 = await api.getUserInfo(user1ID);
          const info2 = await api.getUserInfo(user2ID);
          name1 = info1[user1ID]?.name || "الطرف الأول";
          name2 = info2[user2ID]?.name || "الطرف الثاني";
        }
      } catch (e) {}

      // 3. روابط صور البروفايل للطرفين
      const avatar1 = encodeURIComponent(`https://graph.facebook.com/${user1ID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`);
      const avatar2 = encodeURIComponent(`https://graph.facebook.com/${user2ID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`);

      // 4. رابط PopCat Ship API
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
        `🤵 **العريس:** ${name1}\n` +
        `👰 **العروس:** ${name2}\n\n` +
        `💖 **ألف مبروك للعروسين، ربي يجمع بيناتكم بالخير!** 🌸✨`;

      return message.reply({
        body: msgText,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Marry Command Error:", error?.message || error);
      if (message.react) message.react("🥺");
      return message.reply("🥺 **حدث خطأ أثناء إتمام عقد الزواج، حاول مرة أخرى!**");
    }
  }
};
