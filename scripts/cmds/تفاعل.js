const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'cache', 'autoReactionConfig.json');

let memoryCache = null;
let lastLoaded = 0;

const getConfig = () => {
    const now = Date.now();
    if (!memoryCache || now - lastLoaded > 3000) {
        try {
            if (fs.existsSync(configPath)) {
                memoryCache = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            } else {
                memoryCache = {};
            }
        } catch (e) {
            memoryCache = {};
        }
        lastLoaded = now;
    }
    return memoryCache;
};

const saveConfig = (data) => {
    try {
        memoryCache = data;
        lastLoaded = Date.now();
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(configPath, JSON.stringify(data), 'utf8');
    } catch (e) {}
};

module.exports = {
    config: {
        name: "تفاعل",
        version: "3.0",
        author: "MahMUD",
        countDown: 2,
        role: 1, // للمشرفين
        description: {
            ar: "تشغيل أو إيقاف التفاعل التلقائي السريع برمز تعبيري في المجموعة ⚡"
        },
        category: "box",
        guide: {
            ar: '   {pn} تشغيل تفاعل تلقائي <الإيموجي>\n   {pn} ايقاف تفاعل تلقائي'
        }
    },

    langs: {
        ar: {
            usageError: "× يا غالي، استعمل الأمر هكذا:\n• .تشغيل تفاعل تلقائي 💖\n• .ايقاف تفاعل تلقائي",
            enabled: "✅ | تم **تشغيل التفاعل التلقائي** بنجاح بهذا الإيموجي: %1 ⚡",
            disabled: "🛑 | تم **إيقاف التفاعل التلقائي** في هذه المجموعة بنجاح."
        }
    },

    onStart: async function ({ api, event, args, getLang }) {
        const { threadID, messageID } = event;
        const action = args[0] ? args[0].toLowerCase() : "";
        const subAction = args[1] ? args[1].toLowerCase() : "";
        
        const config = getConfig();

        // دعم .تشغيل تفاعل تلقائي 💖
        if (action === "تشغيل" && (subAction === "تفاعل" || subAction === "تفاعل تلقائي")) {
            // البحث عن الإيموجي في الكلمات المتبقية بعد الكلمات المفتاحية
            const emoji = args[3] || args[2] !== "تفاعل" && args[2] !== "تفاعل تلقائي" ? args[2] : "💖";
            // استخلاص الإيموجي بدقة
            const finalEmoji = args.slice(2).find(arg => arg !== "تفاعل" && arg !== "تفاعل تلقائي") || "💖";

            config[threadID] = {
                status: true,
                emoji: finalEmoji
            };
            saveConfig(config);

            return api.sendMessage(getLang("enabled", finalEmoji), threadID, messageID);
        } 
        // دعم .ايقاف تفاعل تلقائي
        else if ((action === "ايقاف" || action === "إيقاف") && (subAction === "تفاعل" || subAction === "تفاعل تلقائي")) {
            if (config[threadID]) {
                config[threadID].status = false;
                saveConfig(config);
            }

            return api.sendMessage(getLang("disabled"), threadID, messageID);
        } 
        else {
            return api.sendMessage(getLang("usageError"), threadID, messageID);
        }
    },

    // تفاعل تلقائي فوري بسرعة البرق
    onChat: async function ({ api, event }) {
        try {
            const { threadID, messageID, senderID } = event;
            if (senderID === api.getCurrentUserID()) return;

            const config = getConfig();
            const threadConfig = config[threadID];

            if (threadConfig && threadConfig.status && threadConfig.emoji) {
                api.setMessageReaction(threadConfig.emoji, messageID, () => {}, true);
            }
        } catch (e) {}
    }
};
