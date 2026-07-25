const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
        config: {
                name: "قطة",
                aliases: ["sadcat", "قطة_حزينة"],
                version: "2.0",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        ar: "اصنع ميم قطة حزينة مع النص الذي تريده",
                        en: "Create a sad cat meme with your custom text"
                },
                category: "fun",
                guide: {
                        ar: '   {pn} <النص>: اكتب النص الذي تريد أن يظهر بجانب القطة الحزينة'
                }
        },

        langs: {
                ar: {
                        noText: "× يا عُمري، اكتب النص اللي حاب يظهر مع القطة الحزينة! 😿",
                        success: "😿 ها هو ميم القطة الحزينة جاهز، يعبر عن الواقع تماماً يا غالي! 🕯️",
                        error: "× حدث خطأ أثناء إنشاء الصورة: %1"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const userText = args.join(" ").trim();
                        if (!userText) return message.reply(getLang("noText"));

                        // إضافة تفاعل الانتظار
                        await new Promise((resolve) => api.setMessageReaction("⌛", event.messageID, resolve, true));

                        // رابط الـ API الخاص بالقطة الحزينة
                        const sadCatApi = `https://api.popcat.xyz/v2/sadcat?text=${encodeURIComponent(userText)}`;

                        // إعداد مجلد الكاش وحفظ الصورة مؤقتاً
                        const cacheDir = path.join(__dirname, "cache");
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                        const filePath = path.join(cacheDir, `sadcat_${Date.now()}.png`);

                        const response = await axios.get(sadCatApi, { responseType: "arraybuffer" });
                        fs.writeFileSync(filePath, Buffer.from(response.data));

                        // إرسال الصورة مع التفاعل الناجح
                        return message.reply({
                                body: getLang("success"),
                                attachment: fs.createReadStream(filePath)
                        }, async () => {
                                await new Promise((resolve) => api.setMessageReaction("✅", event.messageID, resolve, true));
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        });

                } catch (err) {
                        console.error("Sadcat Command Error:", err);
                        await new Promise((resolve) => api.setMessageReaction("❌", event.messageID, resolve, true));
                        return message.reply(getLang("error", err.message));
                }
        }
};
