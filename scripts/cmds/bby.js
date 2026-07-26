const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// دالة الاتصال المباشر بـ OpenAI GPT
async function getOpenAIResponse(promptText) {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "أنت مساعد ذكي لطيف تتحدث حصرياً باللهجة الجزائرية الصافية والدافئة مع استخدام الكلمات اللطيفة (مثل: عمري، روحي، عيوني)."
                    },
                    {
                        role: "user",
                        content: promptText
                    }
                ],
                temperature: 0.7
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                }
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("OpenAI API Error:", error.response?.data || error.message);
        return null;
    }
}

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "2.6",
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

module.exports.onStart = async ({ api, event, args }) => {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    const msg = args.join(" ").trim();  
    const uid = event.senderID;  

    try {  
        if (!msg) {  
            const ran = ["قولي يا عمري 🥺🩵", "أنا هنا لعيونك يا قلبي، واش خصك؟ ✨", "هيا نهضرو يا روحي 🥺🍓"];  
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);  
        }  

        let botResponse = await getOpenAIResponse(msg);
        if (!botResponse) {
            botResponse = "ما فهمتكش مليح يا عمري، عاود قولي واش راك حاب 🥺";
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
        api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);  
    }
};

module.exports.onReply = async ({ api, event }) => {
    if (event.type !== "message_reply") return;
    
    try {
        const userReplyText = event.body?.trim() || "سلام";  
        let botResponse = await getOpenAIResponse(userReplyText);  

        if (!botResponse) {  
            botResponse = "راك منورني بزاف يا عمري، قول لي واش راك حاب زيد نحكي معاك؟ 🥺🩵";  
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

        api.setMessageReaction("🇩🇿", event.messageID, () => {}, true);
        api.sendTypingIndicator(event.threadID, true);

        let botResponse = await getOpenAIResponse(message); 
        if (!botResponse) {
            botResponse = "راني معاك يا قلبي، واش راك حاب زيد نحكي؟ 🥺✨";
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

    } catch (err) {  
        console.error(err);  
    }
};
