const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
    config: {
        name: "doof",
        version: "1.1.0",
        role: 0,
        author: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 & Fares",
        description: {
            ar: "كتابة التعليق على اللوحة ( ͡° ͜ʖ ͡°)"
        },
        category: "Edit-IMG",
        usages: {
            ar: "doof [النص]"
        },
        countDown: 5,
        dependencies: {
            "canvas": "",
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
        let { threadID, messageID } = event;
        const text = args.join(" ");
        if (!text) return message.reply("× يا غالي، اكتب النص الذي تريد وضعه على اللوحة! 📝");

        let pathImg = path.join(__dirname, 'cache', 'doof.png');

        try {
            await new Promise((resolve) => api.setMessageReaction("🎨", messageID, resolve, true));

            // التأكد من وجود مجلد الكاش
            await fs.ensureDir(path.dirname(pathImg));

            const response = await axios.get("https://i.imgur.com/bMxrqTL.png", { responseType: 'arraybuffer' });
            fs.writeFileSync(pathImg, Buffer.from(response.data));

            let baseImage = await loadImage(pathImg);
            let canvas = createCanvas(baseImage.width, baseImage.height);
            let ctx = canvas.getContext("2d");
            ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
            
            ctx.font = "400 18px Arial";
            ctx.fillStyle = "#000000";
            ctx.textAlign = "start";
            let fontSize = 50;
            
            while (ctx.measureText(text).width > 1200 && fontSize > 10) {
                fontSize--;
                ctx.font = `400 ${fontSize}px Arial`;
            }

            const lines = await this.wrapText(ctx, text, 470);
            if (lines && lines.length > 0) {
                ctx.fillText(lines.join('\n'), 42, 79);
            }

            ctx.beginPath();
            const imageBuffer = canvas.toBuffer();
            fs.writeFileSync(pathImg, imageBuffer);

            return message.reply({
                attachment: fs.createReadStream(pathImg)
            }, () => {
                try { fs.unlinkSync(pathImg); } catch (e) {}
            });

        } catch (err) {
            console.error("Doof Error:", err.message);
            try { fs.unlinkSync(pathImg); } catch (e) {}
            return message.reply("× صرا مشكل في معالجة الصورة، عاود حاول لاحقاً يا عُمري.");
        }
    }
};
