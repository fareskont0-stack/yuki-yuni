const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "يووكي",
                version: "3.2",
                author: "MahMUD & Fares",
                countDown: 2,
                role: 0,
                category: "ai",
                guide: {
                        ar: 'تحدث معي بالرد على رسائلي أو باختصار اسمي وسأرد عليك بحب 🤍'
                }
        },

        langs: {
                ar: {
                        noResponse: "يا عمري، الشبكة راهي ثقيلة شوية وما قدرت نخرج حتى إجابة، عاود حاول معايا فوتني عزيزي.",
                        error: "أووoh يا قلبي صرا مشكل صغير برك: %1."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const prompt = args.join(" ");
                if (!prompt) {
                        return message.reply("أهلاً بيك يا عُمري يوكي معاك! قول لي واش حاب نحكي معك اليوم 🤍✨");
                }
                return await processYuki(api, event, prompt, getLang);
        },

        onChat: async function ({ api, event, getLang }) {
                const { threadID, senderID, body, messageID, messageReply } = event;
                if (!body || senderID === api.getCurrentUserID()) return;

                let shouldRespond = false;

                // 1. إذا كتب اسم "يوكي" في الرسالة
                if (body.toLowerCase().includes("يوكي")) {
                        shouldRespond = true;
                }

                // 2. الجديد: إذا قام الشخص بالرد (Reply) على رسالة أرسلها البوت مسبقاً
                if (messageReply && messageReply.senderID === api.getCurrentUserID()) {
                        shouldRespond = true;
                }

                if (shouldRespond) {
                        return await processYuki(api, event, body, getLang);
                }
        }
};

async function processYuki(api, event, userPrompt, getLang) {
        try {
                const humanizedPrompt = `[تعليمات النظام: أنتِ "يوكي" (Yuki)، إنسانة حنونة، لطيفة، قريبة للقلب، تتحدثين دائماً باللهجة الجزائرية الدافئة والجميلة مع الأصدقاء في المجموعة، تتفاعلين بمشاعر حقيقية وبدون أي طابع روبوتي أو رسمي. أجيبي على هذا الكلام بكل لطافة وحب]: ${userPrompt}`;

                let requestBody = { prompt: humanizedPrompt };

                if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
                        const attachment = event.messageReply.attachments[0];
                        if (attachment.type === "photo") {
                                requestBody.imageUrl = attachment.url;
                        }
                }

                const baseUrl = await baseApiUrl();
                const response = await axios.post(`${baseUrl}/api/gemini`, requestBody, {
                        headers: { 
                                "Content-Type": "application/json",
                                "author": "MahMUD"
                        }
                });

                const replyText = response.data.response || getLang("noResponse");
                return api.sendMessage(replyText, event.threadID, event.messageID);

        } catch (err) {
                console.error("Yuki Error:", err.message);
        }
}
