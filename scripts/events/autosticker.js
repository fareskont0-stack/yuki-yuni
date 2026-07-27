const stickers = [
  "1747085322269386"
];

const counter = {};

module.exports = {
	config: {
		name: "autosticker",
		version: "3.0",
		author: "ChatGPT",
		category: "events"
	},

	onChat: async function ({ api, event, threadsData }) {
		try {
			if (!event.body) return;
			if (event.senderID == api.getCurrentUserID()) return;

			const enable = await threadsData.get(event.threadID, "data.autosticker");
			if (!enable) return;

			const needCount = await threadsData.get(event.threadID, "data.autostickerCount") || 2;

			counter[event.threadID] ??= 0;
			counter[event.threadID]++;

			if (counter[event.threadID] < needCount)
				return;

			counter[event.threadID] = 0;

			const random = stickers[Math.floor(Math.random() * stickers.length)];

			api.sendSticker(random, event.threadID);

		}
		catch (e) {
			console.log("[AutoSticker]", e);
		}
	}
};
