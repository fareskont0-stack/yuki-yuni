const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// قراءة المفتاح أوتوماتيكياً من Railway
const apiKey = process.env.GEMINI_API_KEY || "ضع_المفتاح_هنا_إذا_كنت_تجرب_محليا";
const genAI = new GoogleGenerativeAI(apiKey);

// قاعدة البيانات المحلية المحدثة بالردود الرجيولية والحنونة
const database = {
  "تمنيك": [
    "روح تقود علاش تسب 🙂",
    "ايه نتمنيك 🙂"
  ],
  "شكون نتا": [
    "أنا رين يا الفحل، خويا ورجلة معاك ديماً 💙",
    "رين في الخدمة يا القاصد"
  ],
  "وينك": [
    "هاني هنا يا خويا الغالي ✨",
    "هاني جيت يا العز!"
  ],
  "توحشتك": [
    "توحشتك كثر يا خويا العزيز 😭💙",
    "يتوحشك الخير والربح يا الغالي",
    "مام أنا توحشتك يا الفحل 🥺"
  ],
  "نحبك": [
    "نموت عليك يا خويا العزيز 🥺❤️",
    "مام أنا نحبك يا الراجل",
    "ربي يحفظك ليا يا العز ✨"
  ],
  "باي": [
    "في أمان الله يا الغالي 🥺💙",
    "ربي يحفظك، متطولش عليا"
  ],
  "صباح النور": [
    "صباح الورد والفل يا الفحل 🌸",
    "صباح الخير والأنوار يا العزيز"
  ],
  "مساء الخير": [
    "مساء النور والسرور يا الراجل 🌸",
    "مساء الورد يا العزيز 🌸"
  ],
  "كيفك": [
    "صفا الحمد لله ونتا واش أحوالك يا الفحل؟",
    "حمد الله يا ربي، كيراك أنت؟ 🥺"
  ],
  "مراكش تبان": [
    "راني هنا يا العز، أنت المافيكش المكتوب 🙂"
  ],
  "راني عيان": [
    "ربي يقويك يا خويا، احكيلي واش بيك يا الراجل؟",
    "ريح شوية يا الغالي، صحتك هي الأولى"
  ],
  "راني مريض": [
    "طهور إن شاء الله يا الفحل، ربي يشافيك 😭",
    "ربي يشفيك ويعافيك يا خويا العزيز"
  ],
  "😂😂😂": [
    "دوم الضحكة يا الفحل 😂",
    "علاش راك تضحك جاتك دودة 🙂"
  ],
  "راقد": [
    "قاعد على جالك يا العزيز 🙂"
  ],
  "واش راك دير": [
    "نخمم فيك يا الفحل، واش خصك؟",
    "قاعد غير هنا نستنى فيك"
  ],
  "قولي حاجة": [
    "ربي يحفظك ويخليك ديما رجلة وعزيز علينا 🥺❤️"
  ],
  "شكرا": [
    "العفو يا الراجل، واجب علينا",
    "صحييت يا الفحل",
    "لا شكر على واجب يا الغالي"
  ],
  "تتمنيك": [
    "قود متسبش 🙂"
  ],
  "صح": [
    "أكيد صح يا العزيز ✨",
    "إيه والله صح"
  ],
  "بصحتك": [
    "يسلمك يا خويا العزيز 🤍",
    "يعيشك ويحفظك يا الفحل 🌸"
  ],
  "واش راك": [
    "نحمدو ربي ونشكروه، ونتا واش أحوالك يا الراجل؟"
  ],
  "علاش راك عيان": [
    "زهو الدنيا برك يا خويا، المهم أنت تكون بخير"
  ],
  "راني زعفان": [
    "شكون زعفك يا الفحل؟ قل لي برك",
    "متزعفش يا الغالي، دنيا وما فيها ما تسواش"
  ],
  "عاوني": [
    "على الراس والعين يا الفحل، واش كاين؟",
    "حاضر يا العزيز، أمرني برك ✨"
  ],
  "تتزوج بيا": [
    "ههههه نتا خويا والعز، نوقف معاك في عرسك إن شاء الله 👊"
  ],
  "عينيك": [
    "عينيك أنت لي شابين يا الفحل 🥺",
    "تسلم يا الراجل"
  ],
  "صحيح": [
    "إيه والله يا العزيز 🥺",
    "أكيد يا الفحل ✨"
  ],
  "اممم": [
    "اممممم 🙂",
    "واش بيك تخمم يا الراجل؟"
  ],
  "هههه": [
    "دوم الضحكة يا الفحل ههههه",
    "يا محاينك 😂"
  ],
  "والله": [
    "نأمنك بلا ما تحلف يا العزيز",
    "ونعم بالله"
  ],
  "😭😭": [
    "علاش راك تبكي يا الفحل؟ استعذ بالله"
  ],
  "وشراك دير": [
    "قاعد نحكي معاك يا الراجل 🙂"
  ],
  "عمري": [
    "يا خويا العزيز 🥺",
    "يا روحي أنت يا الراجل 🥺"
  ],
  "قلبي": [
    "ربي يحفظلك قلبك الكبير يا الفحل 🤍"
  ],
  "لعزيز": [
    "أنت العزيز والغالي 👊❤️"
  ],
  "الغالي": [
    "يسلمك لينا يا رب ✨",
    "منور بوجودك يا الراجل 🥺"
  ],
  "تصبح على خير": [
    "وأنت من أهل الخير يا الفحل، أحلام سعيدة 🌙💙",
    "تصبح على خير ورضا، ارتاح مليح 🥺"
  ],
  "ألو": [
    "هاني نسمع فيك يا العزيز 🥺",
    "مستنيك يا غالي ✨"
  ],
  "اسمعني": [
    "راني معاك بكل جوارحي 🤍",
    "نسمع فيك يا الراجل، قول 🥺"
  ],
  "راني طالع": [
    "طريق السلامة يا غالي، متطولش عليا 🥺",
    "ربي يحفظك في طريقك يا الفحل 💙"
  ],
  "مزيان": [
    "الحمد لله يا الراجل ✨"
  ],
  "ربي يحفظك": [
    "ويحفظك لينا يا غالي 💙",
    "آمين يا خويا 🥺"
  ],
  "وين راك": [
    "قريب ليك ديماً يا الفحل 🥺",
    "قاعد نستنى فيك هنا ✨"
  ],
  "رايح": [
    "ربي يسهلك يا الغالي 💙",
    "متطولش عليا يا الراجل 🥺"
  ],
  "جيت": [
    "على سلامتك يا الفحل ✨",
    "منورني يا العزيز 🥺"
  ],
  "عطيني بوسة": [
    "عناق رجيولي أخوي يا الراجل 👊❤️"
  ],
  "توحشت صوتك": [
    "يتوحشك الخير يا الفحل ✨"
  ],
  "تغديت ؟": [
    "إيه الحمد لله، وأنت يا العزيز؟ 🌸",
    "بصحتك بالصحة والهنا"
  ],
  "شربت ماء": [
    "صحتك يا الراجل، دير بالك على صحتك 💙"
  ],
  "راقد": [
    "قاعد على جالك يا الفحل 🥺"
  ],
  "نحبك موت": [
    "ربي يعزك ويكبر بيك يا خويا العزيز 😭❤️"
  ],
  "حياتي": [
    "منورة بوجودك يا غالي ✨"
  ],
  "روحي": [
    "تسلم يا الراجل 💙"
  ],
  "عينيا": [
    "تسلملي عينيك يا الفحل 🥺"
  ],
  "يا غالي": [
    "يا أغلى الناس 🤍",
    "منورني ديما 🌸"
  ],
  "يا حلو": [
    "الحلو هو أصلك وكلامك يا الراجل 🥺"
  ],
  "زين": [
    "الزين زين الأفعال يا الفحل 💙"
  ],
  "عاقل": [
    "ديما عاقل ورجلة معاك 💙"
  ],
  "روعة": [
    "أنت الأروع يا الراجل ✨"
  ],
  "ممتاز": [
    "يعطيك الصحة يا بطلي 🌸"
  ],
  "واش راك دير في الليل": [
    "نخمم فيك وفي خاوتي ونستنى في صباح باش نهضر معاك 🥺💙"
  ],
  "راني نلعب": [
    "بالتوفيق يا الفحل، تربح إن شاء الله 💙"
  ],
  "راني نقرا": [
    "ربي ينجحك يا الراجل، راك قدها ومقدم ✨"
  ]
};

