const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');

const baseApiUrl = async () => {
        const base = await axios.get(`https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json`, { timeout: 10000 });
        const apis = base.data.mahmud || base.data.ytb;
        if (Array.isArray(apis) && apis.length > 0) return apis[0];
        return typeof apis === 'string' ? apis : base.data.mahmud;
};

module.exports = {
        config: {
                name: "اغنية",
                version: "1.8",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        ar: "تحميل أي أغنية مباشرة من اليوتيوب بكل حب ورومانسية ✨🩵",
                        en: "Download any song directly from YouTube",
                        bn: "যেকোনো গান সরাসরি ডাউনলোড করুন",
                        vi: "Tải bất kỳ bài hát nào trực tiếp từ YouTube"
                },
                category: "music",
                guide: {
                        ar: '   {pn} <اسم الأغنية>\n   مثال: {pn} stay justin bieber 🥺🍓',
                        en: '   {pn} <song name>\n   Example: {pn} stay justin bieber',
                        bn: '   {pn} <গানের নাম>\n   উদাহরণ: {pn} tui chinli na amay',
                        vi: '   {pn} <tên bài hát>\n   Ví dụ: {pn} see you again'
                }
        },

        langs: {
                ar: {
                        error:  "حدث خطأ يا غالي.. عاود المحاولة لاحقاً 🍓",
                        noResult: "⭕ | معليش يا عمري، ما لقيت حتى نتيجة لـ \"%1\" 🥺",
                        noInput: "• يا روحي، عطينا اسم الأغنية باش نقدر نطلعها وتسمعها وتعطيني رايك  🥺🍓",
                        success: "✅ | تفضل يا عيوني هاذي هي الأغنية تاعك: %1 ✨🩵"
                },
                bn: {
                        error: "❌ An error occurred!",
                        noResult: "⭕ | দুঃখিত বেবি, \"%1\" এর জন্য কিছু খুঁজে পাইনি।",
                        noInput: "• Baby, please provide a song name.",
                        success: "✅ | এই নাও তোমার গান: %1"
                },
                en: {
                        error: "❌ An error occurred!",
                        noResult: "⭕ | Sorry baby, I couldn't find anything for \"%1\"",
                        noInput: "• Baby, please provide a song name.",
                        success: "✅ | Here is your song: %1"
                },
                vi: {
                        error: "❌ Đã xảy ra lỗi!",
                        noResult: "⭕ | Xin lỗi bé, không tìm thấy kết quả cho \"%1\"",
                        noInput: "• Baby, please provide a song name.",
                        success: "✅ | Đây là bài hát của bạn: %1"
                }
        },

        onStart: async function ({ api, args, message, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { threadID, messageID } = event;
                const input = args.join(" ");

                if (!input) return api.sendMessage(getLang("noInput"), threadID, messageID);

                let filePath = null;

                try {
                        const apiUrl = await baseApiUrl();
                        await new Promise((resolve) => api.setMessageReaction("⏳", messageID, resolve, true));

                        // البحث عن الأغنية
                        const searchRes = await axios.get(`${apiUrl}/api/ytb/search?q=${encodeURIComponent(input)}`, { timeout: 10000 });
                        const results = searchRes.data.results || searchRes.data;

                        if (!results || results.length === 0) {
                                await new Promise((resolve) => api.setMessageReaction("❌", messageID, resolve, true));
                                return api.sendMessage(getLang("noResult", input), threadID, messageID);
                        }

                        const videoID = results[0].id;
                        const title = results[0].title || "أغنية بدون عنوان";

                        await new Promise((resolve) => api.setMessageReaction("⌛", messageID, resolve, true));

                        // جلب رابط التحميل
                        const downloadRes = await axios.get(`${apiUrl}/api/ytb/get?id=${videoID}&type=audio`, { timeout: 15000 });
                        const downloadLink = downloadRes.data.data?.downloadLink || downloadRes.data.downloadLink || downloadRes.data.url;

                        if (!downloadLink) {
                                throw new Error("Download link missing from API");
                        }

                        // إنشاء مجلد الكاش وتحميل الملف كـ Buffer لضمان الاستقرار
                        const cacheDir = path.join(__dirname, 'cache');
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                        filePath = path.join(cacheDir, `music_${videoID}_${Date.now()}.mp3`);

                        const audioBuffer = (await axios.get(downloadLink, { 
                                responseType: 'arraybuffer',
                                timeout: 60000,
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                        })).data;

                        if (!audioBuffer || audioBuffer.length === 0) {
                                throw new Error("Downloaded audio buffer is empty");
                        }

                        fs.writeFileSync(filePath, Buffer.from(audioBuffer));

                        return api.sendMessage({
                                body: getLang("success", title),
                                attachment: fs.createReadStream(filePath)
                        }, threadID, async (err) => {
                                await new Promise((resolve) => api.setMessageReaction("💟", messageID, resolve, true));
                                if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
                                if (err) console.error("Send Audio Error:", err);
                        }, messageID);

                } catch (e) {
                        console.error("Music Download Error:", e.message);
                        if (filePath && fs.existsSync(filePath)) {
                                try { fs.unlinkSync(filePath); } catch(err) {}
                        }
                        await new Promise((resolve) => api.setMessageReaction("❌", messageID, resolve, true));
                        return api.sendMessage(getLang("error"), threadID, messageID);
                }
        }
};
