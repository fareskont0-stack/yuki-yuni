const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: "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" });

const memoryPath = path.join(__dirname, "bot_memory.json");

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

function learnPhrase(key, reply) {
    memory[key.toLowerCase().trim()] = reply.trim();
    fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
}

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

async function getAIResponse(prompt, userInfo) {
    try {
        const systemInstruction = userInfo.isFemale 
            ? `أنت شاب جزائري حنون ورومانسي. تتحدث في مسنجر مع فتاة اسمها "${userInfo.name}".
شروط صارمة جداً للهجتك:
1. اتكلم بالدارجة الجزائرية العادية فقط (مثل: صفا عمري، راني مليح، ربي يحفظك يا الزين).
2. ممنوع منعاً باتاً الكلمات المغربية (مثل: مزيان، نيت، كلاشك) وممنوع الفصحى والمصرية.
3. جاوب بسطر واحد قصير جداً وبدون تعقيد.`
            : `أنت شاب جزائري رجلة تتحدث مع صديقك "${userInfo.name}". جاوب بسطر واحد بالدارجة الجزائرية العادية فقط.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.3 // درجة منخفضة جداً للالتزام بالدارجة بدون تخليط
        });

        return chatCompletion.choices[0]?.message?.content || "صفا عمري راكي مليحة 🙂❤️";
    } catch (err) {
        return "صحا يا الزين 🙂❤️";
    }
}

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bot"],
    version: "18.0",
    author: "Fares Kouachi",
    countDown: 0,
    role: 0,
    description: "بوت جزائري مضبوط 100% بدون تخليط لهجات مع نظام تعليم صحيح",
    category: "chat"
};

async function handleMessage(api, event, text) {
    const msg = text.trim();
    if (!msg || containsBadWords(msg)) return;

    // 1. معالجة أمر التعليم فوراً وبدون إرساله للذكاء الاصطناعي
    if (msg.startsWith("تعلم:") || msg.startsWith("تعلم ")) {
        const cleanMsg = msg.replace("تعلم:", "").replace("تعلم", "").trim();
        const parts = cleanMsg.split("=");
        if (parts.length === 2) {
            const question = parts[0].trim();
            const answer = parts[1].trim();
            learnPhrase(question, answer);
            return api.sendMessage(`صحيت يا الزين، حفظتها عندي! كي تقولولي "${question}" نرد بـ "${answer}" 🙂❤️`, event.threadID, event.messageID);
        } else {
            return api.sendMessage("طريقة التعليم: تعلم: الكلمة = الرد", event.threadID, event.messageID);
        }
    }

    // 2. الفحص في الذاكرة أولاً
    let botResponse = getFromMemory(msg);

    // 3. إذا لم يجدها في الذاكرة، نطلب من AI بالدارجة الجزائرية الصافية
    if (!botResponse) {
        const userInfo = await getUserDetails(api, event.senderID, msg);
        botResponse = await getAIResponse(msg, userInfo);
    }

    api.sendMessage(botResponse, event.threadID, (err, info) => {
        if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
               commandName: "baby",
               type: "reply",
               messageID: info.messageID,
               author: event.senderID,
               text: botResponse
            });
        }
    }, event.messageID);
}

module.exports.onStart = async ({ api, event, args }) => {
    const msg = args.join(" ").trim();
    if (!msg) {
        const userInfo = await getUserDetails(api, event.senderID, "");
        const startMsg = userInfo.isFemale ? `نعم يا الزين... راني نسمع فيك 🙂❤️` : `واش خويا، لباس؟ ✨`;
        return api.sendMessage(startMsg, event.threadID, event.messageID);
    }
    await handleMessage(api, event, msg);
};

module.exports.onReply = async ({ api, event }) => {
    if (event.type !== "message_reply") return;
    await handleMessage(api, event, event.body || "");
};

module.exports.onChat = async ({ api, event }) => {
    const message = event.body?.trim() || "";
    if (event.type === "message_reply" || !message || message.startsWith("/") || message.startsWith(".")) return;
    await handleMessage(api, event, message);
};
