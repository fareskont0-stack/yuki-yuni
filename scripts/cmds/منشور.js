const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");
const jimp = require("jimp");

module.exports.config = {
    name: "منشور",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Fares Kouachi",
    description: "تصميم منشور تفاعلي مع صورة البروفايل والنص",
    commandCategory: "Edit-img",
    usages: "[النص المراد كتابته]",
    cooldowns: 5,
    dependencies: {
        "canvas": "",
        "axios": "",
        "fs-extra": "",
        "jimp": ""
    }
};

module.exports.circle = async function(imageBuffer) {
    let image = await jimp.read(imageBuffer);
    image.circle();
    return await image.getBufferAsync("image/png");
};

module.exports.wrapText = function(ctx, text, maxWidth) {
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
};

module.exports.run = async function({ api, event, args }) {
    let { senderID, threadID, messageID } = event;
    let text = args.join(" ");

    if (!text) {
        return api.sendMessage("❌ يرجى كتابة النص المراد وضعه في المنشور!\nمثال: منشور مرحباً بك يا زميلي", threadID, messageID);
    }

    let avatarPath = __dirname + `/cache/avt_${senderID}.png`;
    let outputPath = __dirname + `/cache/post_${senderID}_${Date.now()}.png`;

    try {
        let userName = "مستخدم فيسبوك";
        try {
            let userInfo = await api.getUserInfoV2(senderID);
            if (userInfo && userInfo.name) userName = userInfo.name;
        } catch (e) {}

        let avatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let backgroundUrl = "https://i.imgur.com/VrcriZF.jpg";

        const [avatarRes, bgRes] = await Promise.all([
            axios.get(avatarUrl, { responseType: 'arraybuffer' }),
            axios.get(backgroundUrl, { responseType: 'arraybuffer' })
        ]);

        let circularAvatarBuffer = await module.exports.circle(Buffer.from(avatarRes.data));
        fs.writeFileSync(avatarPath, circularAvatarBuffer);

        let baseImage = await loadImage(Buffer.from(bgRes.data));
        let avatarImage = await loadImage(avatarPath);

        let canvas = createCanvas(baseImage.width, baseImage.height);
        let ctx = canvas.getContext("2d");

        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(avatarImage, 17, 17, 104, 104);

        ctx.font = "bold 32px Arial, sans-serif";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "start";
        ctx.fillText(userName, 130, 55);

        ctx.font = "45px Arial, sans-serif";
        ctx.fillStyle = "#000000";

        const lines = await module.exports.wrapText(ctx, text, 650);
        let startY = 180;
        if (lines && lines.length > 0) {
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], 17, startY + (i * 50));
            }
        }

        const imageBuffer = canvas.toBuffer();
        fs.writeFileSync(outputPath, imageBuffer);

        if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);

        return api.sendMessage({
            attachment: fs.createReadStream(outputPath)
        }, threadID, () => {
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }, messageID);

    } catch (error) {
        console.error("خطأ في أمر المنشور:", error);
        return api.sendMessage("❌ حدث خطأ تقني أثناء معالجة الصورة.", threadID, messageID);
    }
};
