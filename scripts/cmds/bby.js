const axios = require("axios");

const mahmud = [
    "baby",
    "bby",
    "babu",
    "bbu",
    "jan",
    "bot",
    "wifey",
    "hina",
    "hinata",
    "هاي",
    "عمري",
    "حبي",
    "صفا",
    "يا قلبي",
    "عيوني",
    "حنون",
    "صحيت",
    "وينك",
    "سلام",
    "روحي",
    "غالي",
    "ماما",
    "عزيزي",
    "بوت"
];

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "2.1",
    author: "MahMUD",
    countDown: 0,
    role: 0,
    description: {
        ar: "بوت ذكاء اصطناعي يتحدث باللهجة الجزائرية ويبدأ الحوار تلقائياً ✨🩵",
        en: "Algerian AI Chatbot",
        bn: "Algerian AI Chatbot"
    },
    category: "chat",
    guide: {
        ar: '   {pn} [أي رسالة] - للحديث مع البوت',
        en: "{pn} [anyMessage]"
    }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    
    const msg = args.join(" ").toLowerCase();
    const uid = event.senderID;

    try {
        if (!args[0]) {
            const ran = ["قولي يا عمري 🥺🩵", "أنا هنا لعيونك يا قلبي، واش خصك؟ ✨", "هيا نهضرو يا روحي 🥺🍓"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        const getBotResponse = async (text, attachments) => {
            try {
                const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { 
                    text: `تحدث باللهجة الجزائرية فقط وبطريقة لطيفة ودلوعة: ${text}`, 
                    style: 3, 
                    attachments 
                });
                return res.data.message;
            } catch {
                return "عذراً يا عمري، صرا مشكل صغير 🥺";
            }
        };

        const botResponse = await getBotResponse(msg, event.attachments || []);
        api.sendMessage(botResponse, event.threadID, (err, info) => {
            if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                   commandName: this.config.name,
                   type: "reply",
                   messageID: info.messageID,
                   author: uid,
                   text: botResponse
                });
            }
        }, event.messageID);

    } catch (err) {
        console.error(err);
        api.sendMessage(`Error: ${err.response?.data || err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({ api, event }) => {
    if (event.type !== "message_reply") return;
    try {
        const getBotResponse = async (text, attachments) => {
            try {
                const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { 
                    text: `تحدث باللهجة الجزائرية فقط وبطريقة لطيفة: ${text}`, 
                    style: 3, 
                    attachments 
                });
                return res.data.message;
            } catch {
                return "عذراً يا روحي، صرا مشكل 🥺";
            }
        };
        const replyMessage = await getBotResponse(event.body?.toLowerCase() || "سلام", event.attachments || []);
        api.sendMessage(replyMessage, event.threadID, (err, info) => {
            if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                   commandName: this.config.name,
                   type: "reply",
                   messageID: info.messageID,
                   author: event.senderID,
                   text: replyMessage
                });
            }
        }, event.messageID);
    } catch (err) {
        console.error(err);
    }
};

module.exports.onChat = async ({ api, event }) => {
    try {
        const message = event.body?.toLowerCase() || "";
        const attachments = event.attachments || [];

        // التحقق مما إذا كانت الرسالة تبدأ بإحدى كلماتك المفتاحية
        const matchedPrefix = mahmud.find(word => message.startsWith(word));

        if (event.type !== "message_reply" && matchedPrefix) {
            api.setMessageReaction("🇩🇿", event.messageID, () => { }, true);
            api.sendTypingIndicator(event.threadID, true);

            const getBotResponse = async (text, attachments) => {
                try {
                    const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { 
                        text: `تحدث باللهجة الجزائرية الدارجة والعامية فقط وبدلع لطيف: ${text}`, 
                        style: 3, 
                        attachments 
                    });
                    return res.data.message;
                } catch {
                    return "عذراً يا عمري، صرا مشكل 🥺";
                }
            };

            // استخراج النص بعد الكلمة المفتاحية (مثلاً لو كتب "بوت واش راك" سيأخذ "واش راك")
            let userText = message.substring(matchedPrefix.length).trim();

            const randomMessage = [
                "رااني هنا يا غالي، واش راك حاب نحكي معاك اليوم؟ 🇩🇿✨",
                "أهلا بيكم يا ناس الخير، واش راكم دايرين؟ 🥺🩵",
                "عيوني ليك يا عيوني، تفضل واش خصك؟ ✨",
                "نعم يا روحي، راني نسمع فيك، قل لي واش كاين؟ 🍓"
            ];

            // إذا كتب الكلمة لوحدها تماماً (مثل "بوت" فقط)
            if (!userText && attachments.length === 0) {
                const hinataMessage = randomMessage[Math.floor(Math.random() * randomMessage.length)];
                return api.sendMessage(hinataMessage, event.threadID, (err, info) => {
                    if (!err) {
                        global.GoatBot.onReply.set(info.messageID, {
                           commandName: this.config.name,
                           type: "reply",
                           messageID: info.messageID,
                           author: event.senderID,
                           text: hinataMessage
                        });
                    }
                }, event.messageID);
            }

            // إذا كتب رسالة مع الكلمة المفتاحية (مثل "بوت شراك")
            const botResponse = await getBotResponse(userText || message, attachments);
            api.sendMessage(botResponse, event.threadID, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                       commandName: this.config.name,
                       type: "reply",
                       messageID: info.messageID,
                       author: event.senderID,
                       text: botResponse
                    });
                }
            }, event.messageID);
        }
    } catch (err) {
        console.error(err);
    }
};
