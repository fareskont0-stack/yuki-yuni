const counters = {};
const statusMap = {};

module.exports = {
    config: {
        name: "ملصقات",
        aliases: ["ملصق", "autosticker"],
        version: "4.0",
        author: "MahMUD & Fares",
        countDown: 1,
        role: 0,
        description: {
            ar: "إرسال ملصقات تلقائياً بعد كل 4 رسائل في المجموعة 🖤"
        },
        category: "box",
        guide: {
            ar: '   {pn} تشغيل ملصقات\n   {pn} ايقاف ملصقات'
        }
    },

    langs: {
        ar: {
            usageError: "⚠️ | الاستخدام الصحيح:\n• تشغيل ملصقات\n• ايقاف ملصقات",
            enabled: "✅ | تم تفعيل إرسال الملصقات التلقائي بنجاح!",
            disabled: "🛑 | تم إيقاف إرسال الملصقات التلقائي بنجاح."
        }
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        const fullText = args.join(" ").toLowerCase();

        if (fullText.includes("تشغيل") || fullText.includes("تفعيل") || fullText.includes("ملصق تشغيل")) {
            statusMap[threadID] = true;
            counters[threadID] = 0;
            return api.sendMessage("✅ | تم تفعيل إرسال الملصقات التلقائي بنجاح!", threadID, messageID);
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

            // عندما يصل العداد إلى 4 رسائل
            if (counters[threadID] >= 4) {
                counters[threadID] = 0; // تصفير العداد

                // رابط الصورة المباشر الذي طلبته
                const stickerURL = "https://scontent.xx.fbcdn.net/v/t39.1997-6/17636530_1747081108936474_2091496026287374336_n.png?_nc_cat=104&ccb=1-7&_nc_sid=ba09c1&_nc_ohc=KBjm-gvRCGoQ7kNvwGc4zED&_nc_oc=Adqba2NZRq9ksyyBnn-Iir-i12ojODN7UajjfI4eyxHwkd503BjNqMXBvCBxRAP2lYc&_nc_ad=z-m&_nc_cid=0&_nc_zt=26&_nc_ht=scontent.xx&_nc_gid=uZYmTtOF-fhqugJgrmByvw&oh=00_AQBsKztqg_2wa9bhA77H_Cs6rG2AT9D_vU5rkwbK-mb-aA&oe=6A6D4345";

                // إرسال الصورة مباشرة كـ attachment بدون أي مشاكل
                return api.sendMessage({
                    attachment: await global.utils.getStreamFromURL(stickerURL)
                }, threadID);
            }
        } catch (e) {
            console.error("AutoSticker Error:", e);
        }
    }
};
