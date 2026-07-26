module.exports = {
    config: {
        name: "antiUnsend",
        version: "2.0",
        author: "MahMUD",
        eventType: ["message_unsend"],
        decide: "event",
        description: {
            ar: "كشف رسائل الأعضاء المحذوفة وإعادة إرسالها تلقائياً"
        }
    },

    onRun: async function ({ api, event, usersData }) {
        try {
            if (event.type !== "message_unsend") return;

            const { senderID, messageID, threadID } = event;
            
            let userName = "الشخص";
            try {
                userName = (await usersData.getName(senderID)) || "الشخص";
            } catch {
                userName = "الشخص";
            }

            let deletedText = "محتوى ميديا (صورة/فيديو/ملف)";
            if (global.client && global.client.allMessage) {
                const msgData = global.client.allMessage.get(messageID);
                if (msgData && msgData.body) {
                    deletedText = msgData.body;
                }
            }

            return api.sendMessage(
                `⚠️ | يا عُمري، فقت بلي (${userName}) حذف رسالته!\n📝 | النص المحذوف هو: "${deletedText}"`,
                threadID
            );

        } catch (err) {
            console.error("Anti-Unsend Error:", err);
        }
    }
};
