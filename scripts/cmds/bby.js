const fs = require("fs");
const path = require("path");

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

function getFromMemoryOrDatabase(text) {
    const cleanText = text.toLowerCase().trim();
    
    // تنظيف كلمة "رين" من النصف لكي يقرأ الكلمة المطلوبة
    const cleanQuery = cleanText.replace("رين", "").replace("rein", "").trim();
    
    // 1. البحث في الذاكرة المكتسبة
    if (memory[cleanQuery]) return memory[cleanQuery];
    if (memory[cleanText]) return memory[cleanText];
    
    // 2. البحث في قاعدة البيانات المباشرة
    if (database[cleanQuery]) {
        const responses = database[cleanQuery];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    if (database[cleanText]) {
        const responses = database[cleanText];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    return null;
}

module.exports.config = {
    name: "rein",
    aliases: ["رين"],
    version: "28.0",
    author: "Fares Kouachi",
    countDown: 0,
    role: 0,
    description: "بوت رين المعتمد 100% على الذاكرة الجاهزة فقط بدون AI",
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

    const botResponse = getFromMemoryOrDatabase(msg);

    // إذا لم يجد الكلمة في الذاكرة، يتجاهل ولا يرسل أي شيء إطلاقاً
    if (!botResponse) return;

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

    const isReplyToBot = event.type === "message_reply";
    const mentionsRein = lowerMsg.includes("رين") || lowerMsg.includes("rein");

    if (!isReplyToBot && !mentionsRein) return;
    if (message.startsWith("/") || message.startsWith(".")) return;

    await handleMessage(api, event, message);
};
