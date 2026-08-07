const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ضع المفتاح الجديد هنا بين القوسين
const genAI = new GoogleGenerativeAI("AQ.Ab8RN6I-c99z3OxKAU0jfzZndJXRfOUtnIjp1APLIzXmuuUTPA");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    if (memory[cleanText]) {
        return memory[cleanText];
    }
    return null;
}

async function getAIResponse(prompt, userName) {
    try {
        const systemPrompt = `أنت شاب جزائري مضحك، كاريزما ورجلة اسمه "يوكي".
تقصر، تمزح، وتفهم الدارجة الجزائرية 100%.
المستخدم اسمه: "${userName}".

قواعد الرد:
1. ممنوع منعاً باتاً الكلمات المصرية (عايز، كويسة، دي، عشان) أو المغربية (مزيان، دابا).
2. جاوب على قد السؤال بأسلوب مضحك، طنز، أو قصرة حلوة بدون لف ودوران.
3. رد بسطر قصير ومباشر.
4. استخدم كلمات جزائرية عادية مثل: (يا محاينك، واش يا الحاج، ههههه، ياودي، غير القسرة، خطينا، أيا صحا).`;

        const result = await model.generateContent(`${systemPrompt}\n\nالمستخدم قال: ${prompt}`);
        const response = await result.response;
        return response.text().trim();
    } catch (err) {
        return "ههههه يا ودي راني دايخ شوية، عاودلي واش قلت؟";
    }
}

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bot"],
    version: "23.0",
    author: "Fares Kouachi",
    countDown: 0,
    role: 0,
    description: "بوت جزائري بذكاء Gemini المتميز بالضحك والقسرة",
    category: "chat"
};

async function handleMessage(api, event, text) {
    const msg = text.trim();
    if (!msg) return;

    if (msg.includes("تعلم:") || msg.includes("تعلم ")) {
        const learnedCount = learnMultiplePhrases(msg);
        if (learnedCount > 0) {
            return api.sendMessage(`تم يا الفحل! حفظت ${learnedCount} رد جديد.`, event.threadID, event.messageID);
        }
    }

    let botResponse = getFromMemory(msg);

    if (!botResponse) {
        let senderName = "خويا";
        try {
            const userInfo = await api.getUserInfo(event.senderID);
            senderName = userInfo[event.senderID]?.name || "خويا";
        } catch (e) {}

        botResponse = await getAIResponse(msg, senderName);
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
        return api.sendMessage("واش يا الحاج، راني هنا للقسرة والضحك!", event.threadID, event.messageID);
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
