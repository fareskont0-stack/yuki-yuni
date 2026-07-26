const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "زواج",
    version: "2.3",
    author: "Fares",
    shortDescription: {
      ar: "قم بالزواج مع أشخاص عشوائيين مع معالجة روابط الصور 💍",
      vi: ""
    },
    category: "متعة",
    guide: "{prefix}زواج"
  },

  onStart: async function({ event, threadsData, message, usersData }) {
    try {
      const uidI = event.senderID;
      
      // جلب بيانات المجموعة والأعضاء النشطين
      const threadData = await threadsData.get(event.threadID);
      if (!threadData || !threadData.members) {
        return message.reply('❌ | تعذر جلب بيانات المجموعة.');
      }

      const members = threadData.members.filter(member => member.inGroup);
      const senderMember = threadData.members.find(member => member.userID === uidI);
      const senderGender = senderMember ? senderMember.gender : null;

      if (members.length === 0) return message.reply('لا يوجد أعضاء في المجموعة ☹️💕😢');

      // تصفية الأعضاء (استبعاد صاحب الأمر)
      const eligibleMembers = members.filter(member => member.userID !== uidI);
      if (eligibleMembers.length === 0) return message.reply('لا يوجد أعضاء متاحين للزواج في المجموعة ☹️💕😢');

      // اختيار عضو عشوائي
      const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
      const randomMember = eligibleMembers[randomIndex];
      const uid2 = randomMember.userID;

      // استخراج الأسماء
      const name1 = await usersData.getName(uidI);
      const name2 = await usersData.getName(uid2);
      
      // استخراج روابط صور البروفايل ديناميكياً
      const avatarUrl1 = await usersData.getAvatarUrl(uidI);
      const avatarUrl2 = await usersData.getAvatarUrl(uid2);

      // طباعة الروابط في الـ Logs للمتابعة والتأكد من أنها تعمل
      console.log("رابط صورة المستخدم الأول:", avatarUrl1);
      console.log("رابط صورة المستخدم الثاني:", avatarUrl2);

      const randomNumber1 = Math.floor(Math.random() * 36) + 65;
      const randomNumber2 = Math.floor(Math.random() * 36) + 65;

      // تجهيز المرفقات مع فحص الروابط لمنع أي خطأ
      const attachments = [];

      if (avatarUrl1) {
        try {
          const stream1 = await getStreamFromURL(avatarUrl1);
          if (stream1) attachments.push(stream1);
        } catch (err) {
          console.log("فشل في تحميل رابط الصورة الأولى");
        }
      }

      if (avatarUrl2) {
        try {
          const stream2 = await getStreamFromURL(avatarUrl2);
          if (stream2) attachments.push(stream2);
        } catch (err) {
          console.log("فشل في تحميل رابط الصورة الثانية");
        }
      }

      // إرسال النتيجة النهائية مع الصور المعالجة
      return message.reply({
        body: `• الجميع يهنئ الزوج والزوجة الجديدين:
        ❤️ ${name1} 💕 ${name2} ❤️
        نسبة الحب: "${randomNumber1} % 🤭"
        نسبة التوافق: "${randomNumber2} % 💕"
        
        تهانينا 💝`,
        attachment: attachments.length > 0 ? attachments : undefined
      });

    } catch (error) {
      console.error("خطأ في أمر الزواج:", error);
      return message.reply("حدث خطأ أثناء تنفيذ الأمر.");
    }
  }
};
