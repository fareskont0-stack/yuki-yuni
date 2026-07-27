const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'cache', 'autoReactionConfig.json');

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
        aliases: ["تشغيل", "ايقاف", "تفاعل"],
        version: "4.0",
        author: "MahMUD & Fares",
        countDown: 1,
        role: 0,
        description: {
            ar: "تشغيل أو إيقاف التفاعل التلقائي السريع لجميع أعضاء المجموعة ⚡"
        },
        category: "box",
        guide: {
            ar: '   {pn} تشغيل تفاعل <الإيموجي>\n   {pn} ايقاف تفاعل'
        }
    },

    langs: {
        ar: {
            usageError: "⚠️ | الاستخدام الصحيح:\n• للتفعيل: تشغيل تفاعل 🌸\n• للإيقاف: ايقاف تفاعل",
            enabled: "✅ | تم تفعيل التفاعل التلقائي للجميع بنجاح بالإيموجي: %1",
            disabled: "🛑 | تم إيقاف التفاعل التلقائي بنجاح."
        }
    },

    onStart: async function ({ api, event, args, getLang }) {
        const { threadID, messageID } = event;
        const fullText = args.join(" ").toLowerCase();
        const config = getConfig();

        // فحص مرن جداً لتشغيل التفاعل بغض النظر عن ترتيب الكلمات
        if (fullText.includes("تشغيل") || fullText.includes("تفعيل")) {
            // استخراج أول إيموجي يلاقيه المستخدم في رسالته، أو افتراضي 🌸
            const emojiMatch = event.body.match(/[\p{Extended_Pictographic}]/u);
            const selectedEmoji = emojiMatch ? emojiMatch[0] : "🌸";

            config[threadID] = {
                status: true,
                emoji: selectedEmoji
            };
            saveConfig(config);
            return api.sendMessage(getLang("enabled").replace("%1", selectedEmoji), threadID, messageID);
        } 
        // فحص إيقاف التفاعل
        else if (fullText.includes("ايقاف") || fullText.includes("إيقاف")) {
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
