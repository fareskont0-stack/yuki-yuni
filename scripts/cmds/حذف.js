module.exports = {
    config: {
        name: "احذف",
        aliases: ["حذف", "مسح", "unsend"],
        version: "2.1",
        author: "MahMUD",
        countDown: 3,
        role: 1,
        shortDescription: {
            ar: "حذف رسالة البوت المزعجة بالرد عليها"
        },
        guide: {
            ar: "رد على رسالة البوت واكتب .احذف"
        }
    },

    onStart: async function ({ api, event, message }) {
        try {
            // التحقق من وجود الرد (Reply)
            if (!event.messageReply) {
                return message.reply("× يا غالي، دير (ريبلاي) على رسالة البوت اللي حاب تحذفها واكتب الأمر! ⚠️");
            }

            // التحقق من أن الرسالة المستهدفة هي رسالة البوت وليست رسالة شخص آخر
            if (event.messageReply.senderID !== api.getCurrentUserID()) {
                return message.reply("× يا عُمري، هذا الأمر مخصص لحذف رسائل البوت المزعجة فقط وليست رسائل الأعضاء! 🤖");
            }

            // تنفيذ الحذف الفوري
            await api.unsendMessage(event.messageReply.messageID);
            
            // التفاعل عند النجاح
            return api.setMessageReaction("🗑️", event.messageID, () => {}, true);

        } catch (err) {
            console.error("Ahdaf Command Error:", err);
            return message.reply("× صار مشكل أثناء محاولة حذف الرسالة يا غالي.");
        }
    }
};
