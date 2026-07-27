const counter = {};

const stickers = [
  "1747085322269386"
];

module.exports = {
	config: {
		name: "autosticker",
		version: "1.0",
		author: "ChatGPT",
		role: 0,
		countDown: 0,
		category: "system"
	},

	onChat: async function ({ api, event, threadsData }) {
		try {
			if (!event.body) return;
			if (event.senderID == api.getCurrentUserID()) return;

			const enabled = await threadsData.get(event.threadID, "data.autosticker");
			if (!enabled) return;

			const limit = await threadsData.get(event.threadID, "data.autostickerCount") || 2;

			counter[event.threadID] ??= 0;
			counter[event.threadID]++;

			if (counter[event.threadID] < limit)
				return;

			counter[event.threadID] = 0;

			const stickerID = stickers[Math.floor(Math.random() * stickers.length)];

			console.log("[AutoSticker] Sending:", stickerID);

			api.sendMessage({
				sticker: stickerID
			}, event.threadID);

		}
		catch (err) {
			console.log("[AutoSticker Error]", err);
		}
	}
};
