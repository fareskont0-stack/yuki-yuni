const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'cache', 'autoReactionConfig.json');

// تحميل الإعدادات مباشرة وبشكل آمن
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

module.exports = {
    config: {
        name: "تفاعل",
        aliases: ["ايقاف", "تشغيل_تفاعل"],
        version: "3.3",
        author: "MahMUD & Fares",
        countDown: 1,
        role: 1,
        description: {
            ar: "تشغيل أو إيقاف التفاعل التلقائي السريع برمز تعبيري في المجموعة بشكل دائم ⚡"
        },
        category: "box",
        guide: {
            ar: '   {pn} تفاعل تشغيل <الإيموجي>\n   {pn} تفاعل ايقاف'
        }
    },

    langs: {
        ar: {
            usageError: "⚠️ | الاستخدام الخاطئ!\n• للكتابة: تفاعل تشغيل 💖\n• للإيقاف: تفاعل ايقاف",
            enabled: "✅ | تم التفعيل بنجاح بالإيموجي: %1",
            disabled: "🛑 | تم إيقاف التفاعل بنجاح."
        }
    },

    onStart: async function ({ api, event, args, getLang }) {
        const { threadID, messageID } = event;
        const subAction = args[0] ? args[0].toLowerCase() : "";
        const emojiArg = args[1] ? args[1] : "💖";
        
        const config = getConfig();

        if (subAction === "تشغيل" || subAction === "تفعيل") {
            config[threadID] = {
                status: true,
                emoji: emojiArg
            };
            saveConfig(config);
            return api.sendMessage(getLang("enabled").replace("%1", emojiArg), threadID, messageID);
        } 
        else if (subAction === "ايقاف" || subAction === "إيقاف") {
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

    // دالة تفاعل تلقائي دائمة وفورية لكل رسالة جديدة في المجموعة
    onChat: async function ({ api, event }) {
        try {
            const { threadID, messageID, senderID } = event;
            if (!threadID || senderID === api.getCurrentUserID()) return;

            const config = getConfig();
            const threadConfig = config[threadID];

            if (threadConfig && threadConfig.status === true && threadConfig.emoji) {
                api.setMessageReaction(threadConfig.emoji, messageID, () => {}, true);
            }
        } catch (e) {}
    }
};
