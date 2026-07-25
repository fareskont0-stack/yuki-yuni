const axios = require("axios");

module.exports = {
    config: {
        name: "قران",
        aliases: ["quran"],
        version: "1.0",
        author: "Fares",
        role: 0,
        category: "ديني",
        description: "البحث عن سورة أو آية قرآنية",
        countDown: 5
    },
    onStart: async function ({ message, args }) {
        const query = args.join(" ");
        if (!query) {
            return message.reply("⚠️ يا غالي، اكتب اسم السورة أو الكلمة للبحث.\nمثال: `!قرآن الكهف`");
        }

        try {
            const res = await axios.get(`http://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/ar.muyassar`);
            const data = res.data.data;
            
            if (!data || !data.matches.length) {
                return message.reply("❌ لم يتم العثور على نتائج مطابقة لبحثك.");
            }

            const match = data.matches[0];
            const replyMsg = `📖 **الآية الكريمة:**\n` +
                             `━━━━━━━━━━━━━━━\n` +
                             `"${match.text}"\n\n` +
                             `📌 **السورة:** ${match.surah.name} (آية رقم: ${match.numberInSurah})`;

            return message.reply(replyMsg);
        } catch (error) {
            return message.reply("❌ حدث خطأ أثناء الاتصال بقاعدة بيانات القرآن الكريم.");
        }
    }
};
