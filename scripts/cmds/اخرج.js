module.exports = {
    config: {
        name: "اخرج",
        version: "1.0.1",
        role: 2, // مخصص للأدمن أو المسؤولين
        author: "Fares Kouachi",
        aliases: ["leave", "غادر", "out"],
        description: {
            ar: "أمر يجعل البوت يغادر المجموعة الحالية",
            en: "Make the bot leave the current group"
        },
        category: "admin",
        usages: {
            ar: "{pn}",
            en: "{pn}"
        },
        countDown: 5
    },

    langs: {
        ar: {
            success: "أمرك يامطوري سأخرج 🌸",
            error: "× حدث خطأ أثناء محاولة مغادرة المجموعة: %1"
        },
        en: {
            success: "أمرك يامطوري سأخرج 🌸",
            error: "× An error occurred while leaving the group: %1"
        }
    },

    onStart: async function ({ api, event, message, getLang }) {
        const { threadID } = event;

        try {
            await message.reply(getLang("success"));
            await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
        } catch (err) {
            console.error("Leave Group Error:", err);
            return message.reply(getLang("error", err.message));
        }
    }
};
