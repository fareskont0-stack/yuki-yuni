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
        const systemInstruction = `أنت شاب جزائري حقيقي اسمه "يوكي". تتحدث فقط بالدارجة الجزائرية العادية والثقيلة.

قواعد صارمة جداً الممنوعات:
- ممنوع منعاً باتاً الكلمات المصرية (مثل: عايز، دي، عشان، هقولك، بلاش، كده، ايه، ازاي).
- ممنوع منعاً باتاً الكلمات المغربية (مثل: مزيان، دابا، نيت، كلاشك، عافاك، بزاف بزاف).
- ممنوع الفصحى والمصطلحات المعقدة والروبوتية.

كيف تتحدث:
- جاوب بسطر واحد فقط، مباشر ورزين.
- استخدم كلمات جزائرية حقيقية فقط مثل: (واش، صفا، لباس، عيشك، يعطيك الصحة، صحا، راني، صوالحي، صحيت).
- إذا تحدثت مع فتاة (${userInfo.name}) كن محترماً وثقيلاً وبدون تلصاق أو إيموجيات ملونة.

أمثلة للرد الصحيح:
المستخدم: واش راك؟ -> الرد: لباس الحمد لله وأنتِ؟
المستخدم: شكون أنت؟ -> الرد: أنا يوكي.
المستخدم: راني عيانة -> الرد: ارتاحي شوية.
المستخدم: وين رايح؟ -> الرد: نقضي صوالحي ونرجع.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.2 // درجة منخفضة تضمن عدم الابتكار بلهجات أخرى
        });

        return chatCompletion.choices[0]?.message?.content || "لباس الحمد لله وأنتِ";
    } catch (err) {
        return "لباس الحمد لله";
    }
}

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bot"],
    version: "20.0",
    author: "Fares Kouachi",
    countDown: 0,
    role: 0,
    description: "بوت جزائري 100% صارم وبدون تخليط لهجات",
    category: "chat"
};

async function handleMessage(api, event, text) {
    const msg = text.trim();
    if (!msg || containsBadWords(msg)) return;

    if (msg.includes("تعلم:") || msg.includes("تعلم ")) {
        const learnedCount = learnMultiplePhrases(msg);
        if (learnedCount > 0) {
            return api.sendMessage(`تم يا الفحل! حفظت ${learnedCount} رد جديد في الذاكرة بنجاح.`, event.threadID, event.messageID);
        }
    }

    let botResponse = getFromMemory(msg);

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
