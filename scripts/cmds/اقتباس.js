const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "سيرة",
    author: "حسين يعقوبي",
    aliases: ["biography", "bio"],
    category: "سير ذاتية",
    shortDescription: {
      en: "إرسال سيرة ذاتية عشوائية.",
      tl: "Magpadala ng random na bio."
    },
    longDescription: {
      en: "سيرسل هذا الأمر سيرة ذاتية إنجليزية مزخرفة بخط عريض مع شرحها بالعربية وصورة فخمة.",
      tl: "Magpapadala ito ng bold styled english bio na قدوة."
    },
    guide: {
      en: "{p}سيرة",
      tl: "{p}bio"
    }
  },
  onStart: async function ({ message, api, event }) {
    try {
      const bios = [
        
        // النوع الأول: زخرفة عريضة وثقيلة
        `𝗧𝗿𝗮𝗶𝗻 𝗛𝗮𝗿𝗱 • 𝗦𝘁𝗮𝘆 𝗛𝘂𝗺𝗯𝗹𝗲 🍓✨🩵\n▪️ الإتباس: تدرب بجد وابق متواضعاً.\n▪️ الشرح: أهمية الاجتهاد المستمر مع الحفاظ على تواضع النفس مهما بلغت من إنجازات.`,

        `𝗜 𝘄𝗶𝘀𝗵 𝘄𝗲 𝗰𝗼𝘂𝗹𝗱 𝘀𝘁𝗼𝗽 𝘁𝗶𝗺𝗲 𝗼𝗻 𝗺𝗼𝗺𝗲𝗻𝘁𝘀 𝘄𝗵𝗲𝗻 𝘄𝗲 𝘄𝗲𝗿𝗲 𝗵𝗮𝗽𝗽𝘆 🍓✨🩵\n▪️ الإتباس: أتمنى لو كان بإمكاننا إيقاف الزمن على اللحظات التي كنا بها سعداء.\n▪️ الشرح: تعبير عميق عن الحنين للماضي والرغبة في تخليد لحظات السعادة الجميلة.`,

        `𝗢𝗻𝗲 𝗼𝗳 𝘁𝗵𝗲𝗺 𝗹𝗮𝘂𝗴𝗵𝘀, 𝗼𝗻𝗲 𝗼𝗳 𝘁𝗵𝗲𝗺 𝗰𝗿𝗶𝗲𝘀, 𝗮𝗻𝗱 𝗮𝗹𝗹 𝗼𝗳 𝘁𝗵𝗲𝗺 𝗮𝗿𝗲 𝗺𝗲 🍓✨🩵\n▪️ الإتباس: أحدهم يضحك وأحدهم يبكي، وجميعهم أنا.\n▪️ الشرح: وصف لحالة التناقض النفسي والمشاعر المختلطة التي يعاني منها الشخص بصمت.`,

        `𝗗𝗼𝗻'𝘁 𝗱𝗲𝘀𝗽𝗮𝗶𝗿 𝘄𝗵𝗶𝗹𝗲 𝘆𝗼𝘂 𝗸𝗻𝗼𝘄 𝘁𝗵𝗮𝘁 𝗔𝗹𝗹𝗮𝗵 𝗮𝗹𝘄𝗮𝘆𝘀 𝗰𝗿𝗲𝗮𝘁𝗲𝘀 𝗻𝗲𝘄 𝗹𝗶𝗴𝗵𝘁 🍓✨🩵\n▪️ الإتباس: لا تيأس وأنت تعلم أن الله دوماً يخلق نوراً جديداً.\n▪️ الشرح: بث الأمل في القلوب المكسورة وتذكير بأن بعد كل عتمة فرج قريب.`,

        `𝗧𝗵𝗲𝘆 𝘄𝗶𝗹𝗹 𝗺𝗶𝘀𝘀 𝘆𝗼𝘂 𝘄𝗵𝗲𝗻 𝘁𝗵𝗲𝘆 𝗳𝗮𝗶𝗹 𝘁𝗼 𝗳𝗶𝗻𝗱 𝘀𝗼𝗺𝗲𝗼𝗻𝗲 𝗹𝗶𝗸𝗲 𝘆𝗼𝘂 🍓✨🩵\n▪️ الإتباس: سوف يشتاقون إليك عندما يفشلوا في العثور على شخص مثلك.\n▪️ الشرح: رسالة ثقة بالنفس بأن القيمين الحقيقيين لا يُعوضون بسهولة.`
      ];

      // مسار ملف الـ JSON بشكل آمن وصحيح
      const filePath = path.join(__dirname, 'quots.json');
      
      let link = "https://i.imgur.com/3W2Wq4W.jpg"; // رابط احتياطي في حال لم يتم العثور على الملف
      
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(fileContent);
        if (json && json.length > 0) {
          const data = json[Math.floor(Math.random() * json.length)];
          if (data && data.link) {
            link = data.link;
          }
        }
      }

      const randomBio = bios[Math.floor(Math.random() * bios.length)];

      // إرسال التفاعل أولاً
      api.setMessageReaction("💖", event.messageID, () => {}, true);
    
      // إرسال الرد مع الصورة والـ Stream
      return message.reply({
        body: randomBio,
        attachment: await global.utils.getStreamFromURL(link)
      });

    } catch (error) {
      console.error(error);
      return message.reply("حدث خطأ أثناء تنفيذ الأمر، يرجى المحاولة لاحقاً.");
    }
  }
};
