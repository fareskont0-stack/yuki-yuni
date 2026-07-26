const { getStreamFromURL } = global.utils;
module.exports = {
  config: {
    name: "زواج",
    version: "1.0",
    author: "Rulex-al LOUFI",
    shortDescription: {
      ar: "قم بالزواج مع أشخاص عشوائيين 😗",
      vi: ""
    },
    category: "متعة",
    guide: "{prefix}أنثى عشوائية"
  },

  onStart: async function({ event, threadsData, message, usersData }) {
    const uidI = event.senderID;
    const avatarUrl1 = await usersData.getAvatarUrl(uidI);
    const name1 = await usersData.getName(uidI);
    const threadData = await threadsData.get(event.threadID);
    const members = threadData.members.filter(member => member.inGroup);
    const senderGender = threadData.members.find(member => member.userID === uidI)?.gender;

    if (members.length === 0) return message.reply('لا يوجد أعضاء في المجموعة ☹️💕😢');

    const eligibleMembers = members.filter(member => member.gender !== senderGender);
    if (eligibleMembers.length === 0) return message.reply('لا يوجد أعضاء ذكور / إناث في المجموعة ☹️💕😢');

    const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
    const randomMember = eligibleMembers[randomIndex];
    const name2 = await usersData.getName(`${randomMember.userID}`);
    const avatarUrl2 = await usersData.getAvatarUrl(`${randomMember.userID}`);
    const randomNumber1 = Math.floor(Math.random() * 36) + 65;
    const randomNumber2 = Math.floor(Math.random() * 36) + 65;

    message.reply({
      body: `• الجميع يهنئ الزوج والزوجة الجديدين:
        ❤️ ${name1} 💕 ${name2} ❤️
        نسبة الحب: "${randomNumber1} % 🤭"
        نسبة التوافق: "${randomNumber2} % 💕"
        
        تهانينا 💝`,
      attachment: [
        await getStreamFromURL(`${avatarUrl1}`),
        await getStreamFromURL(`${avatarUrl2}`)
      ]
    });
  }
}; 
