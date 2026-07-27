const axios = require('axios');
const { getStreamFromURL } = global.utils;

module.exports = {
	config: {
		name: "ليفل",
		author: "NTKhang (Modified)",
		version: "1.7",
		cooldowns: 5,
		role: 0,
		description: {
			vi: "tạo avatar anime với chữ ký",
			en: "create anime avatar with signature",
			ar: "إنشاء صورة رمزية (أفاتار) أنمي مع توقيع ونصوص مخصصة"
		},
		category: "image",
		guide: {
			vi: "   {p}{n} <mã số nhân vật hoặc tên nhân vật> | <chữ nền> | <chữ ký> | <tên màu tiếng anh hoặc mã màu nền (hex color)>",
			en: "   {p}{n} <character id or character name> | <background text> | <signature> | <background color name or hex color>",
			ar: "   {p}{n} <رقم الشخصية أو اسمها> | <نص الخلفية> | <التوقيع أو الاسم> | <لون الخلفية بالإنجليزية أو كود Hex (اختياري)>"
				+ "\n   مثال: {p}{n} 1 | Arafat | DEV | red"
		}
	},

	langs: {
		vi: {
			initImage: "Đang khởi tạo hình ảnh, vui lòng chờ đợi...",
			invalidCharacter: "Hiện tại chỉ có %1 nhân vật trên hệ thống, vui lòng nhập id nhân vật nhỏ hơn",
			notFoundCharacter: "Không tìm thấy nhân vật mang tên %1 trong danh sách nhân vật",
			errorGetCharacter: "Đã xảy ra lỗi lấy dữ liệu nhân vật:\n%1: %2",
			success: "✅ Avatar của bạn\nNhân vật: %1\nMã số: %2\nChữ nền: %3\nChữ ký: %4\nMàu: %5",
			defaultColor: "mặc định",
			error: "Đã xảy ra lỗi\n%1: %2"
		},
		en: {
			initImage: "Initializing image, please wait...",
			invalidCharacter: "Currently there are only %1 characters on the system, please enter a character id less than",
			notFoundCharacter: "No character named %1 was found in the character list",
			errorGetCharacter: "An error occurred while getting character data:\n%1: %2",
			success: "✅ Your avatar\nCharacter: %1\nID: %2\nBackground text: %3\nSignature: %4\nColor: %5",
			defaultColor: "default",
			error: "An error occurred\n%1: %2"
		},
		ar: {
			initImage: "🔄 جاري تصميم الصورة وتوليد الأفاتار، يرجى الانتظار...",
			invalidCharacter: "❌ توجد فقط %1 شخصية متاحة في النظام حالياً، يرجى إدخال رقم شخصية أقل.",
			notFoundCharacter: "❌ لم يتم العثور على شخصية باسم \"%1\" في قائمة الشخصيات.",
			errorGetCharacter: "❌ حدث خطأ أثناء جلب بيانات الشخصيات:\n%1: %2",
			success: "✅ **تم إنشاء الأفاتار بنجاح!**\n- **الشخصية:** %1\n- **رقم الـ ID:** %2\n- **نص الخلفية:** %3\n- **التوقيع:** %4\n- **اللون:** %5",
			defaultColor: "افتراضي",
			error: "❌ حدث خطأ أثناء معالجة الصورة\n%1: %2"
		}
	},

	onStart: async function ({ args, message, getLang }) {
		const content = args.join(" ").split("|").map(item => item = item.trim());
		let idNhanVat, tenNhanvat;
		const chu_Nen = content[1];
		const chu_Ky = content[2];
		const colorBg = content[3];
		if (!args[0])
			return message.SyntaxError();
		message.reply(getLang("initImage"));
		try {
			const dataChracter = (await axios.get("https://goatbotserver.onrender.com/taoanhdep/listavataranime?apikey=ntkhang")).data.data;
			if (!isNaN(content[0])) {
				idNhanVat = parseInt(content[0]);
				const totalCharacter = dataChracter.length - 1;
				if (idNhanVat > totalCharacter)
					return message.reply(getLang("invalidCharacter", totalCharacter));
				tenNhanvat = dataChracter[idNhanVat].name;
			}
			else {
				const findChracter = dataChracter.find(item => item.name.toLowerCase() == content[0].toLowerCase());
				if (findChracter) {
					idNhanVat = findChracter.stt;
					tenNhanvat = content[0];
				}
				else
					return message.reply(getLang("notFoundCharacter", content[0]));
			}
		}
		catch (error) {
			const err = error.response?.data || { error: "Error", message: error.message };
			return message.reply(getLang("errorGetCharacter", err.error, err.message));
		}

		const endpoint = `https://goatbotserver.onrender.com/taoanhdep/avataranime`;
		const params = {
			id: idNhanVat,
			chu_Nen,
			chu_Ky,
			apikey: "ntkhangGoatBot"
		};
		if (colorBg)
			params.colorBg = colorBg;

		try {
			const avatarImage = await getStreamFromURL(endpoint, "avatar.png", { params });
			message.reply({
				body: getLang("success", tenNhanvat, idNhanVat, chu_Nen, chu_Ky, colorBg || getLang("defaultColor")),
				attachment: avatarImage
			});
		}
		catch (error) {
			if (error.response?.data) {
				error.response.data.on("data", function (e) {
					const err = JSON.parse(e);
					message.reply(getLang("error", err.error, err.message));
				});
			} else {
				message.reply(getLang("error", "UnknownError", error.message));
			}
		}
	}
};
