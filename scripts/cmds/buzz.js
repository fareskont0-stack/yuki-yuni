const axios = require("axios");

module.exports = {
  config: {
    name: "باز",
    version: "1.0.0",
    author: "Fares",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "توليد ميم باز يطير (Memes Everywhere)"
    },
    longDescription: {
      ar: "إنشاء ميمز باز ووداي الشهير بدعم ممتاز للغة العربية. استخدم الرمز | للفصل بين النص العلوي والسفلي."
    },
    category: "تسلية",
    guide: {
      ar: "{p}باز [النص العلوي] | [النص السفلي]"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      const fullText = args.join(" ");

      if (!fullText) {
        return message.reply("🥺 **يا عمري، اكتب النص العلوي والسفلي وفصل بيناتهم بـ `|`!**\n💡 **مثال:** `.باز ميمز | ميمز في كل مكان ✨`");
      }

      // 1. تقسيم النص إلى جزء علوي وجزء سفلي عند رمز | أو /
      let [topText, bottomText] = fullText.split(/[\/|]/).map(t => t.trim());

      if (!topText) topText = " ";
      if (!bottomText) bottomText = " ";

      if (message.react) message.react("⏳");

      // 2. معالجة النصوص الخاصة لتتوافق مع Memegen API
      const sanitize = (str) => {
        return encodeURIComponent(
          str
            .replace(/_/g, "__")
            .replace(/-/g, "--")
            .replace(/ /g, "_")
            .replace(/\?/g, "~q")
            .replace(/%/g, "~p")
            .replace(/#/g, "~h")
        );
      };

      const cleanTop = sanitize(topText);
      const cleanBottom = sanitize(bottomText);

      // 3. بناء رابط الـ API بصيغة .png لجودة عالية
      const apiUrl = `https://api.memegen.link/images/buzz/${cleanTop}/${cleanBottom}.png`;

      // 4. جلب الصورة كـ Stream إرسال مباشر
      const response = await axios.get(apiUrl, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      if (message.react) message.react("🚀");

      return message.reply({
        body: `🚀 | **تفضل يا حبة قلبي، الميم واجد لعيونك:** ✨🌸`,
        attachment: [response.data]
      });

    } catch (error) {
      console.error("Buzz Meme Error:", error?.message || error);
      if (message.react) message.react("🥺");
      return message.reply("🥺 **سامحني يا غالي، صرا مشكل أثناء توليد الصورة.. عاود جرب بعد شوية!**");
    }
  }
};
