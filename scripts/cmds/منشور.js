const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
	config: {
		name: "منشور",
		aliases: ["post", "fbpost"],
		version: "1.0.0",
		author: "Fares",
		countDown: 5,
		role: 0,
		description: {
			ar: "إنشاء منشور فيسبوك بصورة بروفايلك"
		},
		category: "image",
		guide: {
			ar: "{pn} [النص]"
		}
	},

	onStart: async function ({ api, event, args }) {
		try {
			const text = args.join(" ");

			if (!text)
				return api.sendMessage(
					"❌ | اكتب النص.\nمثال:\nمنشور مرحباً بكم",
					event.threadID,
					event.messageID
				);

			const cache = path.join(__dirname, "cache");
			fs.ensureDirSync(cache);

			const bgPath = path.join(cache, "bg.jpg");
			const avatarPath = path.join(cache, `${event.senderID}.png`);
			const outPath = path.join(cache, `post_${Date.now()}.png`);

			const background =
				await axios.get(
					"https://i.imgur.com/VrcriZF.jpg",
					{ responseType: "arraybuffer" }
				);

			fs.writeFileSync(bgPath, background.data);

			const avatar =
				await axios.get(
					`https://graph.facebook.com/${event.senderID}/picture?width=512&height=512`,
					{ responseType: "arraybuffer" }
				);

			fs.writeFileSync(avatarPath, avatar.data);

			const bg = await loadImage(bgPath);
			const avt = await loadImage(avatarPath);

			const canvas = createCanvas(bg.width, bg.height);
			const ctx = canvas.getContext("2d");

			ctx.drawImage(bg, 0, 0);

			ctx.save();
			ctx.beginPath();
			ctx.arc(69, 69, 52, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avt, 17, 17, 104, 104);
			ctx.restore();

			let name = "Facebook User";

			try {
				const info = await api.getUserInfo(event.senderID);
				name = info[event.senderID].name;
			} catch {}

			ctx.fillStyle = "#000";
			ctx.font = "bold 32px Arial";
			ctx.fillText(name, 135, 55);

			ctx.font = "42px Arial";
			ctx.fillStyle = "#000";

			const words = text.split(" ");
			let line = "";
			let y = 180;

			for (const word of words) {
				const test = line + word + " ";

				if (ctx.measureText(test).width > 650) {
					ctx.fillText(line, 20, y);
					line = word + " ";
					y += 50;
				} else {
					line = test;
				}
			}

			ctx.fillText(line, 20, y);

			fs.writeFileSync(outPath, canvas.toBuffer());

			await api.sendMessage(
				{
					attachment: fs.createReadStream(outPath)
				},
				event.threadID,
				() => {
					[bgPath, avatarPath, outPath].forEach(file => {
						if (fs.existsSync(file)) fs.unlinkSync(file);
					});
				},
				event.messageID
			);

		} catch (e) {
			console.log(e);
			api.sendMessage(
				"❌ حدث خطأ أثناء إنشاء المنشور.",
				event.threadID,
				event.messageID
			);
		}
	}
};
