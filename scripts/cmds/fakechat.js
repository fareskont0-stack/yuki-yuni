const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "شات",
                aliases: ["وهمي", "fake", "فেকচ্যাট"],
                version: "1.9",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        ar: "توليد رسالة محادثة وهمية بدون مشاكل"
                },
                category: "fun",
                guide: {
                        ar: '   {pn} <@tag/reply> <text>: دير ريبلاي أو منشن مع النص'
                }
        },

        langs: {
                ar: {
                        noTarget: "× يا عُمري، حط منشن، دير ريبلاي على الشخص، والا عطيني الـ UID تاعو يا غالي! 🗨️",
                        noText: "× يا روح قلبي، اكتب النص بالحروف اللاتينية أو الإنجليزية باش ما يخرجش المربع الأسود! ✍️",
                        success: "🗨️ يا عسل، ها هو الشات الوهمي بنجاح لـ: %1 🌸✨",
                        error: "× يا غالي صار خطا في السيرفر: %1. تواصل مع MahMUD ربي يحفظك."
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

                        let userName = "Yuki User";
                        try {
                                const fetchedName = await usersData.getName(targetId);
                                if (fetchedName) {
                                        // تنظيف الاسم وتحويله لحروف لاتينية لتفادي المربعات السوداء
                                        userName = fetchedName.replace(/[^\x00-\x7F]/g, "").trim() || "User";
                                }
                        } catch {
                                userName = "User";
                        }

                        api.setMessageReaction("⌛", event.messageID, () => {}, true);

                        const baseUrl = await mahmud();
                        const apiUrl = `${baseUrl}/api/fakechat?id=${targetId}&name=${encodeURIComponent(userName)}&text=${encodeURIComponent(userText)}`;

                        const cacheDir = path.join(__dirname, "cache");
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
                        const filePath = path.join(cacheDir, `fakechat_${Date.now()}.png`);

                        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
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
