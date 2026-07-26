module.exports = {
    config: {
        name: "antiUnsend",
        version: "1.3",
        author: "MahMUD",
        demands: {
            // يمكن تركها فارغة أو حسب إعدادات السورس
        }
    },

    onRun: async function ({ api, event, usersData }) {
        try {
            // التحقق من حدث حذف الرسالة
            if (event.type === "message_unsend") {
                const { senderID, messageID, threadID } = event;
                
                // جلب اسم الشخص الذي حذف الرسالة
                let userName = "الشخص";
                try {
                    userName = (await usersData.getName(senderID)) || "الشخص";
                } catch {
                    userName = "الشخص";
                }

                // محاولة استرجاع نص الرسالة المحذوفة من كاش البوت إن وجد
                let deletedText = "رسالة ميديا أو محتوى غير نصي";
                if (global.client && global.client.allMessage) {
                    const msgData = global.client.allMessage.get(messageID);
                    if (msgData && msgData.body) {
                        deletedText = msgData.body;
                    }
                }

                // الرد برسالة توضح من حذف وماذا كتب
                return api.sendMessage(
                    `⚠️ | يا عُمري، فقت بلي (${userName}) حذف رسالته!\n📝 | النص المذحوف هو: "${deletedText}"`,
                    threadID
                );
            }
        } catch (err) {
            console.error("Anti-Unsend Error V3:", err);
        }
    }
};
