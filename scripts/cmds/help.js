"use strict";

const fs = require("fs-extra");
const path = require("path");
const https = require("https");

const gifURLs = [
  "https://i.giphy.com/media/ZOGCyj0NW28gg/giphy.gif",
  "https://i.giphy.com/media/98dujYZyq4mOc/giphy.gif",
  "https://i.giphy.com/media/FeVg8ViEczcxG/giphy.gif",
  "https://i.giphy.com/media/8Lc5xmvzRhlLy/giphy.gif",
  "https://i.giphy.com/media/XBuPC4YTAFSta/giphy.gif",
  "https://i.giphy.com/media/1dcLFNKRUKvte/giphy.gif",
  "https://i.giphy.com/media/A5KGHdmmxHdwk/giphy.gif",
  "https://i.giphy.com/media/TbWQoPQOxwBpe/giphy.gif",
  "https://i.imgur.com/xhKItwf.gif",
  "https://media.giphy.com/media/4xKJUTzWPAVoY/giphy.gif",
  "https://media.giphy.com/media/59d1zo8SUSaUU/giphy.gif",
  "https://i.giphy.com/media/4TmxH7ZMn1aYE/giphy.gif",
  "https://i.giphy.com/media/bqSkJ4IwNcoZG/giphy.gif",
  "https://i.giphy.com/media/BS5xpdVyMKniU/giphy.gif",
  "https://i.giphy.com/media/TlDd1mxmPGQo/giphy.gif",
  "https://i.giphy.com/media/mEu08tXUqWI3ms4kDK/giphy.gif",
  "https://i.giphy.com/media/EVju4o7HRs8QquQmYV/giphy.gif",
  "https://i.giphy.com/media/ZE57NgGdXs3pf6uDio/giphy.gif",
  "https://i.giphy.com/media/84VixDW3c3AZ19jcm7/giphy.gif",
  "https://media.giphy.com/media/L0gMC6eeMoDJL0RdRL/giphy.gif",
  "https://i.giphy.com/media/WJKA6tktuSYAKMhz8H/giphy.gif",
  "https://i.giphy.com/media/Sxw1JkqEBZjWvMNZ4X/giphy.gif",
  "https://i.giphy.com/media/2fjJDMP3Q3ZVK0KehW/giphy.gif",
  "https://i.giphy.com/media/1oEUK0kZI4wTGJMeO3/giphy.gif",
  "https://i.giphy.com/media/IHcm76l1rbhlK/giphy.gif",
  "https://i.giphy.com/media/MwtHY03ldRPgc/giphy.gif",
  "https://i.giphy.com/media/ODECD7W3dzk5y/giphy.gif",
  "https://i.giphy.com/media/1ylfuYzjErdKkJsGPi/giphy.gif",
  "https://i.giphy.com/media/FSWQDkuL088TK/giphy.gif",
  "https://i.giphy.com/media/HOmZcACWYNntC/giphy.gif"
];

// تحويل الأحرف اللاتينية والأرقام فقط إلى خط عريض
const cmdFontMap = {
  a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷",
  k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁",
  u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
  A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝",
  K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧",
  U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
  "0": "𝟬", "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰", "5": "𝟱", "6": "𝟲", "7": "𝟳", "8": "𝟴", "9": "𝟵"
};

function toBoldEnglish(text) {
  return String(text)
    .split("")
    .map(char => cmdFontMap[char] || char)
    .join("");
}

function getAllCommands() {
  const commands = [];

  for (const [name, cmd] of global.GoatBot.commands) {
    if (!cmd || !cmd.config) continue;

    const commandName = String(name).toLowerCase();
    if (commandName === "اوامر") continue;

    commands.push(commandName);
  }

  return commands.sort((a, b) => a.localeCompare(b, "ar", { sensitivity: "base" }));
}

function createFullMenuMessage(commands, prefix) {
  const LTR = "\u200e";

  let msg = `${LTR}COMMANDS LIST:\n\n`;

  for (const cmd of commands) {
    const isArabic = /[\u0600-\u06FF]/.test(cmd);

    if (isArabic) {
      msg += `${LTR}${prefix}${cmd} 🌸\n`;
    } else {
      msg += `${LTR}${prefix}${toBoldEnglish(cmd)} 🌸\n`;
    }
  }

  msg += `\n${LTR}Dev: 🚨 𝗙𝗮𝗿𝗲𝘀 𝗞𝗵𝗲𝗻𝗰𝗵𝗹𝗶 🚨`;
  msg += `\n${LTR}Total: ${toBoldEnglish(commands.length)} Commands`;

  return msg;
}

