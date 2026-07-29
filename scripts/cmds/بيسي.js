const { createCanvas, loadImage } = require("@napi-rs/canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
    config: {
        name: "pc",
        version: "1.0.0",
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
            timeout: "× انتهى الوقت المخصص (60 ثانية) ولم تقم بإرسال الصورة.",
            processing: "⌛ | جاري معالجة الصورة ودمجها داخل الشاشة، يرجى الانتظار...",
            success: "✅ | إليك التصميم النهائي يا فنان 🤍",
            error: "× حدث خطأ أثناء معالجة الصورة: %1"
        },
        en: {
            prompt: "🖥️ | Please send a screenshot of your profile within 60 seconds. 🌸",
            noImage: "× You didn't send any image! Command cancelled.",
            timeout: "× Time's up (60 seconds) and no image was provided.",
            processing: "⌛ | Processing and merging your image into the screen, please wait...",
            success: "✅ | Here is your final design 🤍",
            error: "× An error occurred while processing the image: %1"
        }
    },

    onStart: async function ({ api, event, message, getLang }) {
        const { messageID, threadID, senderID } = event;

        // إرسال رسالة طلب الصورة وتفعيل نظام onReply
        return message.reply(getLang("prompt"), (err, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                type: "getScreen"
            });
        });
    },

    onReply: async function ({ api, event, reply, message, getLang }) {
        const { senderID, body, attachments, messageID, threadID } = event;

        if (reply.author !== senderID) return;

        // التحقق من أن المستخدم أرسل صورة
        if (!attachments || attachments.length === 0 || attachments[0].type !== "photo") {
            return message.reply(getLang("noImage"));
        }

        const imageUrl = attachments[0].url;
        const cacheDir = path.join(__dirname, 'cache');
        const pathTemplate = path.join(cacheDir, `pc_template_${threadID}_${Date.now()}.png`);
        const pathUserImg = path.join(cacheDir, `pc_user_${threadID}_${Date.now()}.png`);
        const pathOutput = path.join(cacheDir, `pc_output_${threadID}_${Date.now()}.png`);

        try {
            // إلغاء الرد المؤقت لعدم تكرار التفاعل
            global.client.handleReply = global.client.handleReply.filter(item => item.messageID !== reply.messageID);

            api.setMessageReaction("⌛", messageID, () => {}, true);
            await fs.ensureDir(cacheDir);

            // تحميل قالب الكمبيوتر وصورة المستخدم في نفس الوقت
            const templateResponse = await axios.get("https://i.postimg.cc/TwsZz5kH/file-00000000393081f497e3598e56cc12d6.png", { responseType: 'arraybuffer' });
            const userImgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

            fs.writeFileSync(pathTemplate, Buffer.from(templateResponse.data));
            fs.writeFileSync(pathUserImg, Buffer.from(userImgResponse.data));

            const templateImage = await loadImage(pathTemplate);
            const userImage = await loadImage(pathUserImg);

            const canvas = createCanvas(templateImage.width, templateImage.height);
            const ctx = canvas.getContext("2d");

            // رسم الشاشة الخاصة بالكمبيوتر (إحداثيات الشاشة الداخلية للقالب)
            // يمكنك تعديل الأبعاد (x, y, width, height) حسب مقاسات شاشة القالب بدقة إذا لزم الأمر
            const screenX = 140; 
            const screenY = 110;
            const screenWidth = 1000;
            const screenHeight = 620;

            // تطبيق تأثير Cover لملء مساحة الشاشة بالصورة بدون تشويه
            const imageAspectRatio = userImage.width / userImage.height;
            const screenAspectRatio = screenWidth / screenHeight;
            
            let renderWidth, renderHeight, renderX, renderY;

            if (imageAspectRatio > screenAspectRatio) {
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

            // قص منطقة الشاشة ورسم صورة المستخدم داخلها
            ctx.save();
            ctx.beginPath();
            ctx.rect(screenX, screenY, screenWidth, screenHeight);
            ctx.clip();
            ctx.drawImage(userImage, renderX, renderY, renderWidth, renderHeight);
            ctx.restore();

            // رسم قالب الكمبيوتر فوق الصورة لتبدو كأنها داخل الشاشة حقاً
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
            // حذف جميع الملفات المؤقتة لتنظيف الذاكرة والسيرفر
            try {
                if (fs.existsSync(pathTemplate)) fs.unlinkSync(pathTemplate);
                if (fs.existsSync(pathUserImg)) fs.unlinkSync(pathUserImg);
                if (fs.existsSync(pathOutput)) fs.unlinkSync(pathOutput);
            } catch (e) {
                console.error("Failed to clean up cache files:", e);
            }
        }
    }
};
