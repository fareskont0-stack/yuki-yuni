"use strict";

module.exports = {
    config: {
        name: "طلبات",
        aliases: ["req", "requests", "approve"],
        version: "1.0.1",
        author: "Fares Kouachi",
        countDown: 5,
        role: 0,
        description: {
            ar: "قبول وعرض طلبات المراسلة المعلقة للمجموعات والرسائل تلقائياً"
        },
        category: "admin",
        guide: {
            ar: 
                "{pn} عرض → لعرض عدد وأسماء المجموعات في طلبات المراسلة\n" +
                "{pn} قبول → لقبول جميع طلبات المراسلة المعلقة تلقائياً"
        }
    },

    langs: {
        ar: {
            noRequests: "📭 | لا توجد أي طلبات مراسلة معلقة حالياً.",
            fetching: "🔍 | جاري فحص طلبات المراسلة المعلقة، يرجى الانتظار...",
            listHeader: "📋 | **قائمة طلبات المراسلة المعلقة:**\n- العدد الإجمالي: **%1**\n\n",
            approveSuccess: "✅ | تم قبول وفتح جميع طلبات المراسلة المعلقة بنجاح (%1 مجموعة/محادثة).",
            error: "❌ | حدث خطأ أثناء جلب أو قبول طلبات المراسلة: %1"
        }
    },

    onStart: async function ({ api, event, args, message, getLang }) {
        const action = args[0] ? args[0].toLowerCase() : "عرض";

        try {
            await message.reply(getLang("fetching"));

            let pendingRequests = [];
            if (typeof api.getThreadList === "function") {
                const threads = await api.getThreadList(20, null, ["pending", "other"]);
                pendingRequests = threads.filter(thread => thread.isGroup && (thread.folder === "PENDING" || thread.folder === "OTHER"));
            }

            if (!pendingRequests || pendingRequests.length === 0) {
                return message.reply(getLang("noRequests"));
            }

            if (action === "عرض" || action === "list") {
                let msg = getLang("listHeader").replace("%1", pendingRequests.length);
                let count = 1;

                for (const thread of pendingRequests) {
                    msg += `${count++}. **${thread.name || "مجموعة بدون اسم"}** (ID: \`${thread.threadID}\`)\n`;
                }

                return message.reply(msg);
            }

            if (action === "قبول" || action === "accept" || action === "all") {
                let acceptedCount = 0;

                for (const thread of pendingRequests) {
                    try {
                        if (typeof api.handleMessageRequest === "function") {
                            await api.handleMessageRequest(thread.threadID, true);
                        } else {
                            await api.sendMessage("مرحباً، تم قبول طلب الانضمام/المراسلة تلقائياً بواسطة البوت. 🤖", thread.threadID);
                        }
                        acceptedCount++;
                        await new Promise(resolve => setTimeout(resolve, 600));
                    } catch (err) {
                        console.error(`Failed to accept thread ${thread.threadID}:`, err);
                    }
                }

                return message.reply(getLang("approveSuccess").replace("%1", acceptedCount));
            }

        } catch (err) {
            console.error("Requests Command Error:", err);
            return message.reply(getLang("error", err.message));
        }
    }
};
