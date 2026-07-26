module.exports = {
    config: {
        name: "حذف",
        aliases: ["unsend", "حذف_رسالة"],
        version: "2.0",
        author: "MahMUD",
        countDown: 3,
        role: 1, // 1 للأدمن أو المجموعات (يمكن جعله 2 لمدير البوت فقط)
        shortDescription: {
            ar: "حذف رسالة البوت المزعجة بالرد عليها"
        },
        guide: {
            ar: "رد على رسالة البوت واكتب .حذف"
        }
    },

    onStart: async function ({ api, event, message }) {
        try {
            // التحقق مما إذا كان المستخدم قد رد على رسالة البوت
            if (!event.messageReply) {
                return message.reply("× يا غالي، دير (ريبلاي) على رسالة البوت اللي حاب تحذفها واكتب الأمر! ⚠️");
            }

            // التأكد أن الرسالة المستهدفة هي رسالة البوت نفسه
            if (event.messageReply.senderID !== api.getCurrentUserID()) {
                return message.reply("× يا عُمري، هذا الأمر مخصص لحذف رسائل البوت المزعجة فقط وليست رسائل الأعضاء! 🤖");
            }

            // تنفيذ الحذف الفوري للرسالة
            await api.unsendMessage(event.messageReply.messageID);
            
            // تفاعل نجاح الحذف
            return api.setMessageReaction("🗑️", event.messageID, () => {}, true);

        } catch (err) {
            console.error("Unsend Bot Error:", err);
            return message.reply("× صار مشكل أثناء محاولة حذف الرسالة يا غالي.");
        }
    }
};
