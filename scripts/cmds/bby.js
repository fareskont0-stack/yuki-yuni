const axios = require("axios");

const OPENAI_API_KEY = "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";

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

// دالة الاتصال المباشر بـ OpenAI GPT
async function getOpenAIResponse(promptText) {
    try {
        const response =.await axios.post(
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
    version: "2.5",
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
        const message = event.body?.toLowerCase() || "";
        const attachments = event.attachments || [];

        const matchedPrefix = mahmud.find(word => message.startsWith(word));  

        if (event.type !== "message_reply" && matchedPrefix) {  
            api.setMessageReaction("🇩🇿", event.messageID, () => { }, true);  
            api.sendTypingIndicator(event.threadID, true);  

            let userText = message.substring(matchedPrefix.length).trim();  

            const randomMessage = [  
                "راني هنا يا غالي، واش راك حاب نحكي معاك اليوم؟ 🇩🇿✨",  
                "أهلا بيكم يا ناس الخير، واش راكم دايرين؟ 🥺🩵",  
                "عيوني ليك يا عيوني، تفضل واش خصك؟ ✨",  
                "نعم يا روحي، راني نسمع فيك، قل لي واش كاين؟ 🍓"  
            ];  

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

            let botResponse = await getOpenAIResponse(userText || message); 
            if (!botResponse) {
                botResponse = "نموت عليك يا قلبي، واش راك حاب نحكي معاك اليوم؟ 🥺✨";
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
