const axios = require("axios");
const fs = require('fs');
const path = require('path');

const baseApiUrl = async () => {
        const base = await axios.get(`https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json`, { timeout: 10000 });
        // التحقق من أن مصفوفة mahmud موجودة وليست فارغة
        const apis = base.data.mahmud;
        if (Array.isArray(apis) && apis.length > 0) {
                return apis[0];
        }
        return base.data.mahmud; 
};

module.exports = {
        config: {
                name: "يوتيوب",
                aliases: ["ভিডিও", "video"],
                version: "1.9",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        ar: "حمل الفيديوهات من اليوتيوب (بالاسم أو الرابط) بكل حب ودلع جزائري ✨🩵",
                        bn: "ইউটিউব থেকে ভিডিও ডাউনলোড করুন (নাম বা লিঙ্ক দিয়ে)",
                        en: "Download video from YouTube (by name or link)",
                        vi: "Tải video từ YouTube (theo tên hoặc liên kết)"
                },
                category: "media",
                guide: {
                        ar: '   {pn} <الاسم أو الرابط>: عطيني اسم الفيديو ولا الرابط باش نحمله يا عيوني 🥺🍓',
                        bn: '   {pn} <নাম বা লিঙ্ক>: ভিডিও ডাউনলোড করতে নাম বা লিঙ্ক দিন',
                        en: '   {pn} <name or link>: Provide video name or link',
                        vi: '   {pn} <tên hoặc liên kết>: Cung cấp tên hoặc liên kết video'
                }
        },

        langs: {
                ar: {
                        noInput: "× يا عمري، عطيني اسم الفيديو ولا الرابط باش نحمله! 📺🥺",
                        noResult: "× عذراً يا قلبي، ما لقيت حتى نتيجة لهذا البحث.",
                        success: "✅ هاو ليك الفيديو تاعك يا عيوني مريقل 100/100\n\n• 𝐓𝐢𝐭𝐥𝐞: %1",
                        error: "× سامحني يا غالي، الرابط راه ثقيل ولا السيرفر ما ردش عليها.. عاود جرب فيديو واحد اخر!"
                },
                bn: {
                        noInput: "× বেবি, ভিডিওর নাম বা লিঙ্ক তো দাও! 📺",
                        noResult: "× কোনো রেজাল্ট পাওয়া যায়নি۔",
                        success: "✅ 𝙃𝙚𝙧𝙚'𝙨 𝙮𝙤𝙪𝙧 𝙫𝙞𝙙𝙚𝙤 𝙗𝙖𝙗𝙮\n\n• 𝐓𝐢𝐭𝐥𝐞: %1",
                        error: "× সমস্যা হয়েছে!"
                },
                en: {
                        noInput: "× Baby, please provide a video name or link! 📺",
                        noResult: "× No results found.",
                        success: "✅ 𝙃𝙚𝙧𝙚'𝙨 𝙮𝙤𝙪𝙧 𝙫𝙞𝙙𝙚𝙤 𝙗𝙖𝙗𝙮\n\n• 𝐓𝐢𝐭𝐥𝐞: %1",
                        error: "× API error!"
                },
                vi: {
                        noInput: "× Cưng ơi, vui lòng cung cấp tên hoặc liên kết video! 📺",
                        noResult: "× Không tìm thấy kết quả.",
                        success: "✅ Video của cưng đây <😘\n\n• 𝐓Iêu đề: %1",
                        error: "× Lỗi!"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (!args[0]) return message.reply(getLang("noInput"));

                let filePath = null;

                try {
                        await new Promise((resolve) => api.setMessageReaction("⌛", event.messageID, resolve, true));
                        
                        const apiUrl = await baseApiUrl();
                        const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
                        let videoID;

                        if (checkurl.test(args[0])) {
                                videoID = args[0].match(checkurl)[1];
                        } else {
                                const keyWord = args.join(" ");
                                const searchRes = await axios.get(`${apiUrl}/api/video/search?songName=${encodeURIComponent(keyWord)}`, { timeout: 10000 });
                                if (!searchRes.data || (Array.isArray(searchRes.data) && searchRes.data.length === 0)) {
                                        await new Promise((resolve) => api.setMessageReaction("❌", event.messageID, resolve, true));
                                        return message.reply(getLang("noResult"));
                                }
                                videoID = Array.isArray(searchRes.data) ? searchRes.data[0].id : searchRes.data.id;
                        }

                        if (!videoID) {
                                await new Promise((resolve) => api.setMessageReaction("❌", event.messageID, resolve, true));
                                return message.reply(getLang("noResult"));
                        }

                        const cacheDir = path.join(__dirname, "cache");
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                        filePath = path.join(cacheDir, `video_${videoID}_${Date.now()}.mp4`);

                        const res = await axios.get(`${apiUrl}/api/video/download?link=${videoID}&format=mp4`, { timeout: 15000 });
                        const downloadLink = res.data.downloadLink || res.data.url || res.data.link;
                        const title = res.data.title || "فيديو بدون عنوان";

                        if (!downloadLink) {
                                throw new Error("Download link is missing from API response");
                        }

                        const videoBuffer = (await axios.get(downloadLink, { 
                                responseType: "arraybuffer",
                                timeout: 60000 
                        })).data;
                        
                        if (!videoBuffer || videoBuffer.length === 0) {
                                throw new Error("Downloaded video buffer is empty");
                        }

                        fs.writeFileSync(filePath, Buffer.from(videoBuffer));

                        return message.reply({
                                body: getLang("success", title),
                                attachment: fs.createReadStream(filePath)
                        }, async () => {
                                await new Promise((resolve) => api.setMessageReaction("✅", event.messageID, resolve, true));
                                if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        });

                } catch (err) {
                        console.error("Video Download Error:", err.message);
                        if (filePath && fs.existsSync(filePath)) {
                                try { fs.unlinkSync(filePath); } catch(e) {}
                        }
                        await new Promise((resolve) => api.setMessageReaction("❌", event.messageID, resolve, true));
                        return message.reply(getLang("error"));
                }
        }
};
