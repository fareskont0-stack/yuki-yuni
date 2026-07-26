const { getStreamFromURL } = global.utils;
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "زواج",
    version: "2.0",
    author: "Fares",
    shortDescription: {
      ar: "قم بالزواج مع أشخاص عشوائيين مع تصميم دائري وقلب 💍",
      vi: ""
    },
    category: "متعة",
    guide: "{prefix}زواج"
  },

  onStart: async function({ event, threadsData, message, usersData }) {
    const uidI = event.senderID;
    const threadData = await threadsData.get(event.threadID);
    const members = threadData.members.filter(member => member.inGroup);
    const senderGender = threadData.members.find(member => member.userID === uidI)?.gender;

    if (members.length === 0) return message.reply('لا يوجد أعضاء في المجموعة ☹️💕😢');

    const eligibleMembers = members.filter(member => member.gender !== senderGender);
    if (eligibleMembers.length === 0) return message.reply('لا يوجد أعضاء ذكور / إناث في المجموعة ☹️💕😢');

    const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
    const randomMember = eligibleMembers[randomIndex];
    
    const uid2 = randomMember.userID;
    const name1 = await usersData.getName(uidI);
    const name2 = await usersData.getName(uid2);
    
    const avatarUrl1 = await usersData.getAvatarUrl(uidI);
    const avatarUrl2 = await usersData.getAvatarUrl(uid2);
    
    const randomNumber1 = Math.floor(Math.random() * 36) + 65;
    const randomNumber2 = Math.floor(Math.random() * 36) + 65;

    try {
      // إنشاء لوحة رسم (Canvas) لدمج الصور بشكل دائري
      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext("2d");

      // خلفية متدرجة أو لون جمالي
      ctx.fillStyle = "#ffe6f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // تحميل صور البروفايل
      const avatar1 = await loadImage(avatarUrl1);
      const avatar2 = await loadImage(avatarUrl2);

      // دالة لرسم صورة دائرية
      function drawCircularImage(image, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, x, y, size, size);
        ctx.restore();
      }

      // رسم الصورة الأولى (يسار)
      drawCircularImage(avatar1, 100, 80, 200);

      // رسم القلب في المنتصف
      ctx.font = "bold 60px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💖", canvas.width / 2, canvas.height / 2 - 20);

      // رسم الصورة الثانية (يمين)
      drawCircularImage(avatar2, 500, 80, 200);

      // كتابة النص في الأسفل
      ctx.fillStyle = "#ff1493";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText("مبروك عليكم الزواج! 💍✨", canvas.width / 2, 320);

      // تحويل الكانفاس إلى Stream للإرسال
      const imageStream = canvas.createJPEGStream();

      return message.reply({
        body: `• مبروك عليكم الزواج يا حلوين العرسان الجديدين:
        ❤️ ${name1} 💕 ${name2} ❤️
        نسبة الحب: "${randomNumber1} % 🤭"
        نسبة التوافق: "${randomNumber2} % 💕"
        
        ألف مبروك الرمانة والاتفاق 💝✨`,
        attachment: imageStream
      });

    } catch (error) {
      console.error(error);
      return message.reply("حدث خطأ أثناء تصميم صورة الزواج، تأكد من تثبيت مكتبة canvas.");
    }
  }
};
