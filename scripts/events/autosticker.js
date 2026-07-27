const fs = require("fs");
const path = require("path");

const counter = {};

module.exports = {
  config: {
    name: "autosticker",
    version: "2.0",
    author: "YourName",
    role: 0
  },

  onChat: async ({ event, api }) => {
    if (!event.body) return;
    if (event.senderID == api.getCurrentUserID()) return;

    const threadID = event.threadID;

    counter[threadID] ??= 0;
    counter[threadID]++;

    if (counter[threadID] >= 2) {
      counter[threadID] = 0;

      const folder = path.join(__dirname, "../../assets/stickers");
      const files = fs.readdirSync(folder).filter(f => f.endsWith(".webp"));

      if (!files.length) return;

      const file = files[Math.floor(Math.random() * files.length)];

      api.sendMessage({
        sticker: fs.createReadStream(path.join(folder, file))
      }, threadID);
    }
  }
};
