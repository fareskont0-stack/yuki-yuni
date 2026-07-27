const counter = {};

const stickers = [
  "1747085322269386",
  // أضف المزيد هنا
  // "1234567890123456",
  // "9876543210987654"
];

module.exports = {
  config: {
    name: "autosticker",
    version: "2.0",
    author: "ChatGPT",
    category: "events"
  },

  onStart: async function ({ api, event, threadsData }) {
    try {
      if (!event.body) return;
      if (event.senderID == api.getCurrentUserID()) return;

      const enabled = await threadsData.get(event.threadID, "data.autosticker");
      if (!enabled) return;

      counter[event.threadID] ??= 0;
      counter[event.threadID]++;

      if (counter[event.threadID] < 2) return;

      counter[event.threadID] = 0;

      const randomSticker =
        stickers[Math.floor(Math.random() * stickers.length)];

      await api.sendMessage(
        {
          sticker: randomSticker
        },
        event.threadID
      );

    } catch (err) {
      console.log("[AutoSticker]", err);
    }
  }
};
