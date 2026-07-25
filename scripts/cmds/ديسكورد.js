const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
        config: {
                name: "ديسكورد",
                aliases: ["discord", "ديس"],
                version: "2.1",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        ar: "اصنع صورة رسالة ديسكورد وهمية بالنص الذي تريده",
                        en: "Create a fake Discord message image with your text"
                },
                category: "fun",
                guide: {
                        ar: '   {pn} <النص>: اكتب النص ليظهر في رسالة ديسكورد'
                }
        },

        langs: {
                ar: {
                        noText: "× يا عُمري، اكتب النص اللي حاب تظهرو في رسالة ديسكورد!\n💡 مثال: `.ديسكورد سلام عليكم يا خوتي ✨`",
                        success: "💬 ها هي رسالة ديسكورد جاهزة وبأفضل جودة يا غالي! 🚀",
                        error: "× سامحني يا غالي، صرا مشكل صغير مع السيرفر.. عاود جرب بعد شوية برك!"
                }
        },

        onStart: async function ({ api, event, args, message, usersData, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const userText = args.join(" ").trim();
                        if (!userText) return message.reply(getLang("noText"));

                        // إضافة تفاعل الانتظار
                        await new Promise((resolve) => api.setMessageReaction("⌛", event.messageID, resolve, true));

                        // جلب اسم مستخدم البوت أو المرسل
                        let senderName = "User";
                        try {
                                senderName = (await usersData.getName(event.senderID)) || "User";
                        } catch {
                                senderName = "User";
                        }

                        // جلب صورة بروفايل المرسل
                        const avatarUrl = `https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

                        // تاريخ ووقت الرسالة الحالي بصيغة ISO المطلوبة للـ API
                        const timestamp = new Date().toISOString();

                        // رابط الـ API الصحيح لرسائل ديسكورد مع ترميز البارامترات
                        const discordApi = `https://api.popcat.xyz/v2/discord-message?username=${encodeURIComponent(senderName)}&content=${encodeURIComponent(userText)}&avatar=${encodeURIComponent(avatarUrl)}&color=\%23ffcc99&timestamp=${encodeURIComponent(timestamp)}`;

                        // إعداد مجلد الكاش وحفظ الصورة مؤقتاً
                        const cacheDir = path.join(__dirname, "cache");
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                        const filePath = path.join(cacheDir, `discord_${Date.now()}.png`);

                        const response = await axios.get(discordApi, { responseType: "arraybuffer" });
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
                        console.error("Discord Command Error:", err);
                        await new Promise((resolve) => api.setMessageReaction("❌", event.messageID, resolve, true));
                        return message.reply(getLang("error"));
                }
        }
};
