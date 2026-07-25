const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
        config: {
                name: "سجن",
                aliases: ["jail", "حبس"],
                version: "2.0",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        ar: "ضع أي شخص في السجن بصورة احترافية ومضحكة",
                        en: "Put someone in jail with a funny image"
                },
                category: "fun",
                guide: {
                        ar: '   {pn} <@tag / reply / ID>: ضع الشخص المحدد أو نفسك في السجن'
                }
        },

        langs: {
                ar: {
                        success: "⛓️ لقد تم زجّ `%1` خلف القضبان، يستاهل العقوبة يا غالي! 😂",
                        error: "× حدث خطأ أثناء معالجة صورة السجن: %1"
                }
        },

        onStart: async function ({ api, event, args, message, usersData, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const { mentions, messageReply, senderID } = event;
                        let targetId;

                        // تحديد الضحية بذكاء (الرد، المنشن، الآيدي، أو المرسل نفسه)
                        if (messageReply) {
                                targetId = messageReply.senderID;
                        } else if (Object.keys(mentions).length > 0) {
                                targetId = Object.keys(mentions)[0];
                        } else if (args.length > 0 && /^\d+$/.test(args[0])) {
                                targetId = args[0];
                        } else {
                                targetId = senderID;
                        }

                        // إضافة تفاعل الانتظار
                        await new Promise((resolve) => api.setMessageReaction("⌛", event.messageID, resolve, true));

                        // جلب اسم الضحية لاستخدامه في رسالة النجاح
                        let targetName = "الشخص";
                        try {
                                targetName = (await usersData.getName(targetId)) || "الشخص";
                        } catch {
                                targetName = "الشخص";
                        }

                        // جلب رابط صورة البروفايل بدقة عالية
                        const avatarUrl = `https://graph.facebook.com/${targetId}/picture?height=720&width=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
                        const jailApi = `https://api.popcat.xyz/v2/jail?image=${encodeURIComponent(avatarUrl)}`;

                        // إعداد مجلد الكاش وحفظ الصورة مؤقتاً
                        const cacheDir = path.join(__dirname, "cache");
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                        const filePath = path.join(cacheDir, `jail_${targetId}_${Date.now()}.png`);

                        const response = await axios.get(jailApi, { responseType: "arraybuffer" });
                        fs.writeFileSync(filePath, Buffer.from(response.data));

                        // إرسال الصورة مع التفاعل الناجح
                        return message.reply({
                                body: getLang("success", targetName),
                                attachment: fs.createReadStream(filePath)
                        }, async () => {
                                await new Promise((resolve) => api.setMessageReaction("✅", event.messageID, resolve, true));
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        });

                } catch (err) {
                        console.error("Jail Command Professional Error:", err);
                        await new Promise((resolve) => api.setMessageReaction("❌", event.messageID, resolve, true));
                        return message.reply(getLang("error", err.message));
                }
        }
};
