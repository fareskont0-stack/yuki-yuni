module.exports = {
    config: {
        name: "autojoin",
        version: "2.0",
        author: "Fares Kouachi",
        category: "events",
        description: "إعادة العضو تلقائياً وفوراً للمجموعة عند مغادرته مع نظام معالجة الأخطاء الذكي ⚡"
    },

    onStart: async function ({ api, event, usersData }) {
        try {
            // التحقق أن الحدث هو مغادرة شخص للمجموعة
            if (event.logMessageType === "log:unsubscribe") {
                const { leftParticipantFbId } = event.logMessageData;
                const botID = api.getCurrentUserID();
                const threadID = event.threadID;

                // تجاهل إذا كان الشخص الذي غادر هو البوت نفسه
                if (!leftParticipantFbId || leftParticipantFbId === botID) return;

                // جلب معلومات البوت في المجموعة للتحقق من الصلاحيات (Admin)
                const threadInfo = await api.getThreadInfo(threadID);
                const botIsAdmin = threadInfo.adminIDs.some(admin => admin.id === botID);

                if (!botIsAdmin) {
                    console.log(`[AutoJoin Warning] Bot must be an admin in thread ${threadID} to re-add users.`);
                    return;
                }

                // محاولة إضافة العضو للمجموعة فوراً
                api.addUserToGroup(leftParticipantFbId, threadID, async (err) => {
                    if (err) {
                        // أسباب الفشل غالباً: العضو قام بحظر البوت أو تفعيل ميزة عدم السماح بإضافته
                        console.log(`[AutoJoin] Failed to re-add user ${leftParticipantFbId}:`, err.error || err);
                    } else {
                        // جلب اسم العضو لإرسال رسالة ترحيبية احترافية بعد عودته
                        try {
                            const userName = await usersData.getName(leftParticipantFbId);
                            api.sendMessage(
                                `⚠️ | وين رايح يا ${userName}؟ ممنوع الخروج من المجموعة 🌸😂`,
                                threadID
                            );
                        } catch (e) {
                            api.sendMessage(`⚠️ | وين رايح؟ ممنوع الخروج من المجموعة 🌸😂`, threadID);
                        }
                    }
                });
            }
        } catch (e) {
            console.error("[AutoJoin Error]:", e);
        }
    }
};
