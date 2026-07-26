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
    "بوت",
    "نحبك"
];

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "2.5",
    author: "MahMUD",
    countDown: 0,
    role: 0,
    description: {
        ar: "بوت ذكاء اصطناعي يتحدث باللهجة الجزائرية ويرد على كلامك بدقة ✨🩵",
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
            return api.sendMessage("قولي يا عمري، واش راك حاب نحكي معاك؟ 🥺🩵", event.threadID, event.messageID);
        }

        const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { 
            text: `تحدث باللهجة الجزائرية فقط وبطريقة لطيفة: ${msg}`, 
            style: 3, 
            attachments: event.attachments || [] 
        });

        let botResponse = res.data.message;
        if (!botResponse || botResponse.includes("Amake teach") || botResponse.includes("oi Mama") || botResponse.includes("kora")) {
            botResponse = `راك قلت: "${msg}"، راني نسمع فيك يا قلبي ومتابع معاك 🥺🩵`;
        }

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
        api.sendMessage(`عذراً يا عمري، صرا مشكل في الـ API 🥺`, event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({ api, event }) => {
    if (event.type !== "message_reply") return;
    try {
        const userReplyText = event.body?.toLowerCase() || "";
        if (!userReplyText) return;

        const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { 
            text: `تحدث باللهجة الجزائرية فقط وبطريقة لطيفة: ${userReplyText}`, 
            style: 3, 
            attachments: event.attachments || [] 
        });

        let replyMessage = res.data.message;
        
        // إذا لم يعطِ الـ API رداً مفهوماً، نجعل البوت ييرد على كلام العضو مباشرة بدلاً من إرسال رسالة عشوائية
        if (!replyMessage || replyMessage.includes("Amake teach") || replyMessage.includes("oi Mama") || replyMessage.includes("kora")) {
            replyMessage = `قلت لي "${userReplyText}".. فهمنك يا عيوني، واش راك حاب زيد نتحدثو فيه؟ 🥺💕`;
        }

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

        const matchedPrefix = mahmud.find(word => message.startsWith(word));

        if (event.type !== "message_reply" && matchedPrefix) {
            api.setMessageReaction("🇩🇿", event.messageID, () => { }, true);
            api.sendTypingIndicator(event.threadID, true);

            let userText = message.substring(matchedPrefix.length).trim();

            // إذا كتب الكلمة لوحدها (مثل "بوت" أو "نحبك" فقط بدون كلام بعدها)
            if (!userText && attachments.length === 0) {
                const singleWordReplies = [
                    "راني هنا يا غالي، واش راك حاب تقولي؟ 🥺🩵",
                    "الجمد لله ونتا",
                    "نعم يا روحي، راني نسمع فيك 🍓",
                    "مام انا نحبك ياعمري ",
                    "محاات",
                    "مطوري Fares kouachi 😭",
                    "راني نحكي معاك 🙂",
                    "ياعمري مام انا توحشتك",
                    "بزاف بزاف 🥺",
                    "من عندك مكاش احبي",
                    "وشراك دير 🥺"

                ];
                const selectedMsg = singleWordReplies[Math.floor(Math.random() * singleWordReplies.length)];
                return api.sendMessage(selectedMsg, event.threadID, (err, info) => {
                    if (!err) {
                        global.GoatBot.onReply.set(info.messageID, {
                           commandName: this.config.name,
                           type: "reply",
                           messageID: info.messageID,
                           author: event.senderID,
                           text: selectedMsg
                        });
                    }
                }, event.messageID);
            }

            // إذا كتب جملة مع الكلمة المفتاحية، نرسلها للـ API ليجيب عليها بدقة
            const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { 
                text: `تحدث باللهجة الجزائرية الدارجة وبدلع لطيف: ${userText || message}`, 
                style: 3, 
                attachments 
            });

            let botResponse = res.data.message;
            if (!botResponse || botResponse.includes("Amake teach") || botResponse.includes("oi Mama") || botResponse.includes("kora")) {
                botResponse = `فهمت كلامك يا عمري (${userText || message})، راني معاك ديما 🥺🩵`;
            }

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
