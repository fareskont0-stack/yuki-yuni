module.exports = {
    config: {
        name: "احذف",
        aliases: ["حذف", "مسح"],
        version: "2.0",
        author: "MahMUD",
        countDown: 3,
        role: 1,
        shortDescription: {
            ar: "حذف رسالة البوت المزعجة بالرد عليها"
        },
        guide: {
            ar: "رد على رسالة البوت واكتب .حذف"
        }
    },

    onStart: async function ({ api, event, message }) {
        try {
            if (!event.messageReply) {
                return message.reply("× يا غالي، دير (ريبلاي) على رسالة البوت اللي حاب تحذفها واكتب الأمر! ⚠️");
            }

            if (event.messageReply.senderID !== api.getCurrentUserID()) {
                return message.reply("× يا عُمري، هذا الأمر مخصص لحذف رسائل البوت المزعجة فقط وليست رسائل الأعضاء! 🤖");
            }

            await api.unsendMessage(event.messageReply.messageID);
            return api.setMessageReaction("🗑️", event.messageID, () => {}, true);

        } catch (err) {
            console.error("Unsend Bot Error:", err);
            return message.reply("× صار مشكل أثناء محاولة حذف الرسالة يا غالي.");
        }
    }
};
