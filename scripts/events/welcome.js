module.exports = {
  config: {
    name: "welcome",
    version: "1.2.0",
    author: "Fares",
    category: "events"
  },

  onEvent: async function ({ api, event }) {
    // 1. التحقق من حدث انضمام أعضاء جدد إلى المجموعة
    if (event.logMessageType === "log:subscribe") {
      const threadID = event.threadID;
      const addedParticipants = event.logMessageData.addedParticipants;

      for (const user of addedParticipants) {
        // في حال كان العضو المنضم هو البوت نفسه
        if (user.userFbId === api.getCurrentUserID()) {
          return api.sendMessage(
            "أهلاً بكم جميعاً! شكراً لإضافتي إلى هذه المجموعة ❤️\nيمكنكم كتابة **.أوامر** لعرض قائمة الأوامر المتاحة.",
            threadID
          );
        }

        const userName = user.fullName;
        const userFbId = user.userFbId;
        const newNickname = `[🍓] ${userName}`;

        // 2. تغيير الكنية (Nickname) للعضو الجديد
        try {
          await api.changeNickname(newNickname, threadID, userFbId);
        } catch (error) {
          console.error(`لم يتم تغيير كنية ${userName}:`, error?.message || error);
        }

        // 3. إرسال نص الترحيب مع إشارة (Mention) للعضو
        const welcomeMsg = `نورت مجموعة يا عيوني 🍓✨\n\nأهلاً بك يا ${userName} معنا في العائلة! ❤️`;

        try {
          api.sendMessage({
            body: welcomeMsg,
            mentions: [
              {
                tag: userName,
                id: userFbId
              }
            ]
          }, threadID);
        } catch (error) {
          console.error("خطأ في إرسال رسالة الترحيب:", error?.message || error);
        }
      }
    }
  }
};
