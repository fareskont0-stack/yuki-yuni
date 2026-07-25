const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
        config: {
                name: "هكر",
                aliases: ["fc", "fake", "شات"],
                version: "4.1",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        ar: "توليد صورة محادثة وهمية محلية مع دعم النصوص"
                },
                category: "fun",
                guide: {
                        ar: '   {pn} <@tag/reply> <text>: دير ريبلاي أو منشن مع النص'
                }
        },

        langs: {
                ar: {
                        noTarget: "× يا عُمري، دير ريبلاي على الشخص والا حط منشن باش يخدم الأمر! 🗨️",
                        noText: "× يا روح قلبي، اكتب النص اللي حاب يظهر داخل الشات! ✍️",
                        success: "🗨️ يا عسل، ها هو الشات الوهمي مريقل وواضح لـ: %1 🌸✨",
                        error: "× صار خطا يا غالي: %1"
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

                        const avatarUrl = `https://graph.facebook.com/${targetId}/picture?height=720&width=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
                        let avatarImage;
                        try {
                                avatarImage = await loadImage(avatarUrl);
                        } catch {
                                avatarImage = await loadImage("https://i.imgur.com/DZ47K4k.png");
                        }

                        const canvas = createCanvas(800, 320);
                        const ctx = canvas.getContext("2d");

                        // خلفية الشات
                        ctx.fillStyle = "#6B1D2F";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        // صورة البروفايل
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(80, 160, 45, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(avatarImage, 35, 115, 90, 90);
                        ctx.restore();

                        // فقاعة الرسالة
                        ctx.fillStyle = "#262626";
                        ctx.beginPath();
                        ctx.roundRect(145, 95, 615, 130, 18);
                        ctx.fill();

                        // اسم المستخدم
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 22px Arial, sans-serif";
                        ctx.fillText(userName, 175, 135);

                        // كتابة النص (بإمكانك كتابته بالحروف اللاتينية أو الفرنسية لتظهر الكتابة واضحة ومقروءة تماماً بدون مربعات)
                        ctx.fillStyle = "#e4e6eb";
                        ctx.font = "20px Arial, sans-serif";
                        ctx.fillText(userText, 175, 180);

                        const cacheDir = path.join(__dirname, "cache");
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
                        const filePath = path.join(cacheDir, `fakechat_${Date.now()}.png`);

                        const buffer = canvas.toBuffer("image/png");
                        fs.writeFileSync(filePath, buffer);

                        return message.reply({
                                body: getLang("success", userName),
                                attachment: fs.createReadStream(filePath)
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        });

                } catch (err) {
                        console.error("Local Fakechat Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                }
        }
};
