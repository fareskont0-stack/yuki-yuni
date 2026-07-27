const axios = require("axios");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "أغنية",
                aliases: ["صووت", "صوت", "غناء"],
                version: "3.0",
                author: "MahMUD & Fares",
                countDown: 5,
                role: 0,
                description: {
                        ar: "البحث عن الأغاني وتحميلها بسرعة فائقة وبدون أي انقطاع يا غالي",
                        bn: "দ্রুত গান সার্চ করে ডাউনলোড করুন",
                        en: "Search and download songs ultra-fast without interruptions",
                        vi: "Tìm kiếm và tải xuống bài hát cực nhanh"
                },
                category: "music",
                guide: {
                        ar: '   {pn} <اسم الأغنية>: ابحث وحمل بسرعة البرق\n   مثال: {pn} ayman serhani'
                }
        },

        langs: {
                ar: {
                        noInput: "× يا عُمري، اكتب اسم الأغنية باش نجيبها لك فالسريع! 🎵\n• مثال: `{pn} cheb mami`",
                        notFound: "× عذراً يا غالي، ما قدرت نلقى الأغنية، جرب اسم آخر واضح! ⚠️",
                        success: "✅ | ها هي الأغنية تاعك يا غالي مريقلة وسريعة ⚡\n• 𝐒𝐨𝐧𝐠: %1\n• 🔗 𝐋𝐢𝐧𝐤: %2",
                        error: "× صرا مشكل خفيف في جلب الأغنية، عاود حاول عزيزي."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const query = args.join(" ");
                if (!query) return message.reply(getLang("noInput"));

                let reactionSet = false;
                try {
                        await new Promise((resolve) => api.setMessageReaction("⚡", event.messageID, resolve, true));
                        reactionSet = true;

                        const baseUrl = await mahmud();
                        // نطلب بيانات الأغنية بصيغة سريعة جداً (JSON تحتوي على الرابط الصوتي المباشر)
                        const apiUrl = `${baseUrl}/api/song/mahmud?query=${encodeURIComponent(query)}`;

                        const response = await axios.get(apiUrl, {
                                timeout: 30000 // 30 ثانية كافية جداً لجلب الابط بسرعة
                        });

                        if (!response || !response.data) {
                                if (reactionSet) await new Promise((resolve) => api.setMessageReaction("❌", event.messageID, resolve, true));
                                return message.reply(getLang("notFound"));
                        }

                        // استخراج الرابط المباشر للأغنية من الـ API لتفادي الثقل والبطء
                        const songData = response.data;
                        const audioUrl = songData.downloadUrl || songData.url || songData.audio || (typeof songData === 'string' ? songData : null);

                        if (reactionSet) await new Promise((resolve) => api.setMessageReaction("🎵", event.messageID, resolve, true));

                        // إذا توفر رابط مباشر، نرسله كملف مرفق خفيف أو رابط مباشر سريع الصاروخ
                        if (audioUrl && typeof audioUrl === 'string' && audioUrl.startsWith('http')) {
                                return message.reply({
                                        body: getLang("success", query, audioUrl),
                                        attachment: await global.utils.getStreamFromURL(audioUrl).catch(() => null) || undefined
                                });
                        } else {
                                // حل بديل فائق السرعة في حال كان الـ API يعيد التدفق القديم
                                return message.reply({
                                        body: getLang("success", query, "متاحة بالأسفل"),
                                        attachment: response.data
                                });
                        }

                } catch (err) {
                        console.error("Fast Sing Error:", err.message);
                        if (reactionSet) {
                                try {
                                        await new Promise((resolve) => api.setMessageReaction("❌", event.messageID, resolve, true));
                                } catch (e) {}
                        }
                        return message.reply(getLang("notFound"));
                }
        }
};
