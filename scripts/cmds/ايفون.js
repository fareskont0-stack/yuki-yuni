const axios = require("axios");

module.exports = {
  config: {
    name: "ايفون",
    version: "1.0.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "إنشاء صورة تنبيه آيفون"
    },
    longDescription: {
      ar: "يقوم بتوليد صورة تنبيه طوارئ للهاتف (iPhone Alert) بالنص الذي تحدده"
    },
    category: "ترفيه",
    guide: {
      ar: "{p}تحذير [النص المطلوب]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    // 1. قراءة النص المدخل من المستخدم
    const textInput = args.join(" ");

    if (!textInput) {
      return message.reply("⚠️ **يرجى كتابة النص الذي تريد إظهاره داخل التنبيه!**\n💡 **مثال:** `.تحذير انتبه البوت يعمل بنجاح`");
    }

    try {
      // 2. وضع تفاعل أثناء تجهيز الصورة
      if (message.react) message.react("⏳");

      // 3. ترميز النص واستدعاء الـ API المباشر
      const encodedText = encodeURIComponent(textInput);
      const apiUrl = `https://api.popcat.xyz/v2/alert?text=${encodedText}`;

      // 4. جلب الصورة كمجرى بيانات (Stream)
      const response = await axios.get(apiUrl, { responseType: "stream" });

      // 5. التفاعل بنجاح وإرسال الصورة داخل مصفوفة [response.data]
      if (message.react) message.react("📱");

      return message.reply({
        body: `🚨 | **تفضل يا غالي، هذه صورة التنبيه لعيونك:**`,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Alert Command Error:", error?.message || error);
      if (message.react) message.react("❌");
      return message.reply("❌ **حدث خطأ أثناء الاتصال بسيرفر الصور، يرجى المحاولة لاحقاً.**");
    }
  }
};
