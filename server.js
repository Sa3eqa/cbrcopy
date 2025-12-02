const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API للإحصائيات
let totalCopies = 1247;

app.get('/api/stats', (req, res) => {
    res.json({
        total: totalCopies,
        active: Math.floor(Math.random() * 10),
        today: Math.floor(Math.random() * 50)
    });
});

// API لتسجيل عملية جديدة
app.post('/api/clone', (req, res) => {
    const { token, sourceId, targetId, notes } = req.body;
    
    if (!token || !sourceId || !targetId) {
        return res.status(400).json({ error: 'بيانات ناقصة' });
    }
    
    totalCopies++;
    
    // حفظ في السجل
    const logEntry = {
        timestamp: new Date().toISOString(),
        sourceId,
        targetId,
        notes: notes || '',
        ip: req.ip
    };
    
    fs.appendFileSync('clones.log', JSON.stringify(logEntry) + '\n');
    
    res.json({
        success: true,
        message: 'بدأت عملية النسخ',
        copyId: Date.now(),
        estimatedTime: '5-15 دقيقة'
    });
});

// API لحالة النسخ
app.get('/api/status/:id', (req, res) => {
    const progress = Math.min(100, Math.floor((Date.now() - parseInt(req.params.id)) / 100));
    
    res.json({
        status: progress < 100 ? 'processing' : 'completed',
        progress: progress,
        logs: [
            'بدأت عملية النسخ',
            'جارٍ التحقق من التوكن',
            'جارٍ فحص السيرفرات',
            'جارٍ نسخ المحتويات'
        ].slice(0, Math.floor(progress / 25))
    });
});

// صفحة السجلات (للمسؤول)
app.get('/admin/logs', (req, res) => {
    try {
        if (fs.existsSync('clones.log')) {
            const logs = fs.readFileSync('clones.log', 'utf8')
                .split('\n')
                .filter(line => line.trim())
                .map(line => JSON.parse(line));
            
            res.json(logs.reverse());
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`🚀 CbrCopy يعمل على: http://localhost:${PORT}`);
    console.log(`📊 الإحصائيات: http://localhost:${PORT}/api/stats`);
    console.log(`📝 السجلات: http://localhost:${PORT}/admin/logs`);
});