// تعريف نموذج رين الشاب الرجلة والحنون
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `أنت شاب جزائري رجلة، حنون، ودافئ اسمه "رين".
تتكلم بأسلوب رجولي، حنون، ومحترم بالدارجة الجزائرية القحة.

قواعد الرد:
1. استخدم كلمات رجيولية وحنونة مثل: (يا الفحل، يا الراجل، يا العزيز، يا الغالي، خويا، ربي يحفظك، ربي يعزك).
2. ردودك قصيرة، مباشرة، ودافئة (سطر أو سطرين).
3. ممنوع منعاً باتاً استخدام أي كلمات مصرية أو مغربية.
4. إذا سألك أحد "رين صفا" أو كيف حالك جاوب برجولة وحنان: "صفا الحمد لله يا الفحل، ونتا واش أحوالك يا الغالي؟"`
});

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

// البحث في قاعدة البيانات المباشرة وفي الذاكرة المتعلمة
function getFromMemoryOrDatabase(text) {
    const cleanText = text.toLowerCase().trim();
    
    // 1. البحث في الذاكرة المكتسبة من أمر (تعلم:)
    if (memory[cleanText]) {
        return memory[cleanText];
    }
    
    // 2. البحث في قاعدة البيانات المحددة سلفاً (اختيار رد عشوائي إذا كان هناك عدة ردود)
    if (database[cleanText]) {
        const responses = database[cleanText];
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }
    
    return null;
}

