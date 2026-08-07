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

// دالة التعلم الجماعي والسريع
function learnMultiplePhrases(text) {
    const lines = text.split("\n");
    let count = 0;
    
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith("تعلم:") || line.startsWith("تعلم ")) {
            const cleanMsg = line.replace("تعلم:", "").replace("تعلم", "").trim();
            const parts = cleanMsg.split("=");
            if (parts.length === 2) {
                const question = parts[0].trim().toLowerCase();
                const answer = parts[1].trim();
                if (question && answer) {
                    memory[question] = answer;
                    count++;
                }
            }
        }
    }
    
    if (count > 0) {
        fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
    }
    return count;
}

// البحث في الذاكرة بتطابق دقيق لتفادي الردود الخاطئة
function getFromMemory(text) {
    const cleanText = text.toLowerCase().trim();
    
    // 1. فحص المطابقة التامة أولاً
    if (memory[cleanText]) {
        return memory[cleanText];
    }
    
    // 2. فحص الكلمات المفتاحية الدقيقة
    for (const [key, reply] of Object.entries(memory)) {
        if (cleanText === key || cleanText.startsWith(key + " ") || cleanText.endsWith(" " + key)) {
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
        const systemPrompt = `أنت شاب جزائري كاريزما ورجلة اسمه "يوكي". تتحدث بالدارجة الجزائرية فقط.

قواعد صارمة جداً:
1. ممنوع نهائياً الكلمات المصرية أو الشرقية مثل: (عايز، كويسة، دي، عشان، هقولك، بلاش، كده، ايه، ازاي، مينفعش).
2. ممنوع التأتأة أو الكلام المعقد.
3. جاوب مباشرة على سؤال المستخدم بأسلوب جزائري ثقيل ورزين وبسطر واحد فقط.
4. بدون إيموجيات ملونة أو كلام رخيص.

أمثلة للرد الصحيح:
- "اعطينا كاش نكتة" -> "مرة واحد زاتول راح للشربات قالو عندك قاروزة؟ قالو لا، قالو ملا معليش اعطيني كاس"
- "صحا" -> "صحا خويا"
- "صفا" -> "لباس الحمد لله وأنت؟"
- "كي تقلك وحدة نحبك واش تقولها" -> "نقولها القدر بيناتنا كبير"
- "واش راك" -> "بخير عيشك"`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.1 // درجة منخفضة جداً لضمان عدم الابتكار بلغات أخرى والتزامه بالدارجة فقط
        });

        return chatCompletion.choices[0]?.message?.content || "لباس الحمد لله";
    } catch (err) {
        return "لباس الحمد لله";
    }
}

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bot"],
    version: "21.0",
    author: "Fares Kouachi",
    countDown: 0,
    role: 0,
    description: "بوت جزائري كاريزما ودقيق في الردود",
    category: "chat"
};

async function handleMessage(api, event, text) {
    const msg = text.trim();
    if (!msg || containsBadWords(msg)) return;

    // 1. التعلم السريع
    if (msg.includes("تعلم:") || msg.includes("تعلم ")) {
        const learnedCount = learnMultiplePhrases(msg);
        if (learnedCount > 0) {
            return api.sendMessage(`تم يا الفحل! حفظت ${learnedCount} رد جديد في الذاكرة.`, event.threadID, event.messageID);
        }
    }

    // 2. الفحص الدقيق في الذاكرة
    let botResponse = getFromMemory(msg);

    // 3. الذكاء الاصطناعي بالدارجة الجزائرية الدقيقة
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
        const startMsg = userInfo.isFemale ? `نعم، أسمع فيك` : `واش خويا، لباس؟`;
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
