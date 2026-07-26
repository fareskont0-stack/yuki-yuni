const database = {
  "من مطورك": [
    "مطوري Fares kouachi 💖",
    "أنا من تطوير Fares kouachi 👑",
    "المطور الأسطورة تاعي هو Fares kouachi ✨"
  ],
  "شكون مطورك": [
    "مطوري Fares kouachi 💖",
    "أنا من تطوير Fares kouachi 👑"
  ],
  "بوت": [
    "نعم تفضل 🙂",
    "راني هنا 💙",
    "وش راك حاب؟ 🥺"
  ],
  "نحبك": [
    "وأنا نحبك 🥺❤️",
    "ربي يخليك 🤍"
  ],
  "شكرا": [
    "العفو 🌹",
    "هذا واجبي ❤️"
  ],
  "كيفك": [
    "الحمد لله يا غالي، راني مليح 💙",
    "بخير مادامك راك معنا 🥺"
  ],
  "السلام عليكم": [
    "وعليكم السلام ورحمة الله وبركاته 🤍",
    "هلا بيك يا روحي، منورنا ✨"
  ],
  "صباح الخير": [
    "صباح النور والسرور يا عمري ☀️",
    "صباح الورد والفل على عيونك 🌸"
  ],
  "مساء الخير": [
    "مساء الأنوار يا غالي ✨",
    "مساء الورد والياسمين 🌙"
  ],
  "وينك": [
    "راني هنا معاك ما رحت لعين 🥺💙",
    "قريب ليك ديما لعيونك ✨"
  ]
  // يمكنك إضافة واستمرار ترتيب مئات الأوامر الأخرى هنا بنفس الطريقة تماماً بالطول:
  // "كلمة البحث": [
  //   "الرد الأول",
  //   "الرد الثاني"
  // ],
};

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bot"],
    version: "6.0",
    author: "Fares Kouachi",
    countDown: 0,
    role: 0,
    description: "نظام ذكي للردود المباشرة بترتيب عمودي احترافي",
    category: "chat"
};

// دالة البحث الذكي داخل القاموس العمودي
function getDatabaseResponse(message) {
    const text = message.toLowerCase().trim();
    for (const [key, replies] of Object.entries(database)) {
        if (text.includes(key.toLowerCase())) {
            const randomIndex = Math.floor(Math.random() * replies.length);
            return replies[randomIndex];
        }
    }
    return null;
}

module.exports.onStart = async ({ api, event, args }) => {
    const msg = args.join(" ").trim();
    const uid = event.senderID;

    try {
        if (!msg) {
            const ran = ["قولي يا عمري 🥺🩵", "أنا هنا لعيونك يا قلبي، واش خصك؟ ✨", "هيا نهضرو يا روحي 🥺🍓"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        const customReply = getDatabaseResponse(msg);
        const botResponse = customReply || "راني هنا معاك، تفضل واش حاب نحكيوا؟ 🥺💙";

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
        const customReply = getDatabaseResponse(userText);
        const replyMessage = customReply || "عيوني ليك يا غالي، نسمع فيك 🥺🩵";

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
        if (event.type === "message_reply" || !message) return;

        const customReply = getDatabaseResponse(message);
        if (customReply) {
            api.setMessageReaction("🩵", event.messageID, () => {}, true);
            return api.sendMessage(customReply, event.threadID, event.messageID);
        }
    } catch (err) {
        console.error(err);
    }
};
