const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "أغنية",
                aliases: ["sing", "صوت", "غناء"],
                version: "2.1",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        ar: "ابحث عن أي أغنية وحملها بصيغة صوتية يا غالي",
                        bn: "যেকোনো গান সার্চ করে অডিও ফাইল ডাউনলোড করুন",
                        en: "Search and download any song as an audio file",
                        vi: "Tìm kiếm và tải xuống bất kỳ bài hát nào dưới dạng tệp âm thanh"
                },
                category: "music",
                guide: {
                        ar: '   {pn} <اسم الأغنية>: اكتب اسم الأغنية باش تحبطها\n   مثال: {pn} ayman serhani',
                        bn: '   {pn} <গানের নাম>: গান ডাউনলোড করতে নাম লিখুন',
                        en: '   {pn} <song name>: Enter song name to download',
                        vi: '   {pn} <tên bài hát>: Nhập tên bài hát để tải xuống'
                }
        },

        langs: {
                ar: {
                        noInput: "× يا عُمري، اكتب اسم الأغنية والا ما نقدرش نبحث عليها! 🎵\n• مثال: `{pn} cheb mami`",
                        notFound: "× سامحني يا غالي، هذه الأغنية ما لقيتهاش ولا السيرفر ما ردش عليها.. جرب اغنية وحدة اخرى! ⚠️",
                        success: "✅ | ها هي الأغنية تاعك يا غالي مريقلة 100/100 <😘\n• 𝐒𝐨𝐧𝐠: %1",
                        error: "× حدث خطأ في هذا الأمر، يرجى المحاولة لاحقاً."
                },
                bn: {
                        noInput: "× বেবি, গানের নাম তো দাও! 🎵",
                        notFound: "× গানটি পাওয়া যায়নি!",
                        success: "✅ | এই নাও তোমার গান বেবি <😘\n• 𝐒𝐨𝐧𝐠: %1",
                        error: "× সমস্যা হয়েছে!"
                },
                en: {
                        noInput: "× Baby, please provide a song name! 🎵",
                        notFound: "× Song not found or unavailable!",
                        success: "✅ | Here's your requested song baby <😘\n• 𝐒𝐨𝐧𝐠: %1",
                        error: "× API error!"
                },
                vi: {
                        noInput: "× Cưng ơi, vui lòng cung cấp tên bài hát! 🎵",
                        notFound: "× Không tìm thấy bài hát!",
                        success: "✅ | Bài hát của cưng đây <😘\n• 𝐁𝐚̀𝐢 𝐡𝐚́𝐭: %1",
                        error: "× Lỗi!"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const query = args.join(" ");
                if (!query) return message.reply(getLang("noInput"));

                try {
                        await new Promise((resolve) => api.setMessageReaction("⌛", event.messageID, resolve, true));

                        const baseUrl = await mahmud();
                        const apiUrl = `${baseUrl}/api/song/mahmud?query=${encodeURIComponent(query)}`;

                        const response = await axios({
                                method: "GET",
                                url: apiUrl,
                                responseType: "stream",
                                validateStatus: function (status) {
                                        return status >= 200 && status < 300; // التأكد أن السيرفر رد بنجاح
                                }
                        });

                        // التأكد من أن الاستجابة تحتوي على بيانات صالحة وليست فارغة
                        if (!response || !response.data) {
                                await new Promise((resolve) => api.setMessageReaction("❌", event.messageID, resolve, true));
                                return message.reply(getLang("notFound"));
                        }

                        return message.reply({
                                body: getLang("success", query),
                                attachment: response.data
                        }, async () => {
                                await new Promise((resolve) => api.setMessageReaction("🪽", event.messageID, resolve, true));
                        });

                } catch (err) {
                        console.error("Sing Error:", err.message);
                        await new Promise((resolve) => api.setMessageReaction("❌", event.messageID, resolve, true));
                        return message.reply(getLang("notFound"));
                }
        }
};
