// --- Inisialisasi TradingView Lightweight Charts ---
const chartContainer = document.getElementById('tvchart');

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
        autoScale: true,
    },
    timeScale: {
        borderColor: '#222222',
        timeVisible: true,
        secondsVisible: false,
    },
});

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

// Simpan data state ke window
window.lastCandleState = null;

function generateDummyData() {
    const data = [];
    const intervalSeconds = 900; // Timeframe 15M (900 detik)
    const nowSeconds = Math.floor(Date.now() / 1000);
    
    // Tentukan waktu candle aktif saat ini
    const currentCandleTime = Math.floor(nowSeconds / intervalSeconds) * intervalSeconds;
    
    // Hitung mundur 80 candle dari sekarang
    let startTime = currentCandleTime - (80 * intervalSeconds);
    let lastClose = 2335.00; // Harga awal

    for (let i = 0; i < 80; i++) {
        let candleTime = startTime + (i * intervalSeconds);
        let open = lastClose;
        let change = (Math.random() - 0.48) * 1.2;
        let close = open + change;
        let high = Math.max(open, close) + (Math.random() * 0.6);
        let low = Math.min(open, close) - (Math.random() * 0.6);

        let candleObj = {
            time: candleTime,
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2))
        };

        data.push(candleObj);
        lastClose = close;
    }

    // Simpan candle terakhir agar disambung oleh dataProvider.js secara persis
    window.lastCandleState = Object.assign({}, data[data.length - 1]);
    return data;
}

if (candleSeries) {
    const candleData = generateDummyData();
    candleSeries.setData(candleData);
    chart.timeScale().fitContent();
}

// Auto Resize
window.addEventListener('resize', () => {
    if (chartContainer) {
        chart.applyOptions({
            width: chartContainer.clientWidth,
            height: 380
        });
    }
});

// Fullscreen
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

// Timeframe switcher
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
