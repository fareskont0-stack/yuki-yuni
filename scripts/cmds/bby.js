const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: "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" });

const badWords = ["تمنيك", "تقود", "قود", "نيكمك", "حيتشون"];

function containsBadWords(text) {
    const lower = text.toLowerCase();
    return badWords.some(word => lower.includes(word));
}

async function getUserDetails(api, uid) {
    try {
        const userInfo = await api.getUserInfo(uid);
        const user = userInfo[uid];
        return {
            name: user?.name || "الزين",
            gender: user?.gender === 1 ? "female" : (user?.gender === 2 ? "male" : "unknown")
        };
    } catch (e) {
        return { name: "الزين", gender: "unknown" };
    }
}

async function getAIResponse(prompt, userInfo) {
    try {
        const isGirl = userInfo.gender === "female";

        // تعليمات صارمة لحظر أي لهجة غير الجزائرية ومنع الردود الطويلة
        const systemInstruction = isGirl 
            ? `أنت شاب جزائري حقيقي (ممنوع تماماً الكلام كـ روبوت). تتحدث مع فتاة اسمها "${userInfo.name}".
قواعد صارمة جداً:
1. التحدث بالدارجة الجزائرية العادية والمباشرة فقط! (ممنوع منعاً باتاً كلمات مصرية مثل: هقولك، بلاش، هاخدك، سوا... وممنوع الفصحى).
2. الرد يكون قصير جداً (جملة واحدة أو جملتين فقط). ممنوع الجرائد والخطابات الرومانسية المبتذلة!
3. جاوب بعفوية وحنان خفيف جداً، مثل إنسان طبيعي يراسل في Messenger (مثال: "صاحيت يا الزين 🙂❤️"، "صفا عمري راكي مليحة؟"، "ربي يحفظك ليا يا روحي ✨").
4. إذا قالت لك "اسكت" أو "بلع"، رد بكلمة قصيرة ولطيفة بدون فلسفة (مثال: "صحا عمري هاني سكت 🙂❤️").`
            : `أنت شاب جزائري رجلة. تتحدث مع صديقك "${userInfo.name}".
قواعد: ردود قصيرة جداً ومباشرة بالدارجة الجزائرية فقط (مثال: "واش خويا العزيز"، "صحا الفحل").`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.5 // تقليل العشوائية للالتزام بالدارجة القصيرة
        });

        return chatCompletion.choices[0]?.message?.content || "صفا عمري راكي مليحة 🙂❤️";
    } catch (err) {
        console.error("Groq AI Error:", err);
        return "صحا يا الزين 🙂❤️";
    }
}

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bot"],
    version: "15.0",
    author: "Fares Kouachi",
    countDown: 0,
    role: 0,
    description: "بوت جزائري قح يرد بأسلوب قصير وطبيعي جداً بدون روبوتية",
    category: "chat"
};

module.exports.onStart = async ({ api, event, args }) => {
    const msg = args.join(" ").trim();
    const uid = event.senderID;

    try {
        const userInfo = await getUserDetails(api, uid);

        if (!msg) {
            const startMsg = userInfo.gender === "female" 
                ? `صفا عمري راكي مليحة 🙂❤️`
                : `واش خويا العزيز 🙂✨`;
            return api.sendMessage(startMsg, event.threadID, event.messageID);
        }

        if (containsBadWords(msg)) {
            return api.sendMessage("خلينا عاقلين خير 🙂🌸", event.threadID, event.messageID);
        }

        const botResponse = await getAIResponse(msg, userInfo);

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
        const userText = event.body?.trim() || "";
        if (!userText || containsBadWords(userText)) return;

        const userInfo = await getUserDetails(api, event.senderID);
        const replyMessage = await getAIResponse(userText, userInfo);

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
        const message = event.body?.trim() || "";
        if (event.type === "message_reply" || !message || message.startsWith("/") || message.startsWith(".") || containsBadWords(message)) return;

        const userInfo = await getUserDetails(api, event.senderID);
        const customReply = await getAIResponse(message, userInfo);

        if (customReply) {
            const reaction = userInfo.gender === "female" ? "🩵" : "💖";
            api.setMessageReaction(reaction, event.messageID, () => {}, true);

            return api.sendMessage(customReply, event.threadID, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                       commandName: this.config.name,
                       type: "reply",
                       messageID: info.messageID,
                       author: event.senderID,
                       text: customReply
                    });
                }
            }, event.messageID);
        }
    } catch (err) {
        console.error(err);
    }
};
