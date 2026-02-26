// final-proxy-server.js
const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 8080;
const PROXY_PATH = '/proxy-nodejs:8080';

const server = http.createServer((req, res) => {
    // إضافة CORS للسماح لكل المواقع
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    // معالجة طلبات OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        // استخراج URL الهدف
        const query = url.parse(req.url, true).query;
        const targetUrl = query.url;

        // إذا كان طلب الصفحة الرئيسية
        if (req.url === '/' || req.url === PROXY_PATH) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <title>🚀 بروكسي دحش النهائي</title>
                    <style>
                        body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; background: #f0f2f5; }
                        .card { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        h1 { color: #1da1f2; margin-top: 0; }
                        .url-box { background: #f8f9fa; padding: 15px; border-radius: 8px; direction: ltr; font-family: monospace; }
                        .success { color: green; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>✅ بروكسي دحش شغال 100%</h1>
                        <p class="success">السيرفر يعمل بنجاح على المنفذ ${PORT}</p>
                        
                        <h3>🔗 طريقة الاستخدام:</h3>
                        <div class="url-box">
                            https://abdelilah.wuaze.com${PROXY_PATH}/?url=https://الموقع-المطلوب.com
                        </div>
                        
                        <h3>📊 معلومات الاتصال:</h3>
                        <ul>
                            <li><strong>الوقت:</strong> ${new Date().toLocaleString('ar-EG')}</li>
                            <li><strong>IP:</strong> ${req.socket.remoteAddress}</li>
                            <li><strong>الوكيل:</strong> تويتر ← سيرفر دحش ← الموقع</li>
                        </ul>
                        
                        <h3>🌐 تجربة سريعة:</h3>
                        <ul>
                            <li><a href="${PROXY_PATH}/?url=https://youtube.com" target="_blank">يوتيوب</a></li>
                            <li><a href="${PROXY_PATH}/?url=https://google.com" target="_blank">قوقل</a></li>
                            <li><a href="${PROXY_PATH}/?url=https://github.com" target="_blank">جيت هاب</a></li>
                        </ul>
                    </div>
                </body>
                </html>
            `);
            return;
        }

        // التحقق من وجود URL هدف
        if (!targetUrl) {
            res.writeHead(400);
            res.end('❌ يجب تحديد URL المطلوب ( ?url=https://example.com )');
            return;
        }

        console.log(`\n🌍 ${new Date().toISOString()} - طلب: ${targetUrl}`);

        // تحليل URL الهدف
        const target = new URL(targetUrl);
        
        // خيارات الطلب
        const options = {
            hostname: target.hostname,
            port: target.port || (target.protocol === 'https:' ? 443 : 80),
            path: target.pathname + target.search,
            method: req.method,
            headers: {
                'host': target.hostname,
                'user-agent': req.headers['user-agent'] || 'Mozilla/5.0',
                'accept': req.headers['accept'] || '*/*',
                'accept-language': req.headers['accept-language'] || 'ar,en-US;q=0.9',
                'referer': targetUrl,
                'x-forwarded-for': req.socket.remoteAddress
            }
        };

        // اختيار البروتوكول
        const client = target.protocol === 'https:' ? https : http;

        // إنشاء الطلب
        const proxyReq = client.request(options, (proxyRes) => {
            // تجهيز الرؤوس
            const headers = {
                ...proxyRes.headers,
                'access-control-allow-origin': '*',
                'access-control-allow-methods': 'GET, POST, OPTIONS',
                'access-control-allow-headers': '*'
            };

            res.writeHead(proxyRes.statusCode, headers);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            console.error('❌ خطأ:', err.message);
            res.writeHead(502);
            res.end(`خطأ في الاتصال: ${err.message}`);
        });

        proxyReq.setTimeout(30000, () => {
            proxyReq.destroy();
            res.writeHead(504);
            res.end('انتهت مهلة الاتصال');
        });

        // إرسال البيانات
        req.pipe(proxyReq);

    } catch (err) {
        console.error('❌ خطأ عام:', err);
        res.writeHead(500);
        res.end(`خطأ داخلي: ${err.message}`);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║     ✅ سيرفر دحش النهائي شغال يا حبيب                     ║
╠══════════════════════════════════════════════════════════╣
║  📡 المنفذ: ${PORT}                                               ║
║  🌐 الرابط: https://abdelilah.wuaze.com${PROXY_PATH}            ║
║                                                              ║
║  🔗 مثال مباشر:                                              ║
║  https://abdelilah.wuaze.com${PROXY_PATH}/?url=https://youtube.com ║
║                                                              ║
║  🎯 المسار: تويتر ← سيرفر دحش ← الموقع                        ║
╚══════════════════════════════════════════════════════════╝
    `);
});