function createCommandDetail(cmd, prefix) {
  const LTR = "\u200e";
  const {
    name, version, author, guide, category,
    longDescription, shortDescription, aliases
  } = cmd.config;

  const desc =
    longDescription?.en || longDescription ||
    shortDescription?.en || shortDescription ||
    "No description";

  const usage = String(guide?.en || guide || `{pn}${name}`)
    .replace(/{pn}/g, prefix)
    .replace(/{name}/g, name);

  return (
    `${LTR}COMMAND INFO:\n\n` +
    `${LTR}Name: ${toBoldEnglish(name)}\n` +
    `${LTR}Category: ${toBoldEnglish(category || "General")}\n` +
    `${LTR}Aliases: ${aliases?.length ? aliases.map(toBoldEnglish).join(", ") : "None"}\n` +
    `${LTR}Version: ${toBoldEnglish(version || "1.0")}\n` +
    `${LTR}Author: ${toBoldEnglish(author || "Fares Khenchli")}\n\n` +
    `${LTR}Desc: ${desc}\n` +
    `${LTR}Usage: ${usage}\n\n` +
    `${LTR}Dev: 🚨 𝗙𝗮𝗿𝗲𝘀 𝗞𝗵𝗲𝗻𝗰𝗵𝗹𝗶 🚨`
  );
}

// دالة خلط مصفوفة عشوائياً (Fisher-Yates Shuffle)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// اختيار GIF عشوائي بدون تكرار حتى تنتهي القائمة
async function getRandomNonRepeatingGif() {
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const queueFile = path.join(cacheDir, "help_gif_queue.json");
  let queue = [];

  // قراءة القائمة المتبقية
  if (fs.existsSync(queueFile)) {
    try {
      queue = JSON.parse(fs.readFileSync(queueFile, "utf8"));
    } catch {
      queue = [];
    }
  }

  // إذا كانت القائمة فارغة أو اكتملت الدورة، يتم إنشاؤها عشوائياً من جديد
  if (!Array.isArray(queue) || queue.length === 0) {
    const indices = Array.from({ length: gifURLs.length }, (_, i) => i);
    queue = shuffleArray(indices);
  }

  // سحب العنصر الأول من القائمة المتبقية
  const selectedIndex = queue.shift();

  // حفظ القائمة المتبقية
  fs.writeFileSync(queueFile, JSON.stringify(queue));

  const gifPath = path.join(cacheDir, `help_gif_${selectedIndex}.gif`);
  const needsDownload = !fs.existsSync(gifPath) || fs.statSync(gifPath).size === 0;

  if (needsDownload) {
    await downloadFile(gifURLs[selectedIndex], gifPath);
  }

  return gifPath;
}

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "16.0",
    author: "Fares Khenchli",
    shortDescription: "Random non-repeating GIF menu",
    longDescription: "Displays clean command list with a random, non-repeating GIF per cycle.",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const query = args?.[0] ? String(args[0]).trim() : "";

    let gifPath = null;
    try {
      gifPath = await getRandomNonRepeatingGif();
    } catch (error) {
      console.error("HELP GIF ERROR:", error);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      const cmd = allCommands.get(lowerQuery) ||
        [...allCommands.values()].find(command =>
          (command.config?.aliases || []).some(alias => String(alias).toLowerCase() === lowerQuery)
        );

      if (!cmd || !cmd.config) {
        return message.reply(`❌ Command "${query}" not found.`);
      }

      const detailMsg = createCommandDetail(cmd, prefix);

      await message.reply(detailMsg);

      if (gifPath && fs.existsSync(gifPath)) {
        return message.reply({ attachment: fs.createReadStream(gifPath) });
      }
      return;
    }

    const commands = getAllCommands();
    const menuMessage = createFullMenuMessage(commands, prefix);

    await message.reply(menuMessage);

    if (gifPath && fs.existsSync(gifPath)) {
      return message.reply({ attachment: fs.createReadStream(gifPath) });
    }
  }
};

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    const request = https.get(url, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlink(destination, () => {});
        return downloadFile(response.headers.location, destination).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destination, () => {});
        return reject(new Error(`Failed to download GIF (${response.statusCode})`));
      }

      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    });

    request.on("error", error => {
      file.close();
      fs.unlink(destination, () => {});
      reject(error);
    });

    file.on("error", error => {
      file.close();
      fs.unlink(destination, () => {});
      reject(error);
    });
  });
}
