const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
        config: {
                name: "قوقل",
                aliases: ["screenshot", "لقطة_شاشة", "موقع"],
                version: "2.0",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        ar: "التقط صورة شاشة لأي موقع إلكتروني عبر الرابط",
                        en: "Take a screenshot of any website URL"
                },
                category: "tools",
                guide: {
                        ar: '   {pn} <رابط الموقع>: اكتب رابط الموقع الذي تريد التقاط صورة له (مثال: https://google.com)'
                }
        },

        langs: {
                ar: {
                        noUrl: "× يا عُمري، أدخل رابط الموقع (URL) الذي تريد التقاط صورة له! 🌐",
                        invalidUrl: "× الرابط الذي أدخلته غير صالح، تأكد منه جيداً يا غالي! ⚠️",
                        success: "📸 ها هي لقطة الشاشة للموقع جاهزة وبأفضل جودة يا عسل! ✨",
                        error: "× حدث خطأ أثناء التقاط الشاشة (تأكد أن الموقع صحيح ومتاح): %1"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        let targetUrl = args[0];
                        if (!targetUrl) return message.reply(getLang("noUrl"));

                        // التأكد من أن الرابط يبدأ بـ http أو https
                        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
                                targetUrl = "https://" + targetUrl;
                        }

                        // التحقق البسيط من صحة الرابط
                        try {
                                new URL(targetUrl);
                        } catch {
                                return message.reply(getLang("invalidUrl"));
                        }

                        // إضافة تفاعل الانتظار
                        await new Promise((resolve) => api.setMessageReaction("⌛", event.messageID, resolve, true));

                        // رابط الـ API الخاص بلقطة الشاشة
                        const screenshotApi = `https://api.popcat.xyz/v2/screenshot?url=${encodeURIComponent(targetUrl)}`;

                        // إعداد مجلد الكاش وحفظ الصورة مؤقتاً
                        const cacheDir = path.join(__dirname, "cache");
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                        const filePath = path.join(cacheDir, `screenshot_${Date.now()}.png`);

                        const response = await axios.get(screenshotApi, { responseType: "arraybuffer" });
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
                        console.error("Screenshot Command Error:", err);
                        await new Promise((resolve) => api.setMessageReaction("❌", event.messageID, resolve, true));
                        return message.reply(getLang("error", err.message));
                }
        }
};
