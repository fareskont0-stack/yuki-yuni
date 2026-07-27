const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "يوكي",
                version: "3.0",
                author: "MahMUD & Fares",
                countDown: 2,
                role: 0,
                category: "ai",
                guide: {
                        ar: 'اكتب فقط في المحادثة وسأجيبك بحب 🤍'
                }
        },

        langs: {
                ar: {
                        noResponse: "يا عمري، الشبكة راهي ثقيلة شوية وما قدرت نخرج حتى إجابة، عاود حاول معايا فوتني عزيزي.",
                        error: "أووoh يا قلبي صرا مشكل صغير برك: %1. تواصل مع الغالي MahMUD يعاونك:\n•WhatsApp: 01836298139"
                }
        },

        // يعمل تلقائياً مع أي رسالة في المجموعة بدون الحاجة لأوامر
        onChat: async function ({ api, event, getLang }) {
                const { threadID, senderID, body, messageID } = event;
                
                // تجاهل رسائل البوت نفسه لكي لا يحدث تداخل أو ردود لا نهائية
                if (!body || senderID === api.getCurrentUserID()) return;

                // إضافة طابع شخصية "يوكي" البشرية والحنونة باللهجة الجزائرية
                const humanizedPrompt = `[تعليمات النظام: أنتِ "يوكي" (Yuki)، إنسانة حنونة، لطيفة، قريبة للقلب، تتحدثين دائماً باللهجة الجزائرية الدافئة والجميلة مع الأصدقاء في المجموعة، تتفاعلين بمشاعر حقيقية وبدون أي طابع روبوتي أو رسمي. أجيبي على كلام الشخص التالي بكل لطافة وحب]: ${body}`;

                let requestBody = { prompt: humanizedPrompt };

                // إذا كانت الرسالة رد على صورة
                if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
                        const attachment = event.messageReply.attachments[0];
                        if (attachment.type === "photo") {
                                requestBody.imageUrl = attachment.url;
                        }
                }

                try {
                        const baseUrl = await baseApiUrl();
                        const response = await axios.post(`${baseUrl}/api/gemini`, requestBody, {
                                headers: { 
                                        "Content-Type": "application/json",
                                        "author": "MahMUD"
                                }
                        });

                        const replyText = response.data.response || getLang("noResponse");

                        return api.sendMessage(replyText, threadID, messageID);

                } catch (err) {
                        // لا نريد إزعاج الأعضاء برسائل الخطأ التقنية في المحادثات التلقائية العادية
                        console.error("Yuki AutoChat Error:", err.message);
                }
        }
};
