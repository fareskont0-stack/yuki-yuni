const replies = require("./replies.json");

module.exports = {
  config: {
    name: "autoreply",
    version: "1.0.0",
    author: "Fares",
    role: 0,
    countDown: 0,
    category: "chat",
    description: {
      ar: "الردود التلقائية"
    }
  },

  onChat: async function ({ api, event }) {
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
