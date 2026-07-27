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
        aliases: ["تشغيل", "ايقاف"],
        version: "3.6",
        author: "MahMUD & Fares",
        countDown: 1,
        role: 1,
        description: {
            ar: "تشغيل أو إيقاف التفاعل التلقائي السريع برمز تعبيري لجميع أعضاء المجموعة ⚡"
        },
        category: "box",
        guide: {
            ar: '   {pn} تشغيل تفاعل <الإيموجي>\n   {pn} ايقاف تفاعل'
        }
    },

    langs: {
        ar: {
            usageError: "⚠️ | الاستخدام الخاطئ!\n• للتفعيل: .تشغيل تفاعل 💖\n• للإيقاف: .ايقاف تفاعل",
            enabled: "✅ | تم تفعيل التفاعل التلقائي للجميع بنجاح بالإيموجي: %1",
            disabled: "🛑 | تم إيقاف التفاعل التلقائي بنجاح."
        }
    },

    onStart: async function ({ api, event, args, getLang }) {
        const { threadID, messageID } = event;
        const subAction = args[0] ? args[0].toLowerCase() : "";
        const secondArg = args[1] ? args[1].toLowerCase() : "";
        
        const config = getConfig();

        // دعم صيغة: .تشغيل تفاعل 💖
        if ((subAction === "تشغيل" || subAction === "تفعيل") && secondArg === "تفاعل") {
            config[threadID] = {
                status: true,
                emoji: args[2] ? args[2] : "💖"
            };
            saveConfig(config);
            return api.sendMessage(getLang("enabled").replace("%1", config[threadID].emoji), threadID, messageID);
        } 
        // دعم صيغة: .ايقاف تفاعل
        else if ((subAction === "ايقاف" || subAction === "إيقاف") && secondArg === "تفاعل") {
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

    // دالة تفاعل تلقائي لجميع الأعضاء في المجموعة
    onChat: async function ({ api, event }) {
        try {
            const { threadID, messageID, senderID } = event;
            // يتجاهل فقط رسائل البوت نفسه لكي لا يحدث تكرار بالخطأ
            if (!threadID || senderID === api.getCurrentUserID()) return;

            const config = getConfig();
            const threadConfig = config[threadID];

            if (threadConfig && threadConfig.status === true && threadConfig.emoji) {
                api.setMessageReaction(threadConfig.emoji, messageID, () => {}, true);
            }
        } catch (e) {}
    }
};
