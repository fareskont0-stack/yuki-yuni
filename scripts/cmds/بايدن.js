const axios = require("axios");

module.exports = {
  config: {
    name: "بايدن",
    version: "1.0.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "توليد تغريدة بايدن باللغة العربية"
    },
    longDescription: {
      ar: "جعل بايدن يغرد بأي نص تكتبه مع دعم كامل وحقيقي للغة العربية والرموز"
    },
    category: "تسلية",
    guide: {
      ar: "{p}بايدن [النص]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      // 1. قراءة النص المدخل
      const textInput = args.join(" ");

      if (!textInput) {
        return message.reply("🥺 **يا عمري، اكتبلي برك النص اللي حاب بايدن يغرد بيه!**\n💡 **مثال:** `.بايدن تحيا الجزائر وربي يحفظكم ✨`");
      }

      if (message.react) message.react("⏳");

      // 2. التشفير التام للنص العربي والرموز (يمنع أخطاء URL بالكامل)
      const encodedText = encodeURIComponent(textInput);
      const apiUrl = `https://api.popcat.xyz/v2/biden?text=${encodedText}`;

      // 3. جلب التغريدة كـ Stream مباشر
      const response = await axios.get(apiUrl, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      if (message.react) message.react("🐦");

      // 4. إرسال الصورة للمحادثة
      return message.reply({
        body: `💖 | **تفضل يا حبة قلبي، تغريدة بايدن واجدة لعيونك:** ✨🌸`,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Biden Command Error:", error?.message || error);
      if (message.react) message.react("🥺");
      return message.reply("🥺 **سامحني يا غالي، صرا مشكل مع السيرفر.. عاود جرب بعد شوية برك!**");
    }
  }
};
