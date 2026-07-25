const axios = require("axios");

module.exports = {
  config: {
    name: "ديسكورد",
    version: "1.2.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "محاكاة رسالة ديسكورد بألوان عشوائية"
    },
    longDescription: {
      ar: "توليد صورة رسالة ديسكورد بألوان عشوائية متغيرة في كل مرة مع دعم المنشن والريبلاي"
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

      // 1. تحديد المستخدم والصورة من الريبلاي أو المنشن
      if (event.type === "message_reply") {
        userID = event.messageReply.senderID;
        if (event.messageReply.attachments && event.messageReply.attachments.length > 0 && event.messageReply.attachments[0].type === "photo") {
          imageUrl = event.messageReply.attachments[0].url;
        }
      } else if (Object.keys(event.mentions || {}).length > 0) {
        userID = Object.keys(event.mentions)[0];
      }

      // إذا لم توجد صورة مرفقة، نستخدم أفتار المباشر المضمون بدون توكن
      if (!imageUrl) {
        imageUrl = `https://graph.facebook.com/${userID}/picture?type=large`;
      }

      // 2. تنظيف النص من المنشن
      let textInput = args.join(" ");
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        for (const id in event.mentions) {
          textInput = textInput.replace(event.mentions[id], "").trim();
        }
      }

      if (!textInput) {
        return message.reply("🥺 **يا عمري، اكتبلي برك الرسالة اللي حاب تظهرها في ديسكورد!**\n💡 **مثال:** `.ديسكورد سلام عليكم يا خاوتي ✨`");
      }

      if (message.react) message.react("✨");

      // 3. جلب اسم المستخدم
      let userName = "عضو";
      try {
        if (usersData && typeof usersData.getName === "function") {
          userName = await usersData.getName(userID);
        } else {
          const userInfo = await api.getUserInfo(userID);
          userName = userInfo[userID]?.name || "عضو";
        }
      } catch (e) {
        userName = "عضو";
      }

      // 4. توليد لون Hex عشوائي صافي بدون رمز # لضمان التوافق مع PopCat
      const randomHex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

      // 5. تشفير المعاملات وتجهيز الرابط
      const encodedUsername = encodeURIComponent(userName);
      const encodedContent = encodeURIComponent(textInput);
      const encodedAvatar = encodeURIComponent(imageUrl);

      const apiUrl = `https://api.popcat.xyz/v2/discord-message?username=${encodedUsername}&content=${encodedContent}&avatar=${encodedAvatar}&color=${randomHex}`;

      // 6. جلب الصورة كـ Stream وإرسالها
      const response = await axios.get(apiUrl, { responseType: "stream" });

      if (message.react) message.react("💬");

      return message.reply({
        body: `💖 | **تفضل يا حبة قلبي، الرسالة واجدة بلون جديد ومميز لعيونك الحلوين:** ✨🌸`,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Discord Command Error:", error?.message || error);
      if (message.react) message.react("🥺");
      return message.reply("🥺 **سامحني يا غالي، صرا مشكل صغير مع السيرفر.. عاود جرب بعد شوية برك!**");
    }
  }
};
