const fs = require("fs-extra");
const path = require("path");

const counter = {};

module.exports = {
	config: {
		name: "autosticker",
		version: "1.0",
		author: "ChatGPT",
		category: "events",
		description: "Send sticker every 2 messages"
	},

	onStart: async function ({ api, event, threadsData }) {
		try {
			if (event.type !== "message" || !event.body)
				return;

			if (event.senderID == api.getCurrentUserID())
				return;

			const enable = await threadsData.get(event.threadID, "data.autosticker");

			if (!enable)
				return;

			if (!counter[event.threadID])
				counter[event.threadID] = 0;

			counter[event.threadID]++;

			if (counter[event.threadID] < 2)
				return;

			counter[event.threadID] = 0;

			const folder = path.join(__dirname, "../../assets/stickers");

			if (!fs.existsSync(folder))
				return;

			const stickers = fs.readdirSync(folder).filter(file =>
				file.endsWith(".webp")
			);

			if (stickers.length == 0)
				return;

			const random = stickers[Math.floor(Math.random() * stickers.length)];

			api.sendMessage({
				sticker: fs.createReadStream(path.join(folder, random))
			}, event.threadID);

		} catch (e) {
			console.log(e);
		}
	}
};t 