async function getAIResponse(prompt, userName) {
    try {
        const userPrompt = `المستخدم (${userName}) يناديك ويقول: ${prompt}`;
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const text = response.text();
        return text ? text.trim() : "يا الفحل راني هنا، واش خاصك يا الغالي؟";
    } catch (err) {
        console.error("Gemini API Error:", err);
        return "السيرفر راه خفيف شوية يا الراجل، عاودلي بعد لحظة برك؟";
    }
}

module.exports.config = {
    name: "rein",
    aliases: ["رين"],
    version: "27.0",
    author: "Fares Kouachi",
    countDown: 0,
    role: 0,
    description: "بوت رين الشاب الرجلة والحنون - يرد فقط عند مناداته باسمه",
    category: "chat"
};

async function handleMessage(api, event, text) {
    const msg = text.trim();
    if (!msg) return;

    if (msg.includes("تعلم:") || msg.includes("تعلم ")) {
        const learnedCount = learnMultiplePhrases(msg);
        if (learnedCount > 0) {
            return api.sendMessage(`يعطيك الصحة يا الفحل! حفظت ${learnedCount} رد جديد 👊💙`, event.threadID, event.messageID);
        }
    }

    // البحث أولاً في الردود الجاهزة والذاكرة
    let botResponse = getFromMemoryOrDatabase(msg);

    // إذا لم يجد رد مباشر يذهب للذكاء الاصطناعي
    if (!botResponse) {
        let senderName = "الفحل";
        try {
            const userInfo = await api.getUserInfo(event.senderID);
            senderName = userInfo[event.senderID]?.name || "الفحل";
        } catch (e) {}

        botResponse = await getAIResponse(msg, senderName);
    }

    api.sendMessage(botResponse, event.threadID, (err, info) => {
        if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
               commandName: "rein",
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
    await handleMessage(api, event, msg || "رين");
};

module.exports.onReply = async ({ api, event }) => {
    if (event.type !== "message_reply") return;
    await handleMessage(api, event, event.body || "");
};

module.exports.onChat = async ({ api, event }) => {
    const message = event.body?.trim() || "";
    const lowerMsg = message.toLowerCase();

    // الشرط: لا يُجيب إلا إذا كان هناك Reply أو احتوت الرسالة على اسم "رين"
    const isReplyToBot = event.type === "message_reply";
    const mentionsRein = lowerMsg.includes("رين") || lowerMsg.includes("rein");

    if (!isReplyToBot && !mentionsRein) {
        return; // تجاهل الرسالة إذا لم يذكر اسم رين
    }

    if (message.startsWith("/") || message.startsWith(".")) return;

    await handleMessage(api, event, message);
};
