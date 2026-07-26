const cooldownUsers = new Map();

module.exports = {
    config: {
        name: "autojoin",
        version: "3.1",
        author: "Fares Kouachi",
        category: "events",
        description: "إعادة العضو تلقائياً عند المغادرة مع رسالة تنبيه مخصصة ⚡"
    },

    onStart: async function ({ api, event, usersData }) {
        try {
            if (event.logMessageType === "log:unsubscribe") {
                const { leftParticipantFbId } = event.logMessageData;
                const botID = api.getCurrentUserID();
                const threadID = event.threadID;

                // 1. تجاهل إذا كان الشخص المغادر هو البوت نفسه
                if (!leftParticipantFbId || leftParticipantFbId === botID) return;

                // 2. التحقق من صلاحيات الأدمن للبوت
                const threadInfo = await api.getThreadInfo(threadID);
                const botIsAdmin = threadInfo.adminIDs.some(admin => admin.id === botID);
                if (!botIsAdmin) return;

                // 3. التحقق هل العضو غادر بنفسه أم تم طرده
                const isSelfLeave = (leftParticipantFbId === event.author);
                if (!isSelfLeave) return; // إذا تم طرده من مشرف لا يتم إرجاعه

                // 4. حماية من التكرار لمدة 30 ثانية
                const cooldownKey = `${threadID}_${leftParticipantFbId}`;
                const now = Date.now();
                if (cooldownUsers.has(cooldownKey) && now - cooldownUsers.get(cooldownKey) < 30000) {
                    return;
                }
                cooldownUsers.set(cooldownKey, now);

                // 5. إعادة العضو للمجموعة وإرسال الرسالة المطلوبة
                api.addUserToGroup(leftParticipantFbId, threadID, async (err) => {
                    if (!err) {
                        try {
                            const userName = await usersData.getName(leftParticipantFbId);
                            api.sendMessage({
                                body: `@${userName} لا يمكنك خروج من مجموعة 🎀`,
                                mentions: [{
                                    tag: `@${userName}`,
                                    id: leftParticipantFbId
                                }]
                            }, threadID);
                        } catch (e) {
                            api.sendMessage("لا يمكنك خروج من مجموعة 🎀", threadID);
                        }
                    }
                });
            }
        } catch (e) {
            console.error("[AutoJoin Error]:", e);
        }
    }
};
