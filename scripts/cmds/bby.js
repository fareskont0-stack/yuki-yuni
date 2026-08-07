const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: "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" });

// مسار ملف الذاكرة التي يحفظ فيها البوت كلامه
const memoryPath = path.join(__dirname, "bot_memory.json");

// تحميل الذاكرة أو إنشاؤها إن لم تكن موجودة
let memory = {};
if (fs.existsSync(memoryPath)) {
    try {
        memory = JSON.parse(fs.readFileSync(memoryPath, "utf-8"));
    } catch (e) {
        memory = {};
    }
} else {
    fs.writeFileSync(memoryPath, JSON.stringify({}, null, 2));
}

// دالة حفظ كلمة جديدة في الذاكرة
function learnPhrase(key, reply) {
    memory[key.toLowerCase().trim()] = reply.trim();
    fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
}

// دالة البحث في الذاكرة
function getFromMemory(text) {
    const cleanText = text.toLowerCase().trim();
    for (const [key, reply] of Object.entries(memory)) {
        if (cleanText.includes(key)) {
            return reply;
        }
    }
    return null;
}

const badWords = ["تمنيك", "تقود", "قود", "نيكمك", "حيتشون"];
function containsBadWords(text) {
    return badWords.some(word => text.toLowerCase().includes(word));
}

async function getUserDetails(api, uid, messageText = "") {
    try {
        const userInfo = await api.getUserInfo(uid);
        const user = userInfo[uid];
        const name = user?.name || "الزين";
        const femaleKeywords = ["راني", "عرفك", "وسمك", "حبيبتي", "عمري", "زوجني", "عيانة", "مريضة"];
        const isTextFemale = femaleKeywords.some(kw => messageText.toLowerCase().includes(kw));
        const isFemale = user?.gender === 1 || isTextFemale;
        return { name, isFemale };
    } catch (e) {
        return { name: "الزين", isFemale: true };
    }
}

async function getAIResponse(prompt, userInfo, repliedText = "") {
    try {
        const contextPrompt = repliedText ? `(الرسالة السابقة: "${repliedText}")\nرسالة المستخدم: "${prompt}"` : prompt;
        const systemInstruction = userInfo.isFemale 
            ? `أنت شاب جزائري حنون، ذكي ورومانسي. تتحدث مع "${userInfo.name}". جاوب بالدارجة الجزائرية المفهومة بأسلوب قصير ولطيف وبدون لغة روبوتية.`
            : `أنت شاب جزائري رجلة. تتحدث مع صديقك "${userInfo.name}". جاوب بإيجاز وبدارجة الجزائرية.`;

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
        return "صحا يا الزين 🙂❤️";
    }
}

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bot"],
    version: "17.0",
    author: "Fares Kouachi",
    countDown: 0,
    role: 0,
    description: "بوت جزائري يتعلم الكلام من المحادثات ويخزنه في ذاكرته",
    category: "chat"
};

module.exports.onStart = async ({ api, event, args }) => {
    const msg = args.join(" ").trim();
    const uid = event.senderID;

    try {
        // ميزة التعليم عبر الأمر: تعلم: الكلمة = الرد
        if (msg.startsWith("تعلم:") || msg.startsWith("تعلم ")) {
            const cleanMsg = msg.replace("تعلم:", "").replace("تعلم", "").trim();
            const parts = cleanMsg.split("=");
            if (parts.length === 2) {
                const question = parts[0].trim();
                const answer = parts[1].trim();
                learnPhrase(question, answer);
                return api.sendMessage(`صحيت يا الزين، حفظتها عندي! كي يقوّلي "${question}" نرد بـ "${answer}" 🙂❤️`, event.threadID, event.messageID);
            } else {
                return api.sendMessage("طريقة التعليم الصحيحة: اكتب مثلاً\nتعلم: توحشتك = حتى أنا توحشتك يا عمري 🙂❤️", event.threadID, event.messageID);
            }
        }

        if (!msg) {
            const userInfo = await getUserDetails(api, uid, msg);
            return api.sendMessage(userInfo.isFemale ? `نعم يا الزين... راني نسمع فيك 🙂❤️` : `واش خويا، لباس؟ ✨`, event.threadID, event.messageID);
        }

        if (containsBadWords(msg)) return;

        // البحث أولاً في الذاكرة المحفوظة
        let botResponse = getFromMemory(msg);

        // إذا لم يجدها في الذاكرة، يطلب الرد من الذكاء الاصطناعي
        if (!botResponse) {
            const userInfo = await getUserDetails(api, uid, msg);
            botResponse = await getAIResponse(msg, userInfo);
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
    }
};

module.exports.onReply = async ({ api, event }) => {
    if (event.type !== "message_reply") return;
    try {
        const userText = event.body?.trim() || "";
        if (!userText || containsBadWords(userText)) return;

        if (userText.startsWith("تعلم:") || userText.startsWith("تعلم ")) {
            const cleanMsg = userText.replace("تعلم:", "").replace("تعلم", "").trim();
            const parts = cleanMsg.split("=");
            if (parts.length === 2) {
                learnPhrase(parts[0], parts[1]);
                return api.sendMessage("حفظتها في ذاكرتي خلاص 🙂❤️", event.threadID, event.messageID);
            }
        }

        let replyMessage = getFromMemory(userText);

        if (!replyMessage) {
            const repliedText = event.messageReply?.body || "";
            const userInfo = await getUserDetails(api, event.senderID, userText);
            replyMessage = await getAIResponse(userText, userInfo, repliedText);
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
        const message = event.body?.trim() || "";
        if (event.type === "message_reply" || !message || message.startsWith("/") || message.startsWith(".") || containsBadWords(message)) return;

        let customReply = getFromMemory(message);

        if (!customReply) {
            const userInfo = await getUserDetails(api, event.senderID, message);
            customReply = await getAIResponse(message, userInfo);
        }

        if (customReply) {
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
