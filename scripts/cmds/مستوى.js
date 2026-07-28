import fs from 'fs-extra';
import path from 'path';
import { Canvas } from 'canvas';
import request from 'node-superfetch';
import jimp from 'jimp';

export default {
    config: {
        name: "مستوى",
        version: "3.0.0",
        hasPermission: 0,
        credits: "Fares Kouachi & Priyansh Rajput",
        description: "عرض رتبة ومستوى الأعضاء في المجموعة / View Member Rankings",
        commandCategory: "Group",
        usages: "[user] or [tag]",
        cooldowns: 5
    },

    circle: async function(imageBuffer) {
        let image = await jimp.read(imageBuffer);
        image.circle();
        return await image.getBufferAsync("image/png");
    },

    expToLevel: function(point) {
        if (point < 0) return 0;
        return Math.floor((Math.sqrt(1 + (4 * point) / 3) + 1) / 2);
    },

    levelToExp: function(level) {
        if (level <= 0) return 0;
        return 3 * level * (level - 1);
    },

    getInfo: async function(uid, Currencies) {
        let point = 0;
        try {
            const data = await Currencies.getData(uid);
            point = data ? data.exp || 0 : 0;
        } catch (e) {
            point = 0;
        }
        const level = this.expToLevel(point);
        const expCurrent = point - this.levelToExp(level);
        const expNextLevel = this.levelToExp(level + 1) - this.levelToExp(level);
        return { level, expCurrent, expNextLevel };
    },

    makeRankCard: async function(data) {
        const __root = path.resolve(process.cwd(), "cache");
        const PI = Math.PI;

        const { id, name, rank, level, expCurrent, expNextLevel } = data;

        // تحميل الخطوط والتحقق منها
        const fontRegular = path.resolve(__root, "regular-font.ttf");
        const fontBold = path.resolve(__root, "bold-font.ttf");

        if (fs.existsSync(fontRegular)) {
            Canvas.registerFont(fontRegular, { family: "Manrope", weight: "regular", style: "normal" });
        }
        if (fs.existsSync(fontBold)) {
            Canvas.registerFont(fontBold, { family: "Manrope", weight: "bold", style: "normal" });
        }

        const pathCustom = path.resolve(__root, "customrank");
        let dirImage = path.resolve(__root, "rankcard.png");

        if (fs.existsSync(pathCustom)) {
            let customDir = fs.readdirSync(pathCustom);
            customDir = customDir.map(item => item.replace(/\.png/g, ""));
            for (let singleLimit of customDir) {
                let limitRate = false;
                const split = singleLimit.split(/-/g);
                let min = parseInt(split[0]), max = parseInt(split[1] ? split[1] : min);
                for (; min <= max; min++) {
                    if (level == min) {
                        limitRate = true;
                        break;
                    }
                }
                if (limitRate) {
                    dirImage = path.resolve(pathCustom, `${singleLimit}.png`);
                    break;
                }
            }
        }

        let rankCard = fs.existsSync(dirImage) ? await Canvas.loadImage(dirImage) : null;
        const pathImg = path.resolve(__root, `rank_${id}_${Date.now()}.png`);

        let expWidth = (expCurrent * 610) / expNextLevel;
        if (expWidth > 610 - 19.5) expWidth = 610 - 19.5;

        // سحب صورة البروفايل عبر فايسبوك
        let avatar;
        try {
            const avatarRes = await request.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
            avatar = await this.circle(avatarRes.body);
        } catch (e) {
            // صورة افتراضية في حال فشل الجلب
            avatar = await this.circle(await request.get("https://i.imgur.com/71B4q52.png").then(res => res.body));
        }

        const canvas = Canvas.createCanvas(1000, 282);
        const ctx = canvas.getContext("2d");

        if (rankCard) ctx.drawImage(rankCard, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(await Canvas.loadImage(avatar), 70, 75, 150, 150);

        ctx.font = `bold 36px Manrope, sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "start";
        // تقصير الاسم إذا كان طويلاً جداً
        const safeName = name.length > 20 ? name.substring(0, 20) + "..." : name;
        ctx.fillText(safeName, 270, 164);

        ctx.font = `bold 38px Manrope, sans-serif`;
        ctx.fillStyle = "#FF0000";
        ctx.textAlign = "end";
        ctx.fillText(level, 934 - 68, 82);
        ctx.fillStyle = "#FF0000";
        ctx.fillText("Lv.", 934 - 55 - ctx.measureText(level).width - 10, 82);

        ctx.font = `bold 39px Manrope, sans-serif`;
        ctx.fillStyle = "#FF0000";
        ctx.textAlign = "end";
        ctx.fillText(rank, 934 - 55 - ctx.measureText(level).width - 16 - ctx.measureText(`Lv.`).width - 25, 82);
        ctx.fillStyle = "#FF0000";
        ctx.fillText("#", 934 - 55 - ctx.measureText(level).width - 16 - ctx.measureText(`Lv.`).width - 16 - ctx.measureText(rank).width - 16, 82);

        ctx.font = `bold 40px Manrope, sans-serif`;
        ctx.fillStyle = "#1874CD";
        ctx.textAlign = "start";
        ctx.fillText("/ " + expNextLevel, 710 + ctx.measureText(expCurrent).width + 10, 164);
        ctx.fillStyle = "#00BFFF";
        ctx.fillText(expCurrent, 710, 164);

        ctx.beginPath();
        ctx.fillStyle = "#FFB90F";
        ctx.arc(257 + 18.5, 147.5 + 18.5 + 36.25, 18.5, 1.5 * PI, 0.5 * PI, true);
        ctx.fill();
        ctx.fillRect(257 + 18.5, 147.5 + 36.25, expWidth, 37.5);
        ctx.arc(257 + 18.5 + expWidth, 147.5 + 18.5 + 36.25, 18.75, 1.5 * PI, 0.5 * PI, false);
        ctx.fill();

        const imageBuffer = canvas.toBuffer();
        fs.writeFileSync(pathImg, imageBuffer);
        return pathImg;
    },

    onLoad: async function () {
        const pathDir = path.resolve(process.cwd(), "cache", "customrank");
        if (!fs.existsSync(pathDir)) fs.mkdirSync(pathDir, { recursive: true });

        const fontRegPath = path.resolve(process.cwd(), 'cache', 'regular-font.ttf');
        const fontBoldPath = path.resolve(process.cwd(), 'cache', 'bold-font.ttf');
        const cardPath = path.resolve(process.cwd(), 'cache', 'rankcard.png');

        const download = async (url, dest) => {
            if (!fs.existsSync(dest)) {
                try {
                    const res = await request.get(url);
                    fs.writeFileSync(dest, res.body);
                } catch (e) {
                    console.error(`Failed to download asset: ${url}`);
                }
            }
        };

        await download("https://raw.githubusercontent.com/catalizcs/storage-data/master/rank/fonts/regular-font.ttf", fontRegPath);
        await download("https://raw.githubusercontent.com/catalizcs/storage-data/master/rank/fonts/bold-font.ttf", fontBoldPath);
        await download("https://raw.githubusercontent.com/catalizcs/storage-data/master/rank/rank_card/rankcard.png", cardPath);
    },

    run: async function ({ event, api, args, Currencies, Users }) {
        let dataAll = [];
        try {
            dataAll = await Currencies.getAll(["userID", "exp"]);
        } catch (e) {
            dataAll = [];
        }

        const mention = Object.keys(event.mentions || {});

        dataAll.sort((a, b) => (b.exp || 0) - (a.exp || 0));

        let targetID = event.senderID;
        if (mention.length > 0) {
            targetID = mention[0];
        }

        const rankIndex = dataAll.findIndex(item => parseInt(item.userID) === parseInt(targetID)) + 1;
        const rank = rankIndex === 0 ? dataAll.length + 1 : rankIndex;

        let name = "User";
        try {
            name = (global.data && global.data.userName && global.data.userName.get(targetID)) || await Users.getNameUser(targetID);
        } catch (e) {
            name = "Member";
        }

        const point = await this.getInfo(targetID, Currencies);
        let pathRankCard;
        try {
            pathRankCard = await this.makeRankCard({ id: targetID, name, rank, ...point });
        } catch (err) {
            console.error(err);
            return api.sendMessage("❌ حدث خطأ أثناء إنشاء بطاقة الرتبة، يرجى المحاولة لاحقاً.", event.threadID, event.messageID);
        }

        return api.sendMessage({
            attachment: fs.createReadStream(pathRankCard)
        }, event.threadID, () => {
            if (fs.existsSync(pathRankCard)) fs.unlinkSync(pathRankCard);
        }, event.messageID);
    }
};
