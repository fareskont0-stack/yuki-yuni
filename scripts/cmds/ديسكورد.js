const axios = require("axios");

module.exports = {
  config: {
    name: "ديسكورد",
    version: "1.0.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "تصميم بوستر مطلوب للعدالة"
    },
    longDescription: {
      ar: "يدير بوستر WANTED على تصويرتك، تصويرة الشخص اللي درتلو تاغ، ولا التصويرة اللي درت عليها ريبلاي"
    },
    category: "تسلية",
    guide: {
      ar: "{p}مطلوب (تقدر تدير تاغ لكاش واحد ولا دير ريبلاي على تصويرة)"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    let imageUrl = "";

    // 1. تحديد مصدر الصورة (ريبلاي، تاغ، ولا تصويرة صاحب الأمر)
    if (event.type === "message_reply" && event.messageReply.attachments && event.messageReply.attachments.length > 0 && event.messageReply.attachments[0].type === "photo") {
      imageUrl = event.messageReply.attachments[0].url;
    } else if (event.type === "message_reply") {
      imageUrl = `https://graph.facebook.com/${event.messageReply.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`;
    } else if (Object.keys(event.mentions).length > 0) {
      const mentionID = Object.keys(event.mentions)[0];
      imageUrl = `https://graph.facebook.com/${mentionID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`;
    } else {
      imageUrl = `https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc154112c035045610b97d39103b994d8`;
    }

    try {
      if (message.react) message.react("⏳");

      // 2. تشفير رابط الصورة لحمايته من أخطاء الـ URL
      const encodedImage = encodeURIComponent(imageUrl);
      const apiUrl = `https://api.popcat.xyz/v2/wanted?image=${encodedImage}`;

      // 3. جلب الصورة كـ Stream مباشر
      const response = await axios.get(apiUrl, { responseType: "stream" });

      if (message.react) message.react("🤠");

      return message.reply({
        body: `🤠 | **هاك يا زميلي، البوستر تاع 'مطلوب للعدالة' واجد!**\n💰 **المكافأة: 5,000$ للي يجيبو حيو ولا ميت!**`,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Wanted Command Error:", error?.message || error);
      if (message.react) message.react("❌");
      return message.reply("❌ **صرا مشكل مع السيرفر يا خويا، عاود جرب من بعد!**");
    }
  }
};
