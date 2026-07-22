// --- Inisialisasi TradingView Lightweight Charts ---
const chartContainer = document.getElementById('tvchart');

// 1. Buat Instance Chart
const chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth || 300,
    height: 380,
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

// 2. Tambahkan Seri Candlestick (Dukungan Aman Versi 4 & 5)
let candleSeries;
if (typeof chart.addCandlestickSeries === 'function') {
    candleSeries = chart.addCandlestickSeries({
        upColor: '#00ff00',
        downColor: '#ff3333',
        borderDownColor: '#ff3333',
        borderUpColor: '#00ff00',
        wickDownColor: '#ff3333',
        wickUpColor: '#00ff00',
    });
} else if (LightweightCharts.CandlestickSeries) {
    candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
        upColor: '#00ff00',
        downColor: '#ff3333',
        borderDownColor: '#ff3333',
        borderUpColor: '#00ff00',
        wickDownColor: '#ff3333',
        wickUpColor: '#00ff00',
    });
}

// 3. Generator Data Dummy XAUUSD (UNIX Timestamp dalam Detik)
function generateDummyData() {
    const data = [];
    let nowSeconds = Math.floor(Date.now() / 1000);
    let startTime = nowSeconds - (200 * 14400); // 200 candle
    let lastClose = 2341.50;

    for (let i = 0; i < 200; i++) {
        let candleTime = startTime + (i * 14400);
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

// 4. Render Data ke Chart
if (candleSeries) {
    const candleData = generateDummyData();
    candleSeries.setData(candleData);
    chart.timeScale().fitContent();
}

// 5. Fitur Auto-Resize
window.addEventListener('resize', () => {
    if (chartContainer) {
        chart.applyOptions({
            width: chartContainer.clientWidth,
            height: 380
        });
    }
});

// 6. Event Listener Tombol Fullscreen (⛶)
const fullscreenBtn = document.getElementById('fullscreen-btn');
const chartWrapper = document.getElementById('chart-container-wrapper');

if (fullscreenBtn && chartWrapper) {
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (chartWrapper.requestFullscreen) {
                chartWrapper.requestFullscreen();
            } else if (chartWrapper.webkitRequestFullscreen) {
                chartWrapper.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    });
}

// 7. Event Listener Tombol Timeframe (15M, 1H, 4H, 1D)
const tfButtons = document.querySelectorAll('.tf-btn');
tfButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        tfButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        if (candleSeries) {
            candleSeries.setData(generateDummyData());
            chart.timeScale().fitContent();
        }
    });
});
                
