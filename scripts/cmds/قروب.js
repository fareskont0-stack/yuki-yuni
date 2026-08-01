
module.exports = {
  config: {
    name: "دخلني_قروبات",
    version: "3.0.0",
    role: 2, // الصلاحية (مثلاً: 2 للمطور أو المسؤول)
    author: "Fares Khenchli",
    credits: "Fares Khenchli",
    description: "إضافة حسابك الرسمي إلى جميع مجموعات البوت تلقائياً",
    usages: "v3",
    cooldown: 5
  },

  run: async function({ api, event, args }) {
    const { threadID, senderID } = event;

    // ضع هنا معرف حسابك الشخصي (Facebook UID الخاص بك) لكي يتم التعرف عليك
    const myAdminUID = "ضع_معرف_حسابك_هنا"; 

    // تحقق من أن الشخص الذي استعمل الأمر هو أنت (اختياري للأمان)
    if (senderID !== myAdminUID) {
      return api.sendMessage("❌ هذا الأمر خاص بالمطور فقط!", threadID);
    }

    try {
      // 1. جلب معلومات حسابك الشخصي (الاسم)
      const userInfo = await api.getUserInfo(senderID);
      const myName = userInfo[senderID]?.name || "المطور";

      api.sendMessage(`⏳ جاري إضافة الحساب (${myName}) إلى جميع المجموعات التي يتواجد بها البوت...`, threadID);

      // 2. جلب قائمة كل المحادثات/المجموعات النشطة التي فيها البوت
      // (الشفرة تعتمد على بنية مكتبات مثل Fca-unofficial أو Facebook-Chat-Api)
      const listThread = await api.getThreadList(100, null, ["INBOX"]);
      let successCount = 0;
      let failCount = 0;

      // تصفية المجموعات فقط (وليست المحادثات الخاصة الفردية)
      const groupThreads = listThread.filter(thread => thread.isGroup && thread.threadID !== threadID);

      for (const group of groupThreads) {
        try {
          // 3. إضافة حسابك إلى كل مجموعة
          await api.addUserToGroup(senderID, group.threadID);
          successCount++;
          
          // تأخير بسيط بين كل إضافة لتجنب حظر الحساب (Spam/Rate Limit)
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (err) {
          failCount++;
          console.error(`فشل في إضافة الحساب للمجموعة ${group.threadID}:`, err);
        }
      }

      // 4. إرسال تقرير بالعملية
      return api.sendMessage(
        `✅ تمت العملية بنجاح!\n\n` +
        `👤 اسم الحساب المضاف: ${myName}\n` +
        `📥 تم إضافتك إلى: ${successCount} مجموعة\n` +
        `❌ فشل في: ${failCount} مجموعة`,
        threadID
      );

    } catch (error) {
      console.error("خطأ في تنفيذ أمر v3:", error);
      return api.sendMessage(`❌ حدث خطأ أثناء تنفيذ الأمر: ${error.message}`, threadID);
    }
  }
};
