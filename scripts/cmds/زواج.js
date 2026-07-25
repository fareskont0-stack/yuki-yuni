const axios = require("axios");

module.exports = {
  config: {
    name: "زواج",
    version: "1.2.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "عقد زواج وتوافق بين شخصين أو اختيار عشوائي"
    },
    longDescription: {
      ar: "يقوم بعمل عقد زواج افتراضي بالرد على شخص، بالمنشن، أو اختيار عضو عشوائي من المجموعة تلقائياً"
    },
    category: "تسلية",
    guide: {
      ar: "{p}زواج (عشوائي) أو {p}زواج (بالرد) أو {p}زواج @منشن"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      let user1ID = event.senderID;
      let user2ID = "";

      const mentions = Object.keys(event.mentions || {});

      // 1. التحقق من الرد (Reply)
      if (event.type === "message_reply") {
        user2ID = event.messageReply.senderID;
      } 
      // 2. التحقق من المنشن (Mention)
      else if (mentions.length > 0) {
        user2ID = mentions[0];
      } 
      // 3. إذا لم يحدد شيئاً، نختار عضواً عشوائياً من المجموعة
      else {
        try {
          const threadInfo = await api.getThreadInfo(event.threadID);
          const participantIDs = threadInfo.participantIDs.filter(id => id !== user1ID && id !== api.getCurrentUserID());
          
          if (participantIDs.length > 0) {
            user2ID = participantIDs[Math.floor(Math.random() * participantIDs.length)];
          }
        } catch (e) {}
      }

      if (!user2ID) {
        return message.reply("🥺 **يا زميلي، لم أجد أعضاء كافيين في المجموعة لاختيار شريك عشوائي، جرب عمل تاغ أو رد على شخص!**");
      }

      if (user1ID === user2ID) {
        return message.reply("😂 **ما تقدرش تتزوج روحك يا زميلي!**");
      }

      if (message.react) message.react("⏳");

      // 4. جلب أسماء الطرفين
      let name1 = "الطرف الأول";
      let name2 = "الطرف الثاني";

      try {
        const info1 = await api.getUserInfo(user1ID);
        const info2 = await api.getUserInfo(user2ID);
        name1 = info1[user1ID]?.name || "الطرف الأول";
        name2 = info2[user2ID]?.name || "الطرف الثاني";
      } catch (e) {}

      // 5. روابط صور البروفايل بجودة عالية
      const avatar1 = encodeURIComponent(`https://graph.facebook.com/${user1ID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`);
      const avatar2 = encodeURIComponent(`https://graph.facebook.com/${user2ID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`);

      // 6. رابط PopCat Ship API
      const apiUrl = `https://api.popcat.xyz/ship?user1=${avatar1}&user2=${avatar2}`;

      const response = await axios.get(apiUrl, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      if (message.react) message.react("💍");

      const msgText = 
        `💍✨ **عقد زواج مبارك (اختيار عشوائي)** ✨💍\n` +
        `----------------------------------\n` +
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
