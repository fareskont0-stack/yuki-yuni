const fs = require('fs');
const path = require('path');

// مسار حفظ الإعدادات الخاص بالتفاعل التلقائي لكل مجموعة
const configPath = path.join(__dirname, 'cache', 'autoReactionConfig.json');

// دالة لجلب الإعدادات المخزنة
const getConfig = () => {
    try {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch (e) {}
    return {};
};

// دالة لحفظ الإعدادات
const saveConfig = (data) => {
    try {
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(configPath, JSON.stringify(data, null, 4), 'utf8');
    } catch (e) {}
};

module.exports = {
    config: {
        name: "تفاعل",
        version: "1.0",
        author: "MahMUD",
        countDown: 3,
        role: 1, // مخصص للمشرفين أو المطورين لضبطه في المجموعة
        description: {
            ar: "تشغيل أو إيقاف التفاعل التلقائي برمز تعبيري (إيموجي) في المجموعة ✨"
        },
        category: "box",
        guide: {
            ar: '   {pn} تشغيل <الإيموجي>\n   {pn} ايقاف'
        }
    },

    langs: {
        ar: {
            missingAction: "× يا غالي، استعمل الأمر هكذا:\n• تشغيل تفاعل تلقائي ❤️\n• أو ايقاف تفاعل تلقائي",
            missingEmoji: "× يا عيوني، لازم تحدد الإيموجي لي حاب يتفاعل به البوت!\n• مثال: .تفاعل تشغيل 🔥",
            enabled: "✅ | تم **تشغيل** التفاعل التلقائي بنجاح بهذا الإيموجي: %1 ✨",
            disabled: "🛑 | تم **إيقاف** التفاعل التلقائي في هذه المجموعة."
        }
    },

    onStart: async function ({ api, event, args, getLang }) {
        const { threadID, messageID } = event;
        const action = args[0] ? args[0].toLowerCase() : "";
        const emoji = args[1];

        const config = getConfig();

        if (action === "تشغيل" || action === "on") {
            if (!emoji) return api.sendMessage(getLang("missingEmoji"), threadID, messageID);

            config[threadID] = {
                status: true,
                emoji: emoji
            };
            saveConfig(config);

            return api.sendMessage(getLang("enabled", emoji), threadID, messageID);
        } 
        else if (action === "ايقاف" || action === "off" || action === "إيقاف") {
            if (config[threadID]) {
                config[threadID].status = false;
                saveConfig(config);
            }

            return api.sendMessage(getLang("disabled"), threadID, messageID);
        } 
        else {
            return api.sendMessage(getLang("missingAction"), threadID, messageID);
        }
    },

    // دالة الحدث لتطبيق التفاعل تلقائياً على كل رسالة جديدة في المجموعة
    onChat: async function ({ api, event }) {
        const { threadID, messageID } = event;
        try {
            const config = getConfig();
            if (config[threadID] && config[threadID].status && config[threadID].emoji) {
                api.setMessageReaction(config[threadID].emoji, messageID, () => {}, true);
            }
        } catch (e) {}
    }
};
