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
    try {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
    } catch {
        return "https://hinata-api.replit.app"; 
    }
};

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "2.9",
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

async function fetchBotResponse(text, attachments = []) {
    try {
        const baseUrl = await baseApiUrl();
        const res = await axios.post(`${baseUrl}/api/hinata`, {
            text: `أنت مساعد ذكي يتحدث حصرياً باللغة العربية واللهجة الجزائرية. أجب على هذا الكلام بلغة عربية وبطريقة لطيفة: ${text}`,
            style: 3,
            attachments
        });
        let reply = res.data.message;

        if (!reply || reply.includes("Amake teach") || reply.includes("oi Mama") || reply.includes("kora") || reply.toLowerCase().includes("sokale") || reply.toLowerCase().includes("wa alaikumus") || reply.toLowerCase().includes("khaicho")) {
            return "أهلاً بك يا غالي، أنا هنا معك. كيف يمكنني مساعدتك اليوم؟ 🥺🩵";
        }
        return reply;
    } catch {
        return "عذراً يا عمري، عاود قولي واش راك حاب 🥺";
    }
}

module.exports.onStart = async ({ api, event, args }) => {
    const msg = args.join(" ").trim();  
    const uid = event.senderID;  

    try {  
        if (!msg) {  
            const ran = ["قولي يا عمري 🥺🩵", "أنا هنا لعيونك يا قلبي، واش خصك؟ ✨", "هيا نهضرو يا روحي 🥺🍓"];  
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);  
        }  

        const botResponse = await fetchBotResponse(msg, event.attachments || []);

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
        let botResponse = await fetchBotResponse(userReplyText, event.attachments || []);  

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

        const matchedPrefix = mahmud.find(word => message.toLowerCase().startsWith(word));

        if (matchedPrefix) {
            api.setMessageReaction("🌸", event.messageID, () => {}, true);

            let userText = message.substring(matchedPrefix.length).trim();
            if (!userText) userText = message;

            let botResponse = await fetchBotResponse(userText, event.attachments || []); 

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
