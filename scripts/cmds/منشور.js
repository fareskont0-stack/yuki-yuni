import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import jimp from 'jimp';

export default {
    config: {
        name: "منشور",
        version: "2.0.0",
        hasPermssion: 0,
        credits: "Fares Kouachi",
        description: "تصميم منشور تفاعلي مع صورة البروفايل والنص / Create interactive post with text and avatar",
        commandCategory: "Edit-img",
        usages: "[النص المراد كتابته]",
        cooldowns: 5,
        dependencies: {
            "canvas": "",
            "axios": "",
            "fs-extra": "",
            "jimp": ""
        }
    },

    // دمج الصورة بشكل دائري احترافي
    circle: async function(imageBuffer) {
        let image = await jimp.read(imageBuffer);
        image.circle();
        return await image.getBufferAsync("image/png");
    },

    // دالة التفاف النص التلقائي (Wrap Text) لتجنب خروج الكلمات عن إطار الصورة
    wrapText: function(ctx, text, maxWidth) {
        return new Promise(resolve => {
            if (ctx.measureText(text).width < maxWidth) return resolve([text]);
            if (ctx.measureText('W').width > maxWidth) return resolve(null);
            const words = text.split(' ');
            const lines = [];
            let line = '';
            while (words.length > 0) {
                let split = false;
                while (ctx.measureText(words[0]).width >= maxWidth) {
                    const temp = words[0];
                    words[0] = temp.slice(0, -1);
                    if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
                    else {
                        split = true;
                        words.splice(1, 0, temp.slice(-1));
                    }
                }
                if (ctx.measureText(`${line} ${words[0]}`).width < maxWidth) line += `${words.shift()} `;
                else {
                    lines.push(line.trim());
                    line = '';
                }
                if (words.length === 0) lines.push(line.trim());
            }
            return resolve(lines);
        });
    },

    // الحدث الرئيسي لنظام GoatBot V3 (onStart)
    onStart: async function({ api, event, args }) {
        const { senderID, threadID, messageID } = event;
        const text = args.join(" ");

        if (!text) {
            return api.sendMessage("❌ يرجى كتابة النص المراد وضعه في المنشور!\nمثال: منشور مرحباً بك يا زميلي", threadID, messageID);
        }

        const cacheDir = path.resolve(process.cwd(), "cache");
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        let avatarPath = path.resolve(cacheDir, `avt_${senderID}.png`);
        let outputPath = path.resolve(cacheDir, `post_${senderID}_${Date.now()}.png`);

        try {
            // جلب معلومات المستخدم وصورة البروفايل عبر Graph API
            const token = process.env.PAGE_ACCESS_TOKEN;
            let userName = "مستخدم فيسبوك";
            let avatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

            try {
                const userInfoRes = await axios.get(`https://graph.facebook.com/v18.0/${senderID}?fields=first_name,last_name&access_token=${token}`);
                if (userInfoRes.data) {
                    userName = `${userInfoRes.data.first_name || ""} ${userInfoRes.data.last_name || ""}`.trim();
                }
            } catch (err) {
                // استخدام اسم افتراضي في حال فشل جلب الاسم
            }

            // تحميل قالب الخلفية والصورة الشخصية
            const backgroundUrl = "https://i.imgur.com/VrcriZF.jpg";
            
            const [avatarRes, bgRes] = await Promise.all([
                axios.get(avatarUrl, { responseType: 'arraybuffer' }),
                axios.get(backgroundUrl, { responseType: 'arraybuffer' })
            ]);

            // معالجة الصورة الشخصية وجعلها دائرية
            let circularAvatarBuffer = await this.circle(Buffer.from(avatarRes.data));
            fs.writeFileSync(avatarPath, circularAvatarBuffer);

            // رسم القالب والبيانات على الـ Canvas
            let baseImage = await loadImage(Buffer.from(bgRes.data));
            let avatarImage = await loadImage(avatarPath);

            let canvas = createCanvas(baseImage.width, baseImage.height);
            let ctx = canvas.getContext("2d");

            // رسم الخلفية
            ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
            // رسم صورة البروفايل في المكان المخصص
            ctx.drawImage(avatarImage, 17, 17, 104, 104);

            // كتابة اسم المستخدم
            ctx.font = "bold 32px Arial, sans-serif";
            ctx.fillStyle = "#000000";
            ctx.textAlign = "start";
            ctx.fillText(userName, 130, 55);

            // إعداد حجم ونمط الخط للنص الرئيسي
            ctx.font = "45px Arial, sans-serif";
            ctx.fillStyle = "#000000";

            // تنسيق وتقسيم النص ليتوافق مع عرض الإطار
            const lines = await this.wrapText(ctx, text, 650);
            
            // طباعة الأسطر بالترتيب مع مسافة مناسبة بينها
            let startY = 180;
            if (lines && lines.length > 0) {
                for (let i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], 17, startY + (i * 50));
                }
            }

            // حفظ الملف المؤقت وإرساله كرفق في المحادثة
            const imageBuffer = canvas.toBuffer();
            fs.writeFileSync(outputPath, imageBuffer);

            return api.sendMessage({
                attachment: fs.createReadStream(outputPath)
            }, threadID, () => {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                if (fs.existsSync(avatarPath)) fs.unlinkSync(outputPath); // تنظيف الكاش
            }, messageID);

        } catch (error) {
            console.error("خطأ في تنفيذ أمر المنشور:", error);
            return api.sendMessage("❌ حدث خطأ تقني أثناء معالجة الصورة، يرجى المحاولة لاحقاً.", threadID, messageID);
        }
    }
};
