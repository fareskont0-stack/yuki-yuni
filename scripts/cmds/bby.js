module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "3.0",
    author: "MahMUD",
    countDown: 0,
    role: 0,
    description: {
        ar: "بوت ذكاء اصطناعي يتحدث باللهجة الجزائرية الصافية ✨🩵",
        en: "Algerian AI Chatbot",
        bn: "Algerian AI Chatbot"
    },
    category: "chat",
    guide: {
        ar: '   {pn} [أي رسالة] - للحديث مع البوت',
        en: "{pn} [anyMessage]"
    }
};

const algerianReplies = [
    "راني معاك يا قلبي، واش راك حاب نحكيوا اليوم؟ 🥺🩵",
    "عري عيونك يا غالي، أنا هنا لخدمتك ✨",
    "قولي يا عمري، نسمعك بكل سرور 🥺🍓",
    "راك منورني بزاف اليوم، واش راك تمبرمد؟ 😂💙",
    "يا هلا بيك يا روحي، تفضل واش خصك؟ ✨",
    "والله غير فرحت كي هضرت معايا، قول لي واش كاين جديد؟ 🌸",
    "صفا عمري ونتا 🌸",
    "مام انا نحبك "
];

function getLocalResponse(text) {
    const lower = text.toLowerCase();
    if (lower.includes("كيفك") || lower.includes("راك") || lower.includes("واش راك")) {
        return "الحمد لله يا عمري، راني مليح مادامني معاك 🥺🩵";
    } else if (lower.includes("شكون") || lower.includes("من أنت")) {
        return "أنا البوت الخاص بك، المخلص لعيونك يا غالي ✨";
    } else if (lower.includes("صباح") || lower.includes("سلام")) {
        return "وعليكم السلام ورحمة الله يا روحي، صباح النور والسرور 🌸";
    }
    return algerianReplies[Math.floor(Math.random() * algerianReplies.length)];
}

module.exports.onStart = async ({ api, event, args }) => {
    const msg = args.join(" ").trim();  
    const uid = event.senderID;  

    try {  
        if (!msg) {  
            const ran = ["قولي يا عمري 🥺🩵", "أنا هنا لعيونك يا قلبي، واش خصك؟ ✨", "هيا نهضرو يا روحي 🥺🍓"];  
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);  
        }  

        const botResponse = getLocalResponse(msg);

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
    }
};

module.exports.onReply = async ({ api, event }) => {
    if (event.type !== "message_reply") return;
    
    try {
        const userReplyText = event.body?.trim() || "سلام";  
        let botResponse = getLocalResponse(userReplyText);  

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
    } catch (err) {  
        console.error(err);  
    }
};

module.exports.onChat = async ({ api, event }) => {
    try {
        if (event.senderID === api.getCurrentUserID()) return;
        if (event.type === "message_reply") return; 

        const message = event.body?.trim() || "";
        if (!message || message.startsWith(".")) return; 

        const mahmud = ["baby", "bby", "bot", "ومري", "عمري", "حبي", "صفا", "يا قلبي", "عيوني", "سلام", "روحي", "غالي", "بوت"];
        const matchedPrefix = mahmud.find(word => message.toLowerCase().startsWith(word));

        if (matchedPrefix) {
            api.setMessageReaction("🌸", event.messageID, () => {}, true);

            let userText = message.substring(matchedPrefix.length).trim();
            if (!userText) userText = message;

            let botResponse = getLocalResponse(userText); 

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
