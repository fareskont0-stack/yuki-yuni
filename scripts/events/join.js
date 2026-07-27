module.exports = {
    config: {
        name: "join",
        version: "2.0",
        author: "Fares Kouachi",
        category: "events",
        description: "الرد على الشخص الذي أضاف البوت بطريقة Reply الذكية مع نظام البحث الاحترافي 🌸"
    },

    onStart: async function ({ api, event, usersData }) {
        try {
            if (event.logMessageType === "log:subscribe") {
                const addedParticipants = event.logMessageData.addedParticipants;
                const botID = api.getCurrentUserID();
                const threadID = event.threadID;

                // التحقق هل البوت هو الشخص الذي تم إضافته للمجموعة
                const isBotAdded = addedParticipants.some(user => user.userFbId === botID);

                if (isBotAdded) {
                    let adderID = event.author; // الشخص مسجل كـ author للحدث غالباً

                    // طريقة احتياطية ذكية: إذا لم يظهر الـ author، نبحث في سجل رسائل المجموعة لمعرفة من أضافه
                    if (!adderID || adderID === botID) {
                        try {
                            const messages = await api.getThreadHistory(threadID, 10);
                            // البحث عن رسالة النظام التي تدل على إضافة البوت لمعرفة صاحبها
                            const addEventMsg = messages.find(msg => 
                                msg.logMessageType === "log:subscribe" && 
                                msg.logMessageData.addedParticipants.some(p => p.userFbId === botID)
                            );
                            if (addEventMsg && addEventMsg.senderID) {
                                adderID = addEventMsg.senderID;
                            }
                        } catch (err) {
                            console.log("[Join Event] Could not fetch thread history:", err);
                        }
                    }

                    // في حال وجدنا ID الشخص الذي أضاف البوت، نقوم بالرد على رسالته مباشرة (Reply)
                    if (adderID && adderID !== botID) {
                        try {
                            const adderName = await usersData.getName(adderID);
                            
                            // محاولة إيجاد messageID للرد عليها، وإذا لمი توجد نرسل رسالة عادية في المحادثة
                            const targetMessageID = event.messageID || null;

                            api.sendMessage({
                                body: `شكرا على اضافتي يا ${adderName} 🌸`
                            }, threadID, (err, info) => {
                                // إذا توفر رقم الرسالة يتم الرد عليها خصيصاً (Reply)
                                if (!err && targetMessageID) {
                                    // بعض إصدارات api تدعم الـ messageID مباشرة في الـ options أو نقوم بإرسالها كـ reply
                                }
                            }, targetMessageID);

                            // طريقة مضمونة للـ Reply البرمجي في فريم وورك GoatBot
                            return api.sendMessage({
                                body: `شكرا على اضافتي 🌸`
                            }, threadID, targetMessageID);

                        } catch (e) {
                            api.sendMessage("شكرا على اضافتي 🌸", threadID);
                        }
                    } else {
                        // كخيار أخير إذا لم يتم تحديد الشخص بدقة
                        api.sendMessage("شكرا على اضافتي 🌸", threadID);
                    }
                }
            }
        } catch (e) {
            console.error("[Join Event Error]:", e);
        }
    }
};
