module.exports = {
    config: {
        name: "join",
        version: "3.1",
        author: "Fares Kouachi",
        category: "events",
        description: "تغيير كنية البوت تلقائياً إلى yuki [🍓] بالخط العريض والرد على الشخص الذي أضافه 🌸"
    },

    onStart: async function ({ api, event, usersData }) {
        try {
            if (event.logMessageType === "log:subscribe") {
                const addedParticipants = event.logMessageData.addedParticipants;
                const botID = api.getCurrentUserID();
                const threadID = event.threadID;

                // التحقق هل البوت هو الشخص الذي تم إضافته للمجموعة
                const isBotAdded = addedParticipants.some(user => user.userFbId === botID);

                if (isBotAdded) {
                    // 1. تغيير كنية البوت تلقائياً بالخط العريض والاسم المطلوب
                    const newNickname = "𝘆𝘂𝗸𝗶 [🍓]"; 
                    
                    try {
                        await api.changeNickname(newNickname, threadID, botID);
                    } catch (err) {
                        console.log("[Join Event] Could not change bot nickname due to Facebook limits.");
                    }

                    // 2. البحث عن الشخص الذي أضاف البوت للرد على رسالته (Reply)
                    let adderID = event.author;

                    if (!adderID || adderID === botID) {
                        try {
                            const messages = await api.getThreadHistory(threadID, 10);
                            const addEventMsg = messages.find(msg => 
                                msg.logMessageType === "log:subscribe" && 
                                msg.logMessageData.addedParticipants.some(p => p.userFbId === botID)
                            );
                            if (addEventMsg && addEventMsg.senderID) {
                                adderID = addEventMsg.senderID;
                            }
                        } catch (err) {}
                    }

                    // 3. الرد على الشخص (Reply) بعبارة الشكر
                    const targetMessageID = event.messageID || null;

                    if (adderID && adderID !== botID) {
                        return api.sendMessage({
                            body: `شكرا على اضافتي 🌸`
                        }, threadID, targetMessageID);
                    } else {
                        return api.sendMessage("شكرا على اضافتي 🌸", threadID);
                    }
                }
            }
        } catch (e) {
            console.error("[Join Event Error]:", e);
        }
    }
};
