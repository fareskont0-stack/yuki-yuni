module.exports.onChat = async ({ api, event }) => {
    try {
        if (event.senderID === api.getCurrentUserID()) return;
        if (event.type === "message_reply") return; // إذا كانت رسالة رد، سيتكفل بها onReply

        const message = event.body?.trim() || "";
        if (!message || message.startsWith(".")) return; // تجاهل الأوامر التي تبدأ بنقطة

        api.setMessageReaction("🇩🇿", event.messageID, () => {}, true);
        api.sendTypingIndicator(event.threadID, true);

        let botResponse = await getOpenAIResponse(message); 
        if (!botResponse) {
            botResponse = "راني معاك يا قلبي، واش راك حاب زيد نحكي؟ 🥺✨";
        }

        api.sendMessage(botResponse, event.threadID, (err, info) => {  
            if (!err) {  
                global.GoatBot.onReply.set(info.messageID, {  
                   commandName: this.config.name,  
                   type: "reply",  
                   messageID: info.messageID,  
                   author: event.senderID,  
                   text: botResponse  
                });  
            }  
        }, event.messageID);  

    } catch (err) {  
        console.error(err);  
    }
};
