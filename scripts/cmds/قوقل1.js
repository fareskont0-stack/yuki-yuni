const axios = require("axios");

module.exports = {
  config: {
    name: "لا_تغفر",
    version: "1.0.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "توليد صورة ميم الذنوب التي لا تغفر"
    },
    longDescription: {
      ar: "يقوم بتوليد صورة ميم لطيفة تحتوي على بحث قوقل بالنص الذي تحدده"
    },
    category: "تسلية",
    guide: {
      ar: "{p}لا_تغفر [النص]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    // 1. قراءة النص المدخل من العضو
    const textInput = args.join(" ");

    if (!textInput) {
      return message.reply("🥺 **يا عمري، اكتبلي برك النص اللي حاب تخرجو في الصورة!**\n💡 **مثال:** `.لا_تغفر نساني وما سقساش عليا 💔`");
    }

    try {
      // تفاعل لطيف أثناء معالجة الطلب
      if (message.react) message.react("✨");

      // 2. تشفير النص لمنع أخطاء الروابط واللغة العربية
      const encodedText = encodeURIComponent(textInput);
      const apiUrl = `https://api.popcat.xyz/v2/unforgivable?text=${encodedText}`;

      // 3. جلب الصورة كـ Stream مباشر
      const response = await axios.get(apiUrl, { responseType: "stream" });

      if (message.react) message.react("💖");

      // 4. إرسال الصورة مع عبارات محبة
      return message.reply({
        body: `💖 | **تفضل يا حبة قلبي، التصويرة جاهزة لعيونك الحلوين:** ✨🌸`,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Unforgivable Command Error:", error?.message || error);
      if (message.react) message.react("🥺");
      return message.reply("🥺 **سامحني يا غالي، صرا مشكل صغير مع السيرفر.. عاود جرب بعد شوية برك!**");
    }
  }
};
