"use strict";

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

const FONT_PATH = path.join(
	process.cwd(),
	"assets",
	"fonts",
	"Cairo-Bold.ttf"
);

if (fs.existsSync(FONT_PATH)) {
	registerFont(FONT_PATH, {
		family: "Cairo"
	});
}

function wrapText(ctx, text, maxWidth) {
	const words = text.split(" ");
	const lines = [];
	let line = "";

	for (const word of words) {
		const test = line + word + " ";

		if (ctx.measureText(test).width > maxWidth && line !== "") {
			lines.push(line.trim());
			line = word + " ";
		}
		else {
			line = test;
		}
	}

	if (line.trim())
		lines.push(line.trim());

	return lines;
}

module.exports = {
	config: {
		name: "منشور",
		aliases: [
			"post",
			"fbpost"
		],

		version: "2.0.0",
		author: "Fares",
		role: 0,
		countDown: 5,

		description: {
			ar: "إنشاء منشور فيسبوك بصورة البروفايل"
		},

		category: "image",

		guide: {
			ar: "{pn}منشور [النص]"
		}
	},

	onStart: async function ({
		api,
		event,
		args
	}) {

		try {

			const text = args.join(" ");

			if (!text) {
				return api.sendMessage(
					"❌ | اكتب نص المنشور.",
					event.threadID,
					event.messageID
				);
			}

			const cache = path.join(
				__dirname,
				"cache"
			);

			fs.ensureDirSync(cache);

			const bgPath = path.join(cache, "bg.jpg");
			const avatarPath = path.join(
				cache,
				`${event.senderID}.png`
			);

			const outPath = path.join(
				cache,
				`post_${Date.now()}.png`
			);

			const background =
				await axios.get(
					"https://i.imgur.com/VrcriZF.jpg",
					{
						responseType: "arraybuffer"
					}
				);

			fs.writeFileSync(
				bgPath,
				background.data
			);

			const avatar =
				await axios.get(
					`https://graph.facebook.com/${event.senderID}/picture?width=512&height=512`,
					{
						responseType: "arraybuffer"
					}
				);

			fs.writeFileSync(
				avatarPath,
				avatar.data
			);

			const bg = await loadImage(bgPath);
			const avt = await loadImage(avatarPath);

			const canvas =
				createCanvas(
					bg.width,
					bg.height
				);

			const ctx =
				canvas.getContext("2d");

			ctx.drawImage(
				bg,
				0,
				0,
				canvas.width,
				canvas.height
			);

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
				avt,
				17,
				17,
				104,
				104
			);

			ctx.restore();
						let userName = "Facebook User";

			try {
				const info = await api.getUserInfo(event.senderID);

				if (info[event.senderID])
					userName = info[event.senderID].name;
			}
			catch (e) {}

			ctx.fillStyle = "#000000";

			ctx.font = fs.existsSync(FONT_PATH)
				? "bold 32px Cairo"
				: "bold 32px Arial";

			ctx.fillText(
				userName,
				135,
				55
			);

			ctx.fillStyle = "#000000";

			ctx.font = fs.existsSync(FONT_PATH)
				? "42px Cairo"
				: "42px Arial";

			const lines = wrapText(
				ctx,
				text,
				650
			);

			let y = 180;

			for (const line of lines) {
				ctx.fillText(
					line,
					20,
					y
				);

				y += 50;
			}

			fs.writeFileSync(
				outPath,
				canvas.toBuffer("image/png")
			);

			await api.sendMessage(
				{
					attachment: fs.createReadStream(outPath)
				},
				event.threadID,
								() => {

					try {

						if (fs.existsSync(bgPath))
							fs.unlinkSync(bgPath);

						if (fs.existsSync(avatarPath))
							fs.unlinkSync(avatarPath);

						if (fs.existsSync(outPath))
							fs.unlinkSync(outPath);

					}
					catch (e) {
						console.error(e);
					}

				},
				event.messageID
			);

		}
		catch (err) {

			console.error(err);

			return api.sendMessage(
				"❌ | حدث خطأ أثناء إنشاء المنشور.",
				event.threadID,
				event.messageID
			);

		}

	}

};
