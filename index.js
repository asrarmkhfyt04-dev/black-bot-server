const axios = require('axios');
const { RSI, BollingerBands } = require('technicalindicators');
const express = require('express');
const app = express();

let currentSignal = "⏳ جاري قراءة حركة الشموع وتحليل السوق...";

// إعداد الواجهة لتعرض النتيجة عند فتح الرابط
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Black Bot Live</title>
                <meta http-equiv="refresh" content="30">
                <style>
                    body { background-color: #000; color: #ffd700; font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; }
                    .container { border: 2px solid #ffd700; padding: 20px; border-radius: 15px; box-shadow: 0 0 20px #ffd700; }
                    h1 { font-size: 24px; }
                    .signal { font-size: 30px; font-weight: bold; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 الروبوت الأسود - التحليل المباشر</h1>
                    <div class="signal">${currentSignal}</div>
                </div>
            </body>
        </html>
    `);
});

async function getLivePrice() {
    try {
        const response = await axios.get('https://min-api.cryptocompare.com/data/v2/histominute?fsym=EUR&tsym=USD&limit=30');
        const prices = response.data.Data.Data.map(d => d.close);

        if (prices.length >= 20) {
            currentSignal = analyze(prices);
            console.log(`📊 تم تحديث التحليل: ${currentSignal}`);
        }
    } catch (error) {
        console.log("⏳ محاولة اتصال جديدة...");
    }
}

function analyze(prices) {
    let rsi = RSI.calculate({ values: prices, period: 14 }).pop();
    let bb = BollingerBands.calculate({ period: 20, values: prices, stdDev: 2 }).pop();
    let lastPrice = prices[prices.length - 1];

    if (rsi < 35 && lastPrice <= bb.lower) {
        return "🔥 إشارة شراء (UP) - فرصة ذهبية!";
    } else if (rsi > 65 && lastPrice >= bb.upper) {
        return "🔥 إشارة بيع (DOWN) - فرصة ذهبية!";
    }
    return "⏳ بانتظار إشارة قوية من الخوارزمية...";
}

// تشغيل السيرفر
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Black Bot is live on port ${port}`);
});

// تحديث السعر كل دقيقة
setInterval(getLivePrice, 60000);
getLivePrice();
