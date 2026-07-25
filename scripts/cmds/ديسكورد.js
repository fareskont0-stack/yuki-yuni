const axios = require("axios");

module.exports = {
  config: {
    name: "ديس",
    version: "1.6.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "محاكاة رسالة ديسكورد"
    },
    longDescription: {
      ar: "توليد صورة رسالة ديسكورد مطابقة تماماً لواجهة PopCat مع ألوان عشوائية وطابع زمني متجدد"
    },
    category: "تسلية",
    guide: {
      ar: "{p}ديسكورد [النص]"
    }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    try {
      let userID = event.senderID;
      let imageUrl = "";

      // 1. تحديد المستخدم والصورة في حال وجود ريبلاي أو منشن
      if (event.type === "message_reply") {
        userID = event.messageReply.senderID;
        if (event.messageReply.attachments && event.messageReply.attachments.length > 0 && event.messageReply.attachments[0].type === "photo") {
          imageUrl = event.messageReply.attachments[0].url;
        }
      } else if (Object.keys(event.mentions || {}).length > 0) {
        userID = Object.keys(event.mentions)[0];
      }

      // 2. استخراج وتنظيف النص من أي تاغ
      let textInput = args.join(" ");
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        for (const id in event.mentions) {
          textInput = textInput.replace(event.mentions[id], "").trim();
        }
      }

      if (!textInput) {
        return message.reply("🥺 **يا عمري، اكتبلي النص اللي حاب تظهرو في رسالة ديسكورد!**\n💡 **مثال:** `.ديسكورد سلام عليكم يا خاوتي ✨`");
      }

      if (message.react) message.react("⏳");

      // 3. جلب اسم المستخدم
      let userName = "Pop Cat";
      try {
        if (usersData && typeof usersData.getName === "function") {
          userName = await usersData.getName(userID);
        } else {
          const userInfo = await api.getUserInfo(userID);
          userName = userInfo[userID]?.name || "Pop Cat";
        }
      } catch (e) {
        userName = "Pop Cat";
      }

      // 4. صورة بروفايل العضو أو الصورة الافتراضية
      if (!imageUrl) {
        imageUrl = `https://graph.facebook.com/${userID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`;
      }

      // 5. توليد لون Hex عشوائي مع رمز (#) مشفر (%23) ليقبله السيرفر
      const randomHex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
      const colorParam = encodeURIComponent(`#${randomHex}`);

      // 6. الطابع الزمني الحالي بصيغة ISO الرسمية
      const timestampParam = encodeURIComponent(new Date().toISOString());

      // 7. تشفير البيانات وبناء رابط API المباشر
      const encodedUsername = encodeURIComponent(userName);
      const encodedContent = encodeURIComponent(textInput);
      const encodedAvatar = encodeURIComponent(imageUrl);

      const apiUrl = `https://api.popcat.xyz/v2/discord-message?username=${encodedUsername}&content=${encodedContent}&avatar=${encodedAvatar}&color=${colorParam}&timestamp=${timestampParam}`;

      // 8. جلب الصورة مع إرسال User-Agent لتفادي حظر الطلبات
      const response = await axios.get(apiUrl, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      if (message.react) message.react("💬");

      return message.reply({
        body: `💖 | **تفضل يا حبة قلبي، تصميم رسالة ديسكورد جاهز لعيونك:** ✨🌸`,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Discord Command Error:", error?.message || error);
      if (message.react) message.react("🥺");
      return message.reply("🥺 **سامحني يا غالي، صرا مشكل صغير مع السيرفر.. عاود جرب بعد شوية برك!**");
    }
  }
};
