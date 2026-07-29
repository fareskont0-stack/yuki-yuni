const { createCanvas, loadImage } = require("@napi-rs/canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
    config: {
        name: "pc",
        version: "1.3.0",
        role: 0,
        author: "Fares Kouachi",
        aliases: ["كمبيوتر"],
        description: {
            ar: "تصميم لقطة الشاشة داخل قالب كمبيوتر احترافي",
            en: "Design a screenshot inside a professional computer template"
        },
        category: "Edit-IMG",
        usages: {
            ar: "{pn}",
            en: "{pn}"
        },
        countDown: 5,
        dependencies: {
            "@napi-rs/canvas": "^0.1.3",
            "axios": "^1.6.0",
            "fs-extra": "^11.1.1"
        }
    },

    langs: {
        ar: {
            prompt: "🖥️ | من فضلك أرسل لقطة شاشة لملفك الشخصي خلال 60 ثانية. 🌸",
            noImage: "× لم تقم بإرسال أي صورة يا غالي! تم إلغاء الأمر.",
            processing: "⌛ | جاري معالجة الصورة ودمجها داخل الشاشة، يرجى الانتظار...",
            success: "✅ | إليك التصميم النهائي يا فنان 🤍",
            error: "× حدث خطأ أثناء معالجة الصورة: %1"
        },
        en: {
            prompt: "🖥️ | Please send a screenshot of your profile within 60 seconds. 🌸",
            noImage: "× You didn't send any image! Command cancelled.",
            processing: "⌛ | Processing and merging your image into the screen, please wait...",
            success: "✅ | Here is your final design 🤍",
            error: "× An error occurred while processing the image: %1"
        }
    },

    onStart: async function ({ api, event, message, getLang }) {
        const { senderID } = event;

        return message.reply(getLang("prompt"), (err, info) => {
            if (err) return;
            global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                messageID: info.messageID,
                author: senderID,
                type: "getScreen"
            });
        });
    },

    onReply: async function ({ api, event, Reply, message, getLang }) {
        const { senderID, attachments, messageID, threadID } = event;

        if (Reply.author !== senderID) return;

        const attachment = attachments?.[0];
        if (!attachment || attachment.type !== "photo") {
            return message.reply(getLang("noImage"));
        }

        const imageUrl = attachment.url;
        const cacheDir = path.join(__dirname, 'cache');
        const processID = `pc_${threadID}_${Date.now()}`;
        const pathTemplate = path.join(cacheDir, `${processID}_template.png`);
        const pathUserImg = path.join(cacheDir, `${processID}_user.png`);
        const pathOutput = path.join(cacheDir, `${processID}_output.png`);

        try {
            global.GoatBot.onReply.delete(Reply.messageID);
            api.setMessageReaction("⌛", messageID, () => {}, true);
            await fs.ensureDir(cacheDir);

            const templateURL = "https://i.postimg.cc/9Mq21jVq/file-00000000b68c81f4add041e2a211dfe2.png";

            const [templateResponse, userImgResponse] = await Promise.all([
                axios.get(templateURL, { responseType: 'arraybuffer' }),
                axios.get(imageUrl, { responseType: 'arraybuffer' })
            ]);

            if (!templateResponse.data || !userImgResponse.data) {
                throw new Error("Failed to download images.");
            }

            fs.writeFileSync(pathTemplate, Buffer.from(templateResponse.data));
            fs.writeFileSync(pathUserImg, Buffer.from(userImgResponse.data));

            const templateImage = await loadImage(pathTemplate);
            const userImage = await loadImage(pathUserImg);

            const canvas = createCanvas(templateImage.width, templateImage.height);
            const ctx = canvas.getContext("2d");

            // 1. ارسم صورة المستخدم أولاً في الخلفية تحت الشاشة الشفافة بدقة
            ctx.drawImage(userImage, 208, 82, 935, 535);

            // 2. ثم ارسم القالب الشفاف فوقها مباشرة
            ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);

            const finalBuffer = canvas.toBuffer("image/png");
            fs.writeFileSync(pathOutput, finalBuffer);

            api.setMessageReaction("✅", messageID, () => {}, true);

            await message.reply({
                body: getLang("success"),
                attachment: fs.createReadStream(pathOutput)
            });

        } catch (err) {
            console.error("PC Command Error:", err);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return message.reply(getLang("error", err.message));
        } finally {
            try {
                if (fs.existsSync(pathTemplate)) fs.unlinkSync(pathTemplate);
                if (fs.existsSync(pathUserImg)) fs.unlinkSync(pathUserImg);
                if (fs.existsSync(pathOutput)) fs.unlinkSync(pathOutput);
            } catch (e) {
                console.error("Failed to clean up cache files for", processID, e);
            }
        }
    }
};
