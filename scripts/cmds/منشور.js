"use strict";

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const {
	createCanvas,
	loadImage,
	registerFont
} = require("canvas");

// تسجيل الخط العربي
registerFont(
	path.join(__dirname, "assets/font/Cairo-Regular.ttf"),
	{
		family: "Cairo"
	}
);

module.exports = {
	config: {
		name: "منشور",
		aliases: ["post", "fbpost"],
		version: "2.0.0",
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

	onStart: async function ({
		api,
		event,
		args
	}) {

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

			const backgroundPath = path.join(cache, "facebook_bg.jpg");
			const avatarPath = path.join(cache, `${event.senderID}.png`);
			const outputPath = path.join(cache, `post_${Date.now()}.png`);

			// تحميل الخلفية
			const background = await axios.get(
				"https://i.imgur.com/VrcriZF.jpg",
				{
					responseType: "arraybuffer"
				}
			);

			fs.writeFileSync(
				backgroundPath,
				background.data
			);

			// تحميل صورة البروفايل
			const avatar = await axios.get(
				`https://graph.facebook.com/${event.senderID}/picture?width=512&height=512`,
				{
					responseType: "arraybuffer"
				}
			);

			fs.writeFileSync(
				avatarPath,
				avatar.data
			);

			const bg = await loadImage(backgroundPath);
			const profile = await loadImage(avatarPath);

			const canvas = createCanvas(
				bg.width,
				bg.height
			);

			const ctx = canvas.getContext("2d");

			ctx.drawImage(
				bg,
				0,
				0,
				canvas.width,
				canvas.height
			);

			// رسم الصورة الدائرية
			ctx.save();

			ctx.beginPath();
			ctx.arc(
				69,
				69,
				52,
				0,
				Math.PI * 2
			);

			ctx.closePath();
			ctx.clip();

			ctx.drawImage(
				profile,
				17,
				17,
				104,
				104
			);

			ctx.restore();

			let userName = "Facebook User";

			try {

				const info =
					await api.getUserInfo(event.senderID);

				userName =
					info[event.senderID].name;

			} catch {}

			ctx.fillStyle = "#000";
			ctx.textAlign = "left";

			ctx.font = "bold 32px Cairo";

			ctx.fillText(
				userName,
				135,
				55
			);

			ctx.font = "42px Cairo";
			ctx.fillStyle = "#000";

			const maxWidth = 650;

			const words = text.split(" ");

			let line = "";

			let lines = [];
						for (const word of words) {

				const testLine =
					line + word + " ";

				if (
					ctx.measureText(testLine).width >
					maxWidth
				) {
					lines.push(line);
					line = word + " ";
				}
				else {
					line = testLine;
				}
			}

			lines.push(line);

			let y = 180;

			for (const txt of lines) {

				ctx.fillText(
					txt,
					20,
					y
				);

				y += 55;
			}

			fs.writeFileSync(
				outputPath,
				canvas.toBuffer("image/png")
			);

			await api.sendMessage(
				{
					attachment:
						fs.createReadStream(outputPath)
				},
				event.threadID,
				() => {

					[
						backgroundPath,
						avatarPath,
						outputPath
					].forEach(file => {

						if (
							fs.existsSync(file)
						)
							fs.unlinkSync(file);

					});

				},
				event.messageID
			);

		}
		catch (err) {

			console.error(err);

			api.sendMessage(
				"❌ حدث خطأ أثناء إنشاء المنشور.",
				event.threadID,
				event.messageID
			);

		}

	}
};
