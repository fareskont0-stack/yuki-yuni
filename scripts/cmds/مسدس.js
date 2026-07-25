const axios = require("axios");

module.exports = {
  config: {
    name: "مسدس",
    version: "1.0.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "تركيب تأثير المسدس على الصورة"
    },
    longDescription: {
      ar: "يدير تأثير مسدس مع نص مخصص على تصويرتك، تصويرة اللي منشنتو، ولا تصويرة ردّيت عليها"
    },
    category: "تسلية",
    guide: {
      ar: "{p}مسدس [النص] (تقدر تدير تاغ لكاش واحد ولا دير ريبلاي على تصويرتو)"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    let imageUrl = "";

    // 1. تحديد مصدر الصورة (ريبلاي، تاغ، ولا بروفايل مول الأمر)
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

    // 2. تنظيف النص من المنشن إن وجد
    let textInput = args.join(" ");
    if (Object.keys(event.mentions).length > 0) {
      for (const id in event.mentions) {
        textInput = textInput.replace(event.mentions[id], "").trim();
      }
    }

    // نص افتراضي بالجزائرية إذا ما كتب والو
    if (!textInput) {
      textInput = "أعطيني درهمي ولا نكارتيك!";
    }

    try {
      if (message.react) message.react("⏳");

      // 3. ترميز الرابط والنص باش ما يصراش خطأ 400 Bad Request
      const encodedImage = encodeURIComponent(imageUrl);
      const encodedText = encodeURIComponent(textInput);
      const apiUrl = `https://api.popcat.xyz/v2/gun?image=${encodedImage}&text=${encodedText}`;

      // 4. جلب الصورة كـ Stream مباشر
      const response = await axios.get(apiUrl, { responseType: "stream" });

      if (message.react) message.react("🔫");

      return message.reply({
        body: `🔫 | **هاك يا خويا التصويرة واجدة لعيونك:**`,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Gun Command Error:", error?.message || error);
      if (message.react) message.react("❌");
      return message.reply("❌ **صرا مشكل مع السيرفر تاع التصاوير يا خويا، عاود جرب من بعد!**");
    }
  }
};
