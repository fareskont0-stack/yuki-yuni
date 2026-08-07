const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: "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" });

const badWords = ["تمنيك", "تقود", "قود", "نيكمك", "حيتشون"];

function containsBadWords(text) {
    const lower = text.toLowerCase();
    return badWords.some(word => lower.includes(word));
}

// دالة ذكية لمعرفة هل المتحدث بنت بناءً على الاسم وكلام الرسالة
async function getUserDetails(api, uid, messageText = "") {
    try {
        const userInfo = await api.getUserInfo(uid);
        const user = userInfo[uid];
        const name = user?.name || "الزين";
        
        // الكلمات المؤنثة التي تشير إلى أن المتحدثة بنت
        const femaleKeywords = ["راني", "عرفك", "وسمك", "حبيبتي", "عمري", "زوجني", "زعفانة", "عيانة", "مريضة", "تبغيني"];
        const isTextFemale = femaleKeywords.some(kw => messageText.toLowerCase().includes(kw));
        
        let isFemale = user?.gender === 1 || isTextFemale;

        return { name, isFemale };
    } catch (e) {
        return { name: "الزين", isFemale: true }; // الافتراضي معاملة حنونة
    }
}

// دالة الذكاء الاصطناعي للفهم والدقة في الرد
async function getAIResponse(prompt, userInfo, repliedText = "") {
    try {
        const contextPrompt = repliedText ? `(الرسالة التي يرد عليها البوت: "${repliedText}")\nرسالة المستخدم: "${prompt}"` : prompt;

        const systemInstruction = userInfo.isFemale 
            ? `أنت شاب جزائري حنون، ذكي جداً، ورومانسي. تتحدث في الشات مع فتاة اسمها "${userInfo.name}".
قواعد صارمة للإجابة:
1. افهم كلامها ورسالتها بدقة وجاوب مباشرة على موضوع كلامها دون خروج عن السياق.
2. ممنوع نهائياً استعمال عبارات مثل "خويا"، "العزيز"، أو "صاحبي" مع البنات!
3. نادِها دائماً بـ: (يا عمري، يا الزين، يا روحي، يا لالة، قلبي...).
4. جاوب بالدارجة الجزائرية المفهومة، العصرية، واللطيفة جداً.
5. اجعل الرد قصيراً (سطر أو سطرين) وغير مكرر، وبدون لغة روبوتية أو مصطلحات غريبة.`
            : `أنت شاب جزائري محترم ورجلة. تتحدث مع صديقك "${userInfo.name}".
جاوب بدقة وبإيجاز بالدارجة الجزائرية المباشرة.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: contextPrompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.6
        });

        return chatCompletion.choices[0]?.message?.content || "راني معاك يا الزين 🙂❤️";
    } catch (err) {
        console.error("Groq AI Error:", err);
        return "صحا يا الزين 🙂❤️";
    }
}

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bot"],
    version: "16.0",
    author: "Fares Kouachi",
    countDown: 0,
    role: 0,
    description: "بوت جزائري يفهم الرسائل بدقة ويرد برومانسية وحنان مع البنات",
    category: "chat"
};

module.exports.onStart = async ({ api, event, args }) => {
    const msg = args.join(" ").trim();
    const uid = event.senderID;

    try {
        const userInfo = await getUserDetails(api, uid, msg);

        if (!msg) {
            const startMsg = userInfo.isFemale 
                ? `نعم يا الزين... راني نسمع فيك يا عمري 🙂❤️`
                : `واش خويا، لباس؟ ✨`;
            return api.sendMessage(startMsg, event.threadID, event.messageID);
        }

        if (containsBadWords(msg)) {
            return api.sendMessage("خلينا عاقلين والكلام حلو خير 🙂🌸", event.threadID, event.messageID);
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

        // جلب النص الذي يتم الرد عليه
        const repliedText = event.messageReply?.body || "";
        const userInfo = await getUserDetails(api, event.senderID, userText);
        
        const replyMessage = await getAIResponse(userText, userInfo, repliedText);

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

        const userInfo = await getUserDetails(api, event.senderID, message);
        const customReply = await getAIResponse(message, userInfo);

        if (customReply) {
            const reaction = userInfo.isFemale ? "❤️" : "👍";
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
