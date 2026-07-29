const { createCanvas, loadImage } = require("@napi-rs/canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
    config: {
        name: "pc",
        version: "1.6.0",
        role: 0,
        author: "Fares Kouachi",
        aliases: ["كمبيوتر"],
        description: {
            ar: "تصميم لقطة الشاشة داخل قالب الكمبيوتر الشفاف باحترافية تامة وبدون تشوه",
            en: "Design screenshot inside transparent PC template professionally without distortion"
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
            processing: "⌛ | جاري دمج صورتك داخل شاشة الكمبيوتر باحترافية، يرجى الانتظار...",
            success: "✅ | إليك التصميم الاحترافي والواقعي يا فنان 🤍",
            error: "× حدث خطأ أثناء معالجة الصورة: %1"
        },
        en: {
            prompt: "🖥️ | Please send a screenshot of your profile within 60 seconds. 🌸",
            noImage: "× You didn't send any image! Command cancelled.",
            processing: "⌛ | Processing and merging your image into the PC screen, please wait...",
            success: "✅ | Here is your realistic professional design 🤍",
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

            const templateURL = "https://i.postimg.cc/VNVNg8rq/file-0000000064b881f48f93fe1bb651f7e5.png";

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

            // إحداثيات ومقاسات الفراغ الشفاف داخل القالب بدقة متناهية
            const screenX = 145;
            const screenY = 58;
            const screenWidth = 1040;
            const screenHeight = 672;

            // تطبيق خوارزمية الحفاظ على الأبعاد (Cover) لمنع أي تشوه مهما كانت أبعاد صورة المستخدم
            const imgAspect = userImage.width / userImage.height;
            const scrAspect = screenWidth / screenHeight;

            let renderWidth, renderHeight, renderX, renderY;

            if (imgAspect > scrAspect) {
                renderHeight = screenHeight;
                renderWidth = userImage.width * (screenHeight / userImage.height);
                renderX = screenX + (screenWidth - renderWidth) / 2;
                renderY = screenY;
            } else {
                renderWidth = screenWidth;
                renderHeight = userImage.height * (screenWidth / userImage.width);
                renderX = screenX;
                renderY = screenY + (screenHeight - renderHeight) / 2;
            }

            // 1. رسم صورة المستخدم أولاً في الخلفية (داخل حدود الشاشة الشفافة وبدون تشوه)
            ctx.save();
            ctx.beginPath();
            ctx.rect(screenX, screenY, screenWidth, screenHeight);
            ctx.clip();
            ctx.drawImage(userImage, renderX, renderY, renderWidth, renderHeight);
            ctx.restore();

            // 2. رسم قالب الكمبيوتر الشفاف فوقها لتظهر النتيجة واقعية تماماً كأنها شاشة حقيقية
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
