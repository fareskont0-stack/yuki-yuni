const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "فارس",
        version: "2.3.0",
        author: "Fares",
        countDown: 0,
        role: 0,
        shortDescription: {
            ar: "الرد الصوتي التلقائي"
        },
        longDescription: {
            ar: "يرد البوت صوتياً تلقائياً عند قول الكلمة المخصصة"
        },
        category: "خدمات"
    },

    onStart: async function () {},

    handleEvent: async function ({ api, event, message }) {
        try {
            if (!event.body) return;
            const content = event.body.toLowerCase();
            
            // قم بتغيير كلمة "فارس" أدناه إلى أي كلمة ترغب في أن يتقرب منها البوت ويرد صوتياً
            const triggerWord = "فارس";
            
            if (content === triggerWord || content.startsWith(triggerWord + " ") || content.includes("يا " + triggerWord)) {
                
                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) {
                    fs.mkdirSync(cacheDir, { recursive: true });
                }
                
                const audioPath = path.join(cacheDir, `bot_voice_${Date.now()}.mp3`);
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

                    return message.reply({
                        body: "نعم يا عمري تفضل 🥺✨",
                        attachment: fs.createReadStream(audioPath)
                    }, () => {
                        if (fs.existsSync(audioPath)) {
                            fs.unlinkSync(audioPath);
                        }
                    });

                } catch (apiError) {
                    return message.reply("نعم يا عمري تفضل 🥺✨");
                }
            }
        } catch (error) {
            console.error("Voice Reply Event Error:", error);
        }
    }
};
