const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

// تحميل Xray إذا لم يكن موجوداً
const XRAY_VERSION = '25.1.30';
const XRAY_URL = `https://github.com/XTLS/Xray-core/releases/download/v${XRAY_VERSION}/Xray-linux-64.zip`;

async function setupXray() {
    if (!fs.existsSync('./xray')) {
        console.log('📥 تحميل Xray...');
        
        // تحميل الملف
        const response = await fetch(XRAY_URL);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync('./xray.zip', Buffer.from(buffer));
        
        // فك الضغط
        const AdmZip = require('adm-zip');
        const zip = new AdmZip('./xray.zip');
        zip.extractAllTo('./', true);
        
        // جعل الملف قابل للتنفيذ
        fs.chmodSync('./xray', '755');
        
        // تنظيف
        fs.unlinkSync('./xray.zip');
        
        console.log('✅ تم تحميل Xray بنجاح');
    }
}

// إنشاء صفحة رئيسية بسيطة
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <title>🚀 خادم VLESS على Railway</title>
            <style>
                body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
                pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>✅ خادم VLESS شغال بنجاح!</h1>
            <p>هذا الخادم يستقبل اتصالات VLESS عبر WebSocket.</p>
            
            <h2>📝 معلومات الاتصال:</h2>
            <pre>
عنوان: proxy-production-43c3.up.railway.app
منفذ: 443
UUID: f5c215f6-2c65-4d09-bd53-919bcef1b1b9
بروتوكول: vless
نقل: ws
أمان: none
مسار: /
            </pre>
            
            <h2>🔗 رابط vless للاستيراد المباشر:</h2>
            <pre style="direction: ltr;">
vless://f5c215f6-2c65-4d09-bd53-919bcef1b1b9@proxy-production-43c3.up.railway.app:443?encryption=none&type=ws&path=%2F&host=proxy-production-43c3.up.railway.app#Railway-VLESS
            </pre>
            
            <p>انسخ الرابط أعلاه واستخدمه في v2rayNG أو أي عميل VLESS.</p>
        </body>
        </html>
    `);
});

// تشغيل Xray في الخلفية
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🌐 خادم الويب يعمل على المنفذ ${PORT}`);
    
    await setupXray();
    
    console.log('🚀 تشغيل Xray...');
    
    // تشغيل Xray مع ملف config.json
    const xray = exec('./xray -config config.json');
    
    xray.stdout.on('data', (data) => {
        console.log(`Xray: ${data}`);
    });
    
    xray.stderr.on('data', (data) => {
        console.error(`Xray Error: ${data}`);
    });
    
    xray.on('close', (code) => {
        console.log(`Xray exited with code ${code}`);
    });
    
    console.log('✅ خادم VLESS جاهز للاستقبال!');
});
