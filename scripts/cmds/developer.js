const axios = require("axios");

module.exports = {
    config: {
        name: "developer",
        version: "1.0.0",
        role: 0,
        author: "Fares Kouachi",
        aliases: ["مطور", "المطور", "من مطورك"],
        description: {
            ar: "يعرض اسم مطورك ومعلومات عنه مع صورة",
            en: "Displays your developer name and info with an image"
        },
        category: "General",
        usages: {
            ar: "من مطورك",
            en: "developer"
        },
        countDown: 3,
        dependencies: {
            "axios": "^1.6.0"
        }
    },

    onStart: async function ({ api, event, message }) {
        return this.handleReply({ api, event, message });
    },

    onChat: async function ({ api, event, message }) {
        const body = event.body ? event.body.toLowerCase() : "";
        
        // التحقق مما إذا كانت الرسالة تحتوي على السؤال عن المطور
        if (body.includes("من مطورك") || body.includes("مين مطورك") || body.includes("من هو مطورك")) {
            return this.sendDevInfo(message);
        }
    },

    sendDevInfo: async function (message) {
        try {
            // رابط الـ API الخاص بالصورة (يمكنك استبداله برابط الـ API الخاص بك)
            const imageUrl = "https://i.postimg.cc/QdYcvVFh/file-00000000c3ac81f48a67f618ddb06da6.jpg";
            
            // جلب الصورة كـ Stream أو استخدام رابط مباشر تدعمه رسائل البوت
            const stream = await global.utils.getStreamFromURL(imageUrl);

            return message.reply({
                body: "مطهري ومبرمجي هو: Fares Kouachi 🌸",
                attachment: stream
            });
        } catch (err) {
            console.error("Developer Command Error:", err);
            return message.reply("مطوري هو: Fares Kouachi 🌸");
        }
    }
};
