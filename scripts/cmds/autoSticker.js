const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'cache', 'autoStickerConfig.json');
const counterPath = path.join(__dirname, 'cache', 'stickerCounter.json');

const getConfig = () => {
    try {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch (e) {}
    return {};
};

const saveConfig = (data) => {
    try {
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {}
};

const getCounter = () => {
    try {
        if (fs.existsSync(counterPath)) {
            return JSON.parse(fs.readFileSync(counterPath, 'utf8'));
        }
    } catch (e) {}
    return {};
};

const saveCounter = (data) => {
    try {
        const dir = path.dirname(counterPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(counterPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {}
};

module.exports = {
    config: {
        name: "ملصقات",
        aliases: ["ملصق", "autosticker"],
        version: "2.1",
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
            usageError: "⚠️ | الاستخدام الصحيح:\n• للتفعيل: .تشغيل ملصقات\n• للإيقاف: .ايقاف ملصقات",
            enabled: "✅ | تم تفعيل إرسال ملصقات الكيوت التلقائي بنجاح!",
            disabled: "🛑 | تم إيقاف إرسال الملصقات بنجاح."
        }
    },

    onStart: async function ({ api, event, args, getLang }) {
        const { threadID, messageID } = event;
        const fullText = args.join(" ").toLowerCase();
        const config = getConfig();

        if (fullText.includes("تشغيل") || fullText.includes("تفعيل")) {
            config[threadID] = { status: true };
            saveConfig(config);
            return api.sendMessage(getLang("enabled"), threadID, messageID);
        } 
        else if (fullText.includes("ايقاف") || fullText.includes("إيقاف")) {
            config[threadID] = { status: false };
            saveConfig(config);
            return api.sendMessage(getLang("disabled"), threadID, messageID);
        } 
        else {
            return api.sendMessage(getLang("usageError"), threadID, messageID);
        }
    },

    onChat: async function ({ api, event }) {
        try {
            const { threadID, messageID, senderID } = event;
            if (!threadID || senderID === api.getCurrentUserID()) return;

            const config = getConfig();
            if (!config[threadID] || config[threadID].status !== true) return;

            const counters = getCounter();
            if (!counters[threadID]) {
                counters[threadID] = 0;
            }

            counters[threadID] += 1;

            if (counters[threadID] >= 3) {
                counters[threadID] = 0;
                saveCounter(counters);

                // قائمة روابط ملصقات الكيوت اللطيفة
                const cuteStickers = [
                    "https://i.imgur.com/8Km9tLL.gif", // يمكنك استبدال هذا الرابط برابط صورة الملصق الكيوت الخاص بك
                    "https://i.imgur.com/V32q3bb.gif"
                ];

                const randomCute = cuteStickers[Math.floor(Math.random() * cuteStickers.length)];

                return api.sendMessage({
                    attachment: await global.utils.getStreamFromURL(randomCute)
                }, threadID);
            }

            saveCounter(counters);
        } catch (e) {
            console.error(e);
        }
    }
};
