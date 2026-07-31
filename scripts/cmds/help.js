"use strict";

const fs = require("fs-extra");
const path = require("path");
const https = require("https");

const boldMap = {
  a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲",
  f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷",
  k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼",
  p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁",
  u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆",
  z: "𝘇"
};

const cmdFontMap = {
  ...boldMap,
  "0": "𝟬",
  "1": "𝟭",
  "2": "𝟮",
  "3": "𝟯",
  "4": "𝟰",
  "5": "𝟱",
  "6": "𝟲",
  "7": "𝟳",
  "8": "𝟴",
  "9": "𝟵"
};

function toFont(text) {
  return String(text || "")
    .toLowerCase()
    .split("")
    .map(char => cmdFontMap[char] || char)
    .join("");
}

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

function getAllCommands() {
  const commands = [];

  for (const [name, cmd] of global.GoatBot.commands) {
    if (!cmd || !cmd.config) continue;

    const commandName = String(name).toLowerCase();
    if (commandName === "help") continue;

    commands.push({ name: String(name) });
  }

  return commands.sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" })
  );
}

function createFullMenuMessage(commands, prefix) {
  let msg = "╭┈────────────┈╮\n";
  msg +=   "  ❖ 𝗔𝗟𝗟 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 𝗟𝗜𝗦𝗧 ❖\n";
  msg +=   "╰┈────────────┈╯\n\n";

  for (const command of commands) {
    msg += ` 🟢 ${prefix}${command.name}\n`;
  }

  msg += "\n╭┈────────────┈╮\n";
  msg += ` 👑 𝗗𝗲𝘃: Fares Khenchli\n`;
  msg += ` 📊 𝗧𝗼𝘁𝗮𝗹: ${commands.length} Commands\n`;
  msg += "╰┈────────────┈╯";

  return msg;
}

function createCommandDetail(cmd, prefix) {
  const {
    name, version, author, guide, category,
    longDescription, shortDescription, aliases
  } = cmd.config;

  const desc =
    longDescription?.en || longDescription ||
    shortDescription?.en || shortDescription ||
    "No description available.";

  const usage = String(guide?.en || guide || `{pn}${name}`)
    .replace(/{pn}/g, prefix)
    .replace(/{name}/g, name);

  return (
    "╭┈──────────────┈╮\n" +
    "  🌸 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 🌸\n" +
    "╰┈──────────────┈╯\n\n" +
    `🪷 Name: ${toFont(name)}\n` +
    `🪷 Category: ${toFont(category || "General")}\n` +
    `🪷 Aliases: ${aliases?.length ? aliases.join(", ") : "None"}\n` +
    `🪷 Version: ${version || "1.0"}\n` +
    `🪷 Author: ${author || "Fares Khenchli"}\n\n` +
    `📖 Desc: ${desc}\n` +
    `💡 Usage: ${usage}\n\n` +
    "╭┈──────────────┈╮\n" +
    "  👑 Dev: Fares Khenchli\n" +
    "╰┈──────────────┈╯"
  );
}

async function getHelpGif() {
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const indexFile = path.join(cacheDir, "help_gif_index.json");
  let index = 0;

  if (fs.existsSync(indexFile)) {
    try {
      const savedData = JSON.parse(fs.readFileSync(indexFile, "utf8"));
      index = (Number(savedData.index || 0) + 1) % gifURLs.length;
    } catch {
      index = 0;
    }
  }

  fs.writeFileSync(indexFile, JSON.stringify({ index }));

  const gifPath = path.join(cacheDir, `help_gif_${index}.gif`);
  const needsDownload = !fs.existsSync(gifPath) || fs.statSync(gifPath).size === 0;

  if (needsDownload) {
    await downloadFile(gifURLs[index], gifPath);
  }

  return gifPath;
}

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "9.0",
    author: "Fares Khenchli",
    shortDescription: "Display all available commands",
    longDescription: "Displays the complete command list developed by Fares Khenchli with a rotating GIF.",
    category: "system",
    guide: "{pn}help [command name]"
  },

  onStart: async function ({ message, args, prefix }) {
    const allCommands = global.GoatBot.commands;
    const query = args?.[0] ? String(args[0]).trim() : "";

    let gifPath = null;
    try {
      gifPath = await getHelpGif();
    } catch (error) {
      console.error("HELP GIF ERROR:", error);
    }

    // 1. في حال طلب تفاصيل أمر معين (مثل .help admin)
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

    // 2. عرض جميع الأوامر دفعة واحدة في مكان واحد
    const commands = getAllCommands();
    const menuMessage = createFullMenuMessage(commands, prefix);

    // إرسال النص الكامل أولاً لضمان ظهوره 100%
    await message.reply(menuMessage);

    // إرسال صورة الـ GIF تحته مباشرة
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
