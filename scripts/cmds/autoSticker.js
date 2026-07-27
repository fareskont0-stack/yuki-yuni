const axios = require("axios");

const counters = {};
const statusMap = {};

module.exports = {
    config: {
        name: "ملصقات",
        aliases: ["ملصق", "autosticker"],
        version: "3.1",
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
            usageError: "⚠️ | الاستخدام الصحيح:\n• تشغيل ملصقات\n• ايقاف ملصقات",
            enabled: "✅ | تم تفعيل إرسال ملصقات الكيوت التلقائي بنجاح!",
            disabled: "🛑 | تم إيقاف إرسال الملصقات التلقائي بنجاح."
        }
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        const fullText = args.join(" ").toLowerCase();

        if (fullText.includes("تشغيل") || fullText.includes("تفعيل") || fullText.includes("ملصق تشغيل")) {
            statusMap[threadID] = true;
            counters[threadID] = 0;
            return api.sendMessage("✅ | تم تفعيل إرسال ملصقات الكيوت بنجاح!", threadID, messageID);
        } 
        else if (fullText.includes("ايقاف") || fullText.includes("إيقاف")) {
            statusMap[threadID] = false;
            return api.sendMessage("🛑 | تم إيقاف إرسال الملصقات التلقائي بنجاح.", threadID, messageID);
        } 
        else {
            return api.sendMessage("⚠️ | الاستخدام الصحيح:\n• تشغيل ملصقات\n• ايقاف ملصقات", threadID, messageID);
        }
    },

    onChat: async function ({ api, event }) {
        try {
            const { threadID, senderID } = event;
            if (!threadID || senderID === api.getCurrentUserID()) return;

            if (!statusMap[threadID]) return;

            if (!counters[threadID]) {
                counters[threadID] = 0;
            }

            counters[threadID] += 1;

            if (counters[threadID] >= 4) {
                counters[threadID] = 0; // تصفير العداد

                // قائمة معرفات ملصقات فيسبوك الرسمية والجاهزة (Sticker IDs)
                const stickerIDs = [
                    "1253457311413151", 
                    "1253457161413166", 
                    "1253457491413133"
                ];

                const randomStickerID = stickerIDs[Math.floor(Math.random() * stickerIDs.length)];

                // إرسال الملصق مباشرة عبر خاصية الـ sticker في الفايسبوك
                return api.sendMessage({
                    sticker: randomStickerID
                }, threadID);
            }
        } catch (e) {
            console.error("AutoSticker Error:", e);
        }
    }
};
