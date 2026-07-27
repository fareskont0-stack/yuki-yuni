const axios = require("axios");

// نظام تخزين مؤقت بسيط داخل الذاكرة لضمان عدم توقف العداد
const counters = {};
const statusMap = {};

module.exports = {
    config: {
        name: "ملصقات",
        aliases: ["ملصق", "autosticker"],
        version: "3.0",
        author: "MahMUD & Fares",
        countDown: 1,
        role: 0,
        description: {
            ar: "إرسال ملصقات كيوت تلقائياً بعد كل 4 رسائل في المجموعة 🖤"
        },
        category: "box",
        guide: {
            ar: '   {pn} تشغيل ملصقات\n   {pn} ايقاف ملصقات'
        }
    },

    langs: {
        ar: {
            usageError: "⚠️ | الاستخدام الصحيح:\n• للتفعيل: تشغيل ملصقات\n• للإيقاف: ايقاف ملصقات",
            enabled: "✅ | تم تفعيل إرسال ملصقات الكيوت التلقائي بنجاح!",
            disabled: "🛑 | تم إيقاف إرسال الملصقات التلقائي بنجاح."
        }
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        const fullText = args.join(" ").toLowerCase();

        if (fullText.includes("تشغيل") || fullText.includes("تفعيل") || fullText.includes("ملصقات تشغيل")) {
            statusMap[threadID] = true;
            counters[threadID] = 0;
            return api.sendMessage("✅ | تم تفعيل إرسال ملصقات الكيوت بنجاح!", threadID, messageID);
        } 
        else if (fullText.includes("ايقاف") || fullText.includes("إيقاف")) {
            statusMap[threadID] = false;
            return api.sendMessage("🛑 | تم إيقاف إرسال الملصقات بنجاح.", threadID, messageID);
        } 
        else {
            return api.sendMessage("⚠️ | الاستخدام الصحيح:\n• تشغيل ملصقات\n• ايقاف ملصقات", threadID, messageID);
        }
    },

    onChat: async function ({ api, event }) {
        try {
            const { threadID, senderID } = event;
            if (!threadID || senderID === api.getCurrentUserID()) return;

            // التحقق هل الميزة مفعلة لهذه المجموعة
            if (!statusMap[threadID]) return;

            if (!counters[threadID]) {
                counters[threadID] = 0;
            }

            counters[threadID] += 1;

            // عندما يصل العداد إلى 4 رسائل
            if (counters[threadID] >= 4) {
                counters[threadID] = 0; // تصفير العداد

                // روابط صور متحركة (GIF) تظهر كملصقات كيوت
                const cuteStickers = [
                    "https://i.imgur.com/8Km9tLL.gif",
                    "https://i.imgur.com/V32q3bb.gif"
                ];

                const randomSticker = cuteStickers[Math.floor(Math.random() * cuteStickers.length)];

                // إرسال الصورة المتحركة بشكل مباشر
                return api.sendMessage({
                    attachment: await global.utils.getStreamFromURL(randomSticker)
                }, threadID);
            }
        } catch (e) {
            console.error("AutoSticker Error:", e);
        }
    }
};
