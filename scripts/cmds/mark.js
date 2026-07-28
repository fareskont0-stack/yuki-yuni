const { loadImage, createCanvas } = require("@napi-rs/canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
    config: {
        name: "مارك",
        version: "1.0.0",
        role: 0,
        author: "Fares Kouachi",
        aliases: ["mark"],
        description: {
            ar: "تصميم منشور باسم مارك زوكربيرج مع النص الذي تكتبه"
        },
        category: "Edit-IMG",
        usages: {
            ar: "مارك [اكتب النص هنا]"
        },
        countDown: 5,
        dependencies: {
            "@napi-rs/canvas": "",
            "axios": "",
            "fs-extra": ""
        }
    },

    wrapText: async function (ctx, text, maxWidth) {
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
                if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
                else {
                    lines.push(line.trim());
                    line = '';
                }
                if (words.length === 0) lines.push(line.trim());
            }
            return resolve(lines);
        });
    },

    onStart: async function ({ api, event, args, message }) {
        let { messageID } = event;
        const text = args.join(" ");
        if (!text) return message.reply("× يا غالي، اكتب النص الذي تريد أن يظهر في المنشور!\n• مثال: `مارك كيف حالك`");

        let pathImg = path.join(__dirname, 'cache', `mark_${Date.now()}.png`);

        try {
            await new Promise((resolve) => api.setMessageReaction("🎨", messageID, resolve, true));
            await fs.ensureDir(path.dirname(pathImg));

            // تحميل القالب من الرابط المباشر الذي أعطيته
            const templateResponse = await axios.get("https://i.postimg.cc/SshySpjh/file-00000000850881f4a1225f4279ae841b.png", { responseType: 'arraybuffer' });
            fs.writeFileSync(pathImg, Buffer.from(templateResponse.data));

            let baseImage = await loadImage(pathImg);
            let canvas = createCanvas(baseImage.width, baseImage.height);
            let ctx = canvas.getContext("2d");
            ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
            
            // خصائص الخط والتنسيق (متوافق مع العربية والإنجليزية)
            ctx.font = "500 35px Arial";
            ctx.fillStyle = "#050505";
            ctx.direction = "ltr"; // أو rtl حسب رغبتك في اتجاه السطور

            // تحديد أقصى عرض مسموح به للنص داخل القالب
            const lines = await this.wrapText(ctx, text, 1100);
            if (lines && lines.length > 0) {
                // إحداثيات مكان ظهور النص تحت اسم مارك في الصورة
                let startX = 80;
                let startY = 220;
                let lineHeight = 45;

                for (let i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], startX, startY + (i * lineHeight));
                }
            }

            const imageBuffer = canvas.toBuffer("image/png");
            fs.writeFileSync(pathImg, imageBuffer);

            return message.reply({
                body: `✅ | ها هو تصميم المنشور الخاص بـ "مارك" يا غالي <😘`,
                attachment: fs.createReadStream(pathImg)
            }, () => {
                try { fs.unlinkSync(pathImg); } catch (e) {}
            });

        } catch (err) {
            console.error("Mark Command Error:", err.message);
            try { fs.unlinkSync(pathImg); } catch (e) {}
            return message.reply("× عذراً يا عُمري، حدث مشكل أثناء معالجة وتصميم الصورة.");
        }
    }
};
