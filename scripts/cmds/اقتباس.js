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
      const dataList = [
        {
          bio: "𝗧𝗿𝗮𝗶𝗻 𝗛𝗮𝗿𝗱 • 𝗦𝘁𝗮𝘆 𝗛𝘂𝗺𝗯𝗹𝗲 🍓✨🩵\n▪️ المعنى: تدرب بجد وابق متواضعاً.\n▪️ الشرح: أهمية الاجتهاد المستمر مع الحفاظ على تواضع النفس مهما بلغت من إنجازات.",
          link: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"
        },
        {
          bio: "𝗜 𝘄𝗶𝘀𝗵 𝘄𝗲 𝗰𝗼𝘂𝗹𝗱 𝘀𝘁𝗼𝗽 𝘁𝗶𝗺𝗲 𝗼𝗻 𝗺𝗼𝗺𝗲𝗻𝘁𝘀 𝘄𝗵𝗲𝗻 𝘄𝗲 𝘄𝗲𝗿𝗲 𝗵𝗮𝗽𝗽𝘆 🍓✨🩵\n▪️ المعنى: أتمنى لو كان بإمكاننا إيقاف الزمن على اللحظات التي كنا بها سعداء.\n▪️ الشرح: تعبير عميق عن الحنين للماضي والرغبة في تخليد لحظات السعادة الجميلة.",
          link: "https://images.unsplash.com/photo-1557683316-973673baf926"
        },
        {
          bio: "𝗢𝗻𝗲 𝗼𝗳 𝘁𝗵𝗲𝗺 𝗹𝗮𝘂𝗴𝗵𝘀, 𝗼𝗻𝗲 𝗼𝗳 𝘁𝗵𝗲𝗺 𝗰𝗿𝗶𝗲𝘀, 𝗮𝗻𝗱 𝗮𝗹𝗹 𝗼𝗳 𝘁𝗵𝗲𝗺 𝗮𝗿𝗲 𝗺𝗲 🍓✨🩵\n▪️ المعنى: أحدهم يضحك وأحدهم يبكي، وجميعهم أنا.\n▪️ الشرح: وصف لحالة التناقض النفسي والمشاعر المختلطة التي يعاني منها الشخص بصمت.",
          link: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"
        },
        {
          bio: "𝗗𝗼𝗻'𝘁 𝗱𝗲𝘀𝗽𝗮𝗶𝗿 𝘄𝗵𝗶𝗹𝗲 𝘆𝗼𝘂 𝗸𝗻𝗼𝘄 𝘁𝗵𝗮𝘁 𝗔𝗹𝗹𝗮𝗵 𝗮𝗹𝘄𝗮𝘆𝘀 𝗰𝗿𝗲𝗮𝘁𝗲𝘀 𝗻𝗲𝘄 𝚕𝚒𝚐𝚑𝚝 🍓✨🩵\n▪️ المعنى: لا تيأس وأنت تعلم أن الله دوماً يخلق نوراً جديداً.\n▪️ الشرح: بث الأمل في القلوب المكسورة وتذكير بأن بعد كل عتمة فرج قريب.",
          link: "https://images.unsplash.com/photo-1534447677768-be436bb09401"
        },
        {
          bio: "𝗧𝗵𝗲𝘆 𝘄𝗶𝗹𝗹 𝗺𝗶𝘀𝘀 𝘆𝗼𝘂 𝘄𝗵𝗲𝗻 𝘁𝗵𝗲𝘆 𝗳𝗮𝗶𝗹 𝘁𝗼 𝗳𝗶𝗻𝗱 𝘀𝗼𝗺𝗲𝗼𝘯𝗲 𝗹𝗶𝗸𝗲 𝘆𝗼𝘂 🍓✨🩵\n▪️ المعنى: سوف يشتاقون إليك عندما يفشلوا في العثور على شخص مثلك.\n▪️ الشرح: رسالة ثقة بالنفس بأن القيمين الحقيقيين لا يُعوضون بسهولة.",
          link: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
        }
      ];

      const randomItem = dataList[Math.floor(Math.random() * dataList.length)];

      // إرسال التفاعل أولاً
      api.setMessageReaction("💖", event.messageID, () => {}, true);
    
      // إرسال الرد مع الصورة والـ Stream
      return message.reply({
        body: randomItem.bio,
        attachment: await global.utils.getStreamFromURL(randomItem.link)
      });

    } catch (error) {
      console.error(error);
      return message.reply("حدث خطأ أثناء تنفيذ الأمر، يرجى المحاولة لاحقاً.");
    }
  }
};
