const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "هكر",
                aliases: ["fc", "fake", "شات"],
                version: "5.0",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        ar: "توليد صورة محادثة وهمية (Fakechat) تدعم اللغة العربية والإنجليزية بدقة عالية",
                        en: "Generate a fake chat image supporting Arabic and English languages",
                        bn: "আরবি এবং ইংরেজি ভাষা সমর্থন করে ফেক চ্যাট ছবি তৈরি করুন"
                },
                category: "fun",
                guide: {
                        ar: '   {pn} <@tag/reply> <text>: دير ريبلاي أو منشن مع النص اللي حاب تكتبه',
                        en: '   {pn} <@tag/reply> <text>: Tag or reply to someone with the text',
                        bn: '   {pn} <@tag/reply> <text>: ট্যাগ করুন অথবা রিপ্লাই দিয়ে টেক্সট লিখুন'
                }
        },

        langs: {
                ar: {
                        noTarget: "× يا عُمري، حط منشن والا دير ريبلاي على الشخص يا غالي! 🗨️",
                        noText: "× يا روح قلبي، اكتب النص اللي حاب يظهر في الشات! ✍️",
                        success: "🗨️ يا عسل، ها هو الشات الوهمي بالعربية مريقل 100/100 لـ: %1 🌸✨",
                        error: "× صار خطا يا غالي: %1. تواصل مع MahMUD للاستفسار.\n•WhatsApp: 01836298139"
                },
                en: {
                        noTarget: "× Please tag or reply to someone, my friend! 🗨️",
                        noText: "× Please enter the text you want to show in the chat! ✍️",
                        success: "🗨️ Here is the fake chat image for: %1 🌸✨",
                        error: "× Error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                },
                bn: {
                        noTarget: "× দয়া করে কাউকে ট্যাগ করুন অথবা রিপ্লাই দিন! 🗨️",
                        noText: "× দয়া করে চ্যাটে দেখানোর জন্য একটি টেক্সট লিখুন! ✍️",
                        error: "× সমস্যা হয়েছে: %1। MahMUD এর সাথে যোগাযোগ করুন।"
                }
        },

        onStart: async function ({ api, event, args, message, usersData, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const { mentions, messageReply } = event;
                        let targetId;
                        let userText = args.join(" ").trim();

                        if (messageReply) {
                                targetId = messageReply.senderID;
                        } else if (Object.keys(mentions).length > 0) {
                                targetId = Object.keys(mentions)[0];
                                const mentionName = mentions[targetId];
                                userText = args.join(" ").replace(new RegExp(`@?${mentionName}`, "gi"), "").trim();
                        } else if (args.length > 0 && /^\d+$/.test(args[0])) {
                                targetId = args[0];
                                userText = args.slice(1).join(" ").trim();
                        }

                        if (!targetId) return message.reply(getLang("noTarget"));
                        if (!userText) return message.reply(getLang("noText"));

                        let userName = "User";
                        try {
                                userName = (await usersData.getName(targetId)) || "User";
                        } catch {
                                userName = "User";
                        }

                        api.setMessageReaction("⌛", event.messageID, () => {}, true);

                        const apiUrl = await mahmud();
                        // استدعاء مسار الـ API الخاص بالفيك شات مع تمرير اسم الشخص والنص وصورة البروفايل بدعم كامل للعربية
                        const avatarUrl = `https://graph.facebook.com/${targetId}/picture?height=720&width=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
                        const fakeChatApi = `${apiUrl}/api/fakechat?name=${encodeURIComponent(userName)}&text=${encodeURIComponent(userText)}&avatar=${encodeURIComponent(avatarUrl)}`;

                        const cacheDir = path.join(__dirname, "cache");
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
                        const filePath = path.join(cacheDir, `fakechat_${Date.now()}.png`);

                        const response = await axios.get(fakeChatApi, { responseType: "arraybuffer" });
                        fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

                        return message.reply({
                                body: getLang("success", userName),
                                attachment: fs.createReadStream(filePath)
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        });

                } catch (err) {
                        console.error("Fakechat Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                }
        }
};
