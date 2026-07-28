module.exports = {
  config: {
    name: "فاك",
    version: "1.0.0",
    author: "Priyansh Rajput",
    role: 2,
    shortDescription: "war spam",
    longDescription: "Send war messages",
    category: "group",
    guide: "{pn}",
    countDown: 10
  },

  onStart: async function ({ api, event }) {
    const send = (msg) => api.sendMessage(msg, event.threadID);

    send("Listen to your father, kids!");

    const messages = [
      [3000, "F*ck your mother"],
      [5000, "You little brats come out to listen to your father curse"],
      [7000, "Quick show the dogs"],
      [9000, "Show your father's soul"],
      [12000, "Do you guys like war so much?"],
      [15000, "Damn you guys too"],
      [17000, "Give your father the age of war"],
      [20000, "Hurry up and curse each other with me"],
      [23000, "Are the bad boys wrinkling their noses up to wage war on your father?"],
      [25000, "I fuck your mother"],
      [28500, "Delicious then yawn your mother up"],
      [31000, "Your father shot you to death by rapping"],
      [36000, "Please age eat me ?"],
      [39000, "If it's delicious, eat your dad"],
      [40000, "Before that, please give me a break for 1 minute"],
      [65000, "Please allow me to start"],
      [70000, "First of all, I would like to fuck you from top to bottom"],
      [75000, "I fuck from cunt hole to pussy cleavage"],
      [80000, "The cunt is as big as a buffalo's cunt masturbating a sewer pipe"],
      [85000, "I'm sure 2 guys like me aren't enough to fill your ass hole"],
      [90000, "I'm tired and don't curse anymore"],
      [95000, "Come on boss update the lyric, let's continue the war"],
      [100000, "Thank you for listening to me war"],
      [105000, "Goodbye and see you in the next program"],
      [115000, "Good bye 🥺"]
    ];

    for (const [time, text] of messages) {
      setTimeout(() => send(text), time);
    }
  }
};
