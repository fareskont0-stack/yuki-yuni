Const axios = require("axios");

const mahmud = [
    "بيبي",
    "عينيا",
    "بوت",
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
    "بوت" // أضفنا كلمة "بوت" لتكون الكلمة الأساسية لبدء الحوار
];

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina", "عمري", "حبي", "صفا", "يا قلبي", "عيوني", "روحي", "بوت"],
    version: "2.0",
    author: "MahMUD",
    countDown: 0,
    role: 0,
    description: {
        ar: "بوت ذكاء اصطناعي ذكي يتحدث باللهجة الجزائرية ويبدأ الحوار بكلمة بوت ✨🩵",
        en: "Algerian AI Chatbot",
        bn: "Algerian AI Chatbot"
    },
    category: "chat",
    guide: {
        ar: '   {pn} [أي رسالة] - للحديث مع البوت\n   {pn} teach [سؤال] - [رد1, رد2...] - لتعليم البوت\n   {pn} remove [سؤال] - [رقم] - لحذف رد\n   {pn} list / list all - لعرض قائمة المعلمين\n   {pn} edit [سؤال] - [رد جديد] - لتعديل رد يا عمري 🥺🍓',
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]..."
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

        if (args[0] === "teach") {
            const mahmudStr = msg.replace("teach ", "");
            const [trigger, ...responsesArr] = mahmudStr.split(" - ");
            const responses = responsesArr.join(" - ");
            if (!trigger || !responses) return api.sendMessage("❌ | يا روحي، الاستعمال هكا: teach [سؤال] - [رد1, رد2,...]", event.threadID, event.messageID);
            const response = await axios.post(`${await baseApiUrl()}/api/jan/teach`, { trigger, responses, userID: uid });
            const userName = (await usersData.getName(uid)) || "Unknown User";
            return api.sendMessage(`✅ تم إضافة الردود يا عمري: "${responses}" لـ "${trigger}"\n• 𝐔𝐬𝐞𝐫: ${userName}\n• 𝐓𝐨𝐭𝐚𝐥: ${response.data.count || 0}`, event.threadID, event.messageID);
        }

        if (args[0] === "remove") {
            const mahmudStr = msg.replace("remove ", "");
            const [trigger, index] = mahmudStr.split(" - ");
            if (!trigger || !index || isNaN(index)) return api.sendMessage("❌ | يا قلبي، الاستعمال هكا: remove [سؤال] - [رقم]", event.threadID, event.messageID);
            const response = await axios.delete(`${await baseApiUrl()}/api/jan/remove`, { data: { trigger, index: parseInt(index, 10) }, });
            return api.sendMessage(response.data.message, event.threadID, event.messageID);
        }

        if (args[0] === "list") {
            const endpoint = args[1] === "all" ? "/list/all" : "/list";
            const response = await axios.get(`${await baseApiUrl()}/api/jan${endpoint}`);
            if (args[1] === "all") {
            let message = "👑 قائمة المعلمين يا عيوني:\n\n";
            const data = Object.entries(response.data.data).sort((a, b) => b[1] - a[1]).slice(0, 100);
            for (let i = 0; i < data.length; i++) {
            const [userID, count] = data[i];
            const name = (await usersData.getName(userID)) || "Unknown";
            message += `${i + 1}. ${name}: ${count}\n`; } return api.sendMessage(message, event.threadID, event.messageID);  }
            return api.sendMessage(response.data.message, event.threadID, event.messageID);
        }

        if (args[0] === "edit") {
            const mahmudStr = msg.replace("edit ", "");
            const [oldTrigger, ...newArr] = mahmudStr.split(" - ");
            const newResponse = newArr.join(" - ");
            if (!oldTrigger || !newResponse) return api.sendMessage("❌ | يا روحي، الاستعمال هكا: edit [سؤال] - [الرد الجديد]", event.threadID, event.messageID);
            await axios.put(`${await baseApiUrl()}/api/jan/edit`, { oldTrigger, newResponse });
            return api.sendMessage(`✅ تم تعديل "${oldTrigger}" إلى "${newResponse}" يا عيوني 🥺`, event.threadID, event.messageID);
        }

        if (args[0] === "msg") {
            const searchTrigger = args.slice(1).join(" ");
            if (!searchTrigger) return api.sendMessage("عطيني رسالة باش نحوس عليها يا عمري.", event.threadID, event.messageID);
            try {
            const response = await axios.get(`${await baseApiUrl()}/api/jan/msg`, { params: { userMessage: `msg ${searchTrigger}` } });
            return api.sendMessage(response.data.message || "ما لقيت حتى رسالة يا روحي.", event.threadID, event.messageID);
            } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "error";
            return api.sendMessage(errorMessage, event.threadID, event.messageID);
            }
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

        // إذا بدأت الرسالة بكلمة "بوت" أو أي كلمة مفتاحية من القائمة
        if (event.type !== "message_reply" && mahmud.some(word => message.startsWith(word))) {
            api.setMessageReaction("🇩🇿", event.messageID, () => { }, true);
            api.sendTypingIndicator(event.threadID, true);
            
            const messageParts = message.trim().split(/\s+/);
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

            const randomMessage = [
                "رااني هنا يا غالي، واش راك حاب نحكي معاك اليوم؟ 🇩🇿✨",
                "أهلا بيكم يا ناس الخير، واش راكم دايرين؟ 🥺🩵",
                "عيوني ليك يا عيوني، تفضل واش خصك؟ ✨",
                "نعم يا روحي، راني نسمع فيك، قل لي واش كاين؟ 🍓",
                "هيا نحكيو، واش جديدك اليوم يا الغالي؟ 🇩🇿",
                "راكي منورتنا يا الحنون، تفضل قول لي واش تحوس؟ 🤍"
            ];

            const hinataMessage = randomMessage[Math.floor(Math.random() * randomMessage.length)];
            
            if (messageParts.length === 1 && attachments.length === 0) {
                api.sendMessage(hinataMessage, event.threadID, (err, info) => {
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
            } else {
                let userText = message;
                for (const prefix of mahmud) {
                    if (message.startsWith(prefix)) {
                        userText = message.substring(prefix.length).trim();
                        break;
                    }
                }

                const botResponse = await getBotResponse(userText, attachments);
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
        }
    } catch (err) {
        console.error(err);
    }
};
