const replies = require("../data/replies.json");

module.exports = {
  config: {
  name: "autoreply",
  version: "1.0.0",
  author: "Fares",
  role: 0,
  countDown: 0,
  category: "chat",
  noPrefix: true
},
      ar: "الردود التلقائية"
    }
  },

  onChat: async function ({ api, event }) {
    console.log("[AUTOREPLY]", event.body);
    if (!event.body) return;

    const message = event.body.trim().toLowerCase();

    for (const question in replies) {
      if (message === question.toLowerCase()) {
        const answers = replies[question];

        if (!Array.isArray(answers) || answers.length === 0)
          return;

        const random =
          answers[Math.floor(Math.random() * answers.length)];

        return api.sendMessage(
          random,
          event.threadID,
          event.messageID
        );
      }
    }
  }
};
