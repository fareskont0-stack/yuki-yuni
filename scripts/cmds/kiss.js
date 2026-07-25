const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "بوسة",
                aliases: ["চুমা", "কিস"],
                version: "1.8",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        ar: "أنشئ صورة قبلة رومانسية تلقائياً أو بالرد على شخص ما بكل حب ✨🩵",
                        bn: "কাউকে ট্যাগ বা রিলাই ছাড়া অটোমেটিক রোমান্টিক কিস ইমেজ তৈরি করুন",
                        en: "Generate a romantic kiss image automatically or by replying",
                        vi: "Tạo hình ảnh hôn lãng mạn tự động hoặc bằng cách trả lời"
                },
                category: "love",
                guide: {
                        ar: '   {pn}: قم بإرسال الأمر مباشرة أو بالرد على رسالة شخص يا عيوني 🥺🍓',
                        bn: '   {pn}: সরাসরি কমান্ড দিন অথবা কারো মেসেজে রিپلাই করুন',
                        en: '   {pn}: Send the command directly or reply to someone',
                        vi: '   {pn}: Gửi lệnh trực tiếp hoặc trả lời ai đó'
                }
        },

        langs: {
                ar: {
                        wait: "جاري تصميم صورة القبلة الرومانسية يا روحي... انتظر قليلاً 🥺✨",
                        success: "تفضل يا عيوني، هاذي هي صورة القبلة تاعكم مع بعض 💕🩵",
                        error: "× يا حياتي، صرا مشكل: %1. تواصل مع MahMUD يعاونك 🥺💔"
                },
                bn: {
                        wait: "তোমার কিস ইমেজটি তৈরি করছি... একটু অপেক্ষা করো বেবি! <😘",
                        success: "এই নাও তোমাদের কিস ইমেজ বেবি! 🙈",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
                },
                en: {
                        wait: "Generating your kiss image... Please wait a moment baby! <😘",
                        success: "Here’s your kiss image baby! 🙈",
                        error: "× API error: %1. Contact MahMUD for help."
                },
                vi: {
                        wait: "Đang tạo hình ảnh hôn cho cưng... Chờ chút nhé! <😘",
                        success: "Ảnh hôn của cưng đây! 🙈",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ."
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const senderID = event.senderID;
                let targetID = null;

                // 1. التحقق إذا كان هناك رد على رسالة (Reply) لاختيار الشخص المستهدف تلقائياً
                if (event.type === "message_reply" && event.messageReply) {
                        targetID = event.messageReply.senderID;
                }
                // 2. التحقق من المنشن إن وجد
                else if (event.mentions && Object.keys(event.mentions).length > 0) {
                        targetID = Object.keys(event.mentions)[0];
                }

                // 3. إذا لم يوجد رد أو منشن، نحدد الشخص المستهدف بطريقة آمنة (مثلاً Bot نفسه أو نفس المرسل كاحتياط لكي لا يعطي خطأ)
                if (!targetID) {
                        targetID = api.getCurrentUserID(); 
                }

                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
                const imgPath = path.join(cacheDir, `kiss_${senderID}_${targetID}.png`);

                try {
                        api.setMessageReaction("💋", event.messageID, () => {}, true);
                        const waitMsg = await message.reply(getLang("wait"));

                        const base = await mahmud();
                        const response = await axios.post(`${base}/api/kiss`, 
                                { senderID, targetID }, 
                                { responseType: "arraybuffer" }
                        );

                        fs.writeFileSync(imgPath, Buffer.from(response.data));

                        if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);

                        return message.reply({
                                body: getLang("success"),
                                attachment: fs.createReadStream(imgPath)
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                        });

                } catch (err) {
                        console.error("Kiss Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                        return message.reply(getLang("error", err.message));
                }
        }
};
