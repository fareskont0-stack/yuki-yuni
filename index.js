import { spawn } from "child_process";
import fs from "fs";
import path from "path";

// التحقق من وجود ملف التشغيل الأساسي قبل إقلاعه لعدم حدوث أخطاء
const targetFile = "Hinata.js";
const targetPath = path.join(process.cwd(), targetFile);

if (!fs.existsSync(targetPath)) {
    console.error(`❌ خطأ فادح: لم يتم العثور على الملف الأساسي "${targetFile}" في هذا المجلد.`);
    process.exit(1);
}

function startProject() {
    const child = spawn("node", [targetFile], {
        cwd: process.cwd(),
        stdio: "inherit",
        shell: true
    });

    child.on("close", (code) => {
        if (code === 2) {
            console.log("🔄 إعادة تشغيل المشروع (Auto Restart)...");
            startProject();
        } else if (code !== 0) {
            console.log(`⚠️ توقف البوت الرمز: ${code}، جاري إعادة المحاولة...`);
            setTimeout(startProject, 3000);
        }
    });
}

startProject();
