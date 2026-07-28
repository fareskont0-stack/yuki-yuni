const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

const fontPath = path.join(__dirname, "assets", "font", "Cairo-Regular.ttf");

if (!GlobalFonts.has("Cairo")) {
  GlobalFonts.registerFromPath(fontPath, "Cairo");
}

module.exports = {
    config: {
        name: "مارك",
        version: "1.0.5",
        role: 0,
        author: "Fares Kouachi",
        aliases: ["mark"],
        description: {
            ar: "تصميم منشور باسم مارك زوكربيرج مع النص الذي تكتبه"
        },
        category: "Edit-IMG",
        usages: {
            ar: "مارك [النص]"
        },
        countDown: 5,
        dependencies: {
            "@napi-rs/canvas": "^0.1.3",
            "axios": "^1.6.0",
            "fs-extra": "^11.1.1"
        }
    },

    wrapText: function (ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    },

    onStart: async function ({ api, event, args, message }) {
        const { messageID, threadID } = event;
        const text = args.join(" ");

        if (!text) {
            return message.reply("× يا غالي، اكتب النص الذي تريد أن يظهر في المنشور!\n• مثال: `مارك كيف حالك`");
        }

        const cacheDir = path.join(__dirname, 'cache');
        const pathImg = path.join(cacheDir, `mark_${threadID}_${Date.now()}.png`);

        try {
            api.setMessageReaction("🎨", messageID, () => {}, true);
            await fs.ensureDir(cacheDir);

            const templateResponse = await axios.get("https://i.postimg.cc/SshySpjh/file-00000000850881f4a1225f4279ae841b.png", { 
                responseType: 'arraybuffer',
                timeout: 10000 
            });
            
            if (templateResponse.status !== 200) throw new Error("Failed to download image");
            
            const imageBufferData = Buffer.from(templateResponse.data);
            const baseImage = await loadImage(imageBufferData);
            
            const canvas = createCanvas(baseImage.width, baseImage.height);
            const ctx = canvas.getContext("2d");

            ctx.drawImage(baseImage, 0, 0, canvas.width, baseImage.height);
            
            // جعل الخط عريضاً (Bold) واتجاه الكتابة من اليسار لليمين (ltr) مع محاذاة لليسار (left)
            ctx.font = "bold 38px Cairo";
            ctx.fillStyle = "#050505";
            ctx.textBaseline = "top";
            ctx.direction = "ltr";
            ctx.textAlign = "left";

            // نقطة البداية من جهة اليسار
            const startX = 90;
            const startY = 210;
            const maxWidth = canvas.width - 200;
            const lineHeight = 50;

            const lines = this.wrapText(ctx, text, maxWidth);

            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], startX, startY + (i * lineHeight));
            }

            const imageBuffer = canvas.toBuffer("image/png");
            fs.writeFileSync(pathImg, imageBuffer);

            await message.reply({
                body: `✅ | ها هو تصميم المنشور الخاص بـ "مارك" يا غالي 🤍`,
                attachment: fs.createReadStream(pathImg)
            });

        } catch (err) {
            console.error("Mark Command Error:", err);
            let errorMsg = "× عذراً يا عُمري، حدث مشكل أثناء معالجة وتصميم الصورة.";
            if (err.code === 'ETIMEDOUT') errorMsg = "× انتهى وقت الاتصال أثناء تحميل القالب، الرجاء المحاولة لاحقاً.";
            message.reply(errorMsg);
        } finally {
            try {
                if (fs.existsSync(pathImg)) {
                    fs.unlinkSync(pathImg);
                }
            } catch (e) {
                console.error("Failed to delete temp image:", e);
            }
        }
    }
};
