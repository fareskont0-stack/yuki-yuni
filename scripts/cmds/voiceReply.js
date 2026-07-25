const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "voiceReply",
        version: "2.1.0",
        author: "Fares",
        countDown: 0,
        role: 0,
        shortDescription: {
            ar: "الرد الصوتي التلقائي"
        },
        longDescription: {
            ar: "يرد البوت صوتياً تلقائياً عند قول كلمة بوت"
        },
        category: "خدمات"
    },

    onStart: async function () {
        // تركها فارغة لكي لا تعتبر أمراً مكتوباً بالبادئة
    },

    handleEvent: async function ({ api, event, message }) {
        try {
            if (!event.body) return;
            const content = event.body.toLowerCase();
            
            // تحقق إذا كانت الرسالة تحتوي على كلمة بوت فقط أو تبدأ بها
            if (content === "بوت" || content.startsWith("بوت ") || content.includes("يا بوت")) {
                
                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) {
                    fs.mkdirSync(cacheDir, { recursive: true });
                }
                
                const audioPath = path.join(cacheDir, `bot_voice_${Date.now()}.mp3`);

                if (message.react) message.react("🎙️");

                const apiKey = "1c582f665eba4274b1afb6c8c29c88a9";
                
                try {
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
                    console.error("API Error, sending text fallback:", apiError.message);
                    if (message.react) message.react("✨");
                    return message.reply("نعم يا عمري تفضل 🥺✨");
                }

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
            console.error("Voice Reply Event Error:", error);
        }
    }
};
