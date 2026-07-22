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
        autoScale: true, // Memaksa chart selalu auto-fit ke harga terbaru
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

// Global variable agar bisa diakses oleh dataProvider.js
window.lastGeneratedPrice = 2341.50;

function generateDummyData() {
    const data = [];
    let nowSeconds = Math.floor(Date.now() / 1000);
    let startTime = nowSeconds - (100 * 900); // 100 candle M15
    let lastClose = 2335.00; // Mulai dari harga lebih rendah agar mendekati 2341 saat ini

    for (let i = 0; i < 100; i++) {
        let candleTime = startTime + (i * 900);
        let open = lastClose;
        let change = (Math.random() - 0.48) * 1.5; // Volatilitas lebih realistis
        let close = open + change;
        let high = Math.max(open, close) + (Math.random() * 0.8);
        let low = Math.min(open, close) - (Math.random() * 0.8);

        data.push({
            time: candleTime,
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2))
        });
        lastClose = close;
    }
    
    // Simpan harga close terakhir untuk disambung live streaming
    window.lastGeneratedPrice = lastClose;
    return data;
}

if (candleSeries) {
    const candleData = generateDummyData();
    candleSeries.setData(candleData);
    chart.timeScale().fitContent();
}

window.addEventListener('resize', () => {
    if (chartContainer) {
        chart.applyOptions({
            width: chartContainer.clientWidth,
            height: 380
        });
    }
});

// Fullscreen Control
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

// Timeframe Buttons
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
                    
