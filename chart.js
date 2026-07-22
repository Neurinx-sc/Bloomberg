// --- Inisialisasi TradingView Lightweight Charts ---
const chartContainer = document.getElementById('tvchart');

// 1. Buat Instance Chart dengan Ukuran Pasti
const chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth || 300,
    height: 360, // Tinggi pasti agar chart tidak kempes
    layout: {
        background: { type: 'solid', color: '#111111' },
        textColor: '#888888',
    },
    grid: {
        vertLines: { color: '#222222' },
        horzLines: { color: '#222222' },
    },
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
    },
    rightPriceScale: {
        borderColor: '#222222',
    },
    timeScale: {
        borderColor: '#222222',
        timeVisible: true,
        secondsVisible: false,
    },
});

// 2. Tambahkan Seri Candlestick (Warna Emas/Terminal)
const candleSeries = chart.addCandlestickSeries({
    upColor: '#00ff00',      // Bullish Hijau Neon
    downColor: '#ff3333',    // Bearish Merah
    borderDownColor: '#ff3333',
    borderUpColor: '#00ff00',
    wickDownColor: '#ff3333',
    wickUpColor: '#00ff00',
});

// 3. Generator Data Dummy XAUUSD (Format Timestamp Bulat/Integer)
function generateDummyData() {
    const data = [];
    let nowSeconds = Math.floor(Date.now() / 1000);
    // Mundur 200 candle (masing-masing 4 jam = 14400 detik)
    let startTime = nowSeconds - (200 * 14400); 
    let lastClose = 2341.50; // Opening price Emas

    for (let i = 0; i < 200; i++) {
        let candleTime = startTime + (i * 14400); // Pasti Integer Bulat!
        let open = lastClose;
        let change = (Math.random() - 0.48) * 6; 
        let close = open + change;
        let high = Math.max(open, close) + (Math.random() * 3);
        let low = Math.min(open, close) - (Math.random() * 3);

        data.push({
            time: candleTime,
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2))
        });
        lastClose = close;
    }
    return data;
}

// 4. Masukkan Data & Auto-Fit ke Layar
const candleData = generateDummyData();
candleSeries.setData(candleData);
chart.timeScale().fitContent(); // Memaksa chart memenuhi area tampilan

// 5. Fitur Auto-Resize saat Ukuran Layar Berubah
window.addEventListener('resize', () => {
    chart.applyOptions({
        width: chartContainer.clientWidth,
        height: 360
    });
});

// 6. Fitur Fullscreen Tombol ⛶
const fullscreenBtn = document.getElementById('fullscreen-btn');
const chartWrapper = document.getElementById('chart-container-wrapper');

if (fullscreenBtn && chartWrapper) {
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            if (chartWrapper.requestFullscreen) {
                chartWrapper.requestFullscreen();
            } else if (chartWrapper.webkitRequestFullscreen) { // Browser HP/Safari
                chartWrapper.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
}

// 7. Tombol Timeframe (15M, 1H, 4H, 1D)
const tfButtons = document.querySelectorAll('.tf-btn');
tfButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        tfButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        candleSeries.setData(generateDummyData());
        chart.timeScale().fitContent();
    });
});
    
