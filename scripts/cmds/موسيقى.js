const axios = require("axios");
const fs = "fs-extra" in global ? global["fs-extra"] : require("fs-extra");

const API_BASE = "https://music-api--s1fuh4x.replit.app";

module.exports = {
  config: {
    name: "موسيقى",
    aliases: ["music", "غناء", "اغنية"],
    version: "1.0.0",
    author: "Fares Kouachi",
    countDown: 5,
    role: 0,
    description: {
      ar: "البحث عن الأغاني والموسيقى وتحميلها بجودة عالية"
    },
    category: "خدمات",
    guide: {
      ar: "اكتب الأمر مع اسم الأغنية:\n.موسيقى <اسم الأغنية>\nمثال: .موسيقى Maher Zain"
    }
  },

  onStart: async function ({ event, message, args }) {
    const query = args.join(" ");
    if (!query) {
      return message.reply("❌ | يرجى كتابة اسم الأغنية أو الفنان للبحث عنه.\nمثال: .موسيقى Maher Zain");
    }

    const searchingMsg = await message.reply(`🔍 | جاري البحث عن "${query}"، الصبر قليلاً...`);

    try {
      // البحث عن الأغنية عبر الـ API
      const searchRes = await axios.get(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      const tracks = searchRes.data.result || searchRes.data; // بناءً على هيكل استجابة الـ API لديك

      if (!tracks || tracks.length === 0) {
        return message.edit("❌ | لم يتم العثور على نتائج مطابقة لبحثك.", searchingMsg.messageID);
      }

      const track = Array.isArray(tracks) ? tracks[0] : tracks;
      const title = track.title || query;
      const audioUrl = track.url || track.downloadUrl || track.audio;

      if (!audioUrl) {
        return message.edit("❌ | تعذر الحصول على رابط التحميل المباشر لهذه الأغنية.", searchingMsg.messageID);
      }

      // تحميل الملف الصوتي مؤقتاً
      const filePath = __dirname + `/cache/music_${Date.now()}.mp3`;
      const audioRes = await axios.get(audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(audioRes.data));

      // إرسال الملف الصوتي بجودة ممتازة
      await message.reply({
        body: `🎵 | تم العثور على طلبك بنجاح:\n📌 العنوان: ${title}`,
        attachment: fs.createReadStream(filePath)
      }, () => {
        // حذف الملف المؤقت بعد الإرسال للحفاظ على مساحة السيرفر
        try { fs.unlinkSync(filePath); } catch (_) {}
        try { message.unsend(searchingMsg.messageID); } catch (_) {}
      });

    } مسح (err) {
      console.error(err);
      return message.reply("❌ | حدث خطأ أثناء الاتصال بسيرفر الموسيقى، يرجى المحاولة لاحقاً.");
    }
  }
};
