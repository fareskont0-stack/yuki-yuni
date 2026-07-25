const axios = require("axios");

module.exports = {
  config: {
    name: "ديس",
    version: "1.3.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "محاكاة رسالة ديسكورد بألوان عشوائية"
    },
    longDescription: {
      ar: "توليد صورة رسالة ديسكورد بألوان عشوائية متغيرة في كل مرة"
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

      // 1. فحص إذا كان هناك رد على صورة
      if (event.type === "message_reply") {
        userID = event.messageReply.senderID;
        if (event.messageReply.attachments && event.messageReply.attachments.length > 0 && event.messageReply.attachments[0].type === "photo") {
          imageUrl = event.messageReply.attachments[0].url;
        }
      } else if (Object.keys(event.mentions || {}).length > 0) {
        userID = Object.keys(event.mentions)[0];
      }

      // 2. قراءة وتنظيف النص من المنشن
      let textInput = args.join(" ");
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        for (const id in event.mentions) {
          textInput = textInput.replace(event.mentions[id], "").trim();
        }
      }

      if (!textInput) {
        return message.reply("🥺 **يا عمري، اكتبلي برك الرسالة اللي حاب تظهرها في ديسكورد!**\n💡 **مثال:** `.ديسكورد سلام عليكم يا خاوتي ✨`");
      }

      if (message.react) message.react("⏳");

      // 3. جلب اسم المستخدم ورابط صورته المباشر (thumbSrc) من فيسبوك
      let userName = "عضو";
      try {
        const userInfo = await api.getUserInfo(userID);
        if (userInfo && userInfo[userID]) {
          userName = userInfo[userID].name || "عضو";
          // thumbSrc هو الرابط المباشر الصافي من fbcdn
          if (!imageUrl && userInfo[userID].thumbSrc) {
            imageUrl = userInfo[userID].thumbSrc;
          }
        }
      } catch (e) {
        if (usersData && typeof usersData.getName === "function") {
          try { userName = await usersData.getName(userID); } catch (err) {}
        }
      }

      // 4. خطة بديلة إذا لم تتوفر الصورة (استخدام أفتار ديسكورد المباشر)
      if (!imageUrl) {
        try {
          const res = await axios.get(`https://graph.facebook.com/${userID}/picture?type=large`, {
            maxRedirects: 5,
            timeout: 3000
          });
          imageUrl = res.request?.res?.responseUrl || "https://cdn.discordapp.com/embed/avatars/0.png";
        } catch (e) {
          imageUrl = "https://cdn.discordapp.com/embed/avatars/0.png";
        }
      }

      // 5. قائمة بألوان ديسكورد الرائعة للاختيار العشوائي
      const discordColors = [
        "5865F2", "57F287", "FEE75C", "EB459E", "ED4245", 
        "9B59B6", "1ABC9C", "E67E22", "3498DB", "E74C3C"
      ];
      const randomColor = discordColors[Math.floor(Math.random() * discordColors.length)];

      // 6. تشفير المعاملات وبناء رابط PopCat
      const encodedUsername = encodeURIComponent(userName);
      const encodedContent = encodeURIComponent(textInput);
      const encodedAvatar = encodeURIComponent(imageUrl);

      const apiUrl = `https://api.popcat.xyz/v2/discord-message?username=${encodedUsername}&content=${encodedContent}&avatar=${encodedAvatar}&color=${randomColor}`;

      // 7. جلب الصورة كـ Stream وإرسالها
      const response = await axios.get(apiUrl, { 
        responseType: "stream",
        timeout: 10000
      });

      if (message.react) message.react("💬");

      return message.reply({
        body: `💖 | **تفضل يا حبة قلبي، الرسالة واجدة بلون جديد ومميز لعيونك الحلوين:** ✨🌸`,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Discord Command Error:", error?.response?.data || error?.message || error);
      if (message.react) message.react("🥺");
      return message.reply("🥺 **سامحني يا غالي، صرا مشكل صغير مع السيرفر.. عاود جرب بعد شوية برك!**");
    }
  }
};
