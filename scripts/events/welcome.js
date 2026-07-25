module.exports = {
  config: {
    name: "welcome",
    version: "1.3.0",
    author: "Fares",
    category: "events"
  },

  onEvent: async function ({ api, event }) {
    // 1. التحقق من نوع حدث إضافة الأعضاء الجدد
    if (event.type === "event" && event.logMessageType === "log:subscribe") {
      const threadID = event.threadID;
      const addedParticipants = event.logMessageData.addedParticipants;

      for (const user of addedParticipants) {
        // إذا كان البوت هو من أُضيف للمجموعة
        if (user.userFbId === api.getCurrentUserID()) {
          return api.sendMessage(
            "أهلاً بكم جميعا! شكراً لإضافتي إلى هذه المجموعة ❤️\nيمكنكم كتابة **.أوامر** لرؤية القائمة.",
            threadID
          );
        }

        const userName = user.fullName;
        const userFbId = user.userFbId;
        const newNickname = `[🍓] ${userName}`;

        // 2. محاولة تغيير الكنية (تستمر العملية حتى لو فشل بسبب الصلاحيات)
        try {
          await api.changeNickname(newNickname, threadID, userFbId);
        } catch (e) {
          console.log("لم يتم تغيير الكنية - قد يحتاج البوت لرتبة أدمن:", e?.message);
        }

        // 3. إرسال نص الترحيب
        const welcomeMsg = `نورت مجموعة يا عيوني 🍓✨\n\nأهلاً بك يا ${userName} معنا في العائلة! ❤️`;

        try {
          await api.sendMessage({
            body: welcomeMsg,
            mentions: [
              {
                tag: userName,
                id: userFbId
              }
            ]
          }, threadID);
        } catch (err) {
          console.error("خطأ أثناء إرسال رسالة الترحيب:", err?.message);
        }
      }
    }
  }
};
