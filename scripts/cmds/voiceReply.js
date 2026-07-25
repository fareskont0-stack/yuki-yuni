const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "voiceReply",
        version: "2.0.0",
        author: "Fares",
        countDown: 0,
        role: 0,
        shortDescription: {
            ar: "الرد الصوتي الذكي عبر الـ API"
        },
        longDescription: {
            ar: "يرد البوت برسالة صوتية حقيقية تلقائياً عندما يناديه المستخدم بكلمة بوت باستخدام مفتاح الـ API"
        },
        category: "خدمات",
        guide: {
            ar: "اكتب 'بوت' في المحادثة وسيرد عليك صوتياً"
        }
    },

    onStart: async function () {},

    onChat: async function ({ api, event, message }) {
        try {
            const content = event.body ? event.body.toLowerCase() : "";
            
            // التحقق مما إذا كانت الرسالة تبدأ أو تحتوي على كلمة بوت
            if (content === "بوت" || content.startsWith("بوت ") || content.includes("يا بوت")) {
                
                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) {
                    fs.mkdirSync(cacheDir, { recursive: true });
                }
                
                const audioPath = path.join(cacheDir, `bot_voice_${Date.now()}.mp3`);

                if (message.react) message.react("🎙️");

                // استخدام الـ API الخاص بك لتوليد الصوت (مثال موجه لخدمة تحويل النص إلى كلام)
                // يمكنك تعديل الرابط الأساسي للـ API حسب الخدمة التي يتبع لها مفتاحك
                const apiKey = "1c582f665eba4274b1afb6c8c29c88a9";
                
                try {
                    // محاولة جلب الصوت من الـ API (مثال افتراضي متوافق مع خدمات الـ TTS الشهيرة)
                    const response = await axios.post("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
                        text: "نعم يا عمري تفضل",
                        model_id: "eleven_multilingual_v2"
                    }, {
                        headers: {
                            "xi-api-key": apiKey,
                            "Content-Type": "application/json"
                        },
                        responseType: "arraybuffer"
                    });

                    fs.writeFileSync(audioPath, Buffer.from(response.data));

                } catch (apiError) {
                    // خطة بديلة احتياطية (Fallback) في حال اختلف رابط الـ API ليعمل البوت نصياً وصوتياً بدون توقف
                    console.error("API Voice Generation Error, using fallback text:", apiError.message);
                    if (message.react) message.react("✨");
                    return message.reply("نعم يا عمري تفضل 🥺✨");
                }

                // إرسال الرد الصوتي في حال نجاح العملية
                return message.reply({
                    body: "نعم يا عمري تفضل 🥺✨",
                    attachment: fs.createReadStream(audioPath)
                }, () => {
                    if (fs.existsSync(audioPath)) {
                        fs.unlinkSync(audioPath);
                    }
                });
            }
        } catch (error) {
            console.error("Voice Reply Main Error:", error);
        }
    }
};
