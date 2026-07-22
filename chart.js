// --- Lightweight Charts Controller ---
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

// Inisialisasi Candlestick Series
let candleSeries = chart.addCandlestickSeries({
    upColor: '#00ff00',
    downColor: '#ff3333',
    borderDownColor: '#ff3333',
    borderUpColor: '#00ff00',
    wickDownColor: '#ff3333',
    wickUpColor: '#00ff00',
});

// Global Variables
window.chartInstance = chart;
window.candleSeriesInstance = candleSeries;
window.activeTimeframeSeconds = 900; // Default 15M (900s)
window.lastCandleObj = null;

// Helper: Konversi Kode TF ke Detik
function getTFSeconds(tfLabel) {
    switch (tfLabel) {
        case '15M': return 900;
        case '1H':  return 3600;
        case '4H':  return 14400;
        case '1D':  return 86400;
        default:    return 900;
    }
}

// Generator Data Historis yang Presisi
function loadChartData(tfSeconds) {
    const data = [];
    const nowSeconds = Math.floor(Date.now() / 1000);
    const currentCandleTime = Math.floor(nowSeconds / tfSeconds) * tfSeconds;
    
    let startTime = currentCandleTime - (100 * tfSeconds);
    let lastClose = 2340.00;

    for (let i = 0; i < 100; i++) {
        let candleTime = startTime + (i * tfSeconds);
        let open = lastClose;
        let change = (Math.random() - 0.48) * (tfSeconds / 300); 
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

    // Simpan candle paling akhir
    window.lastCandleObj = Object.assign({}, data[data.length - 1]);
    candleSeries.setData(data);
    chart.timeScale().fitContent();
}

// Load Awal (Default 15M)
loadChartData(window.activeTimeframeSeconds);

// Auto Resize Screen
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

// Handler Tombol Timeframe (Mencegah Crash)
const tfButtons = document.querySelectorAll('.tf-btn');
tfButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        tfButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const selectedTF = e.target.textContent.trim();
        window.activeTimeframeSeconds = getTFSeconds(selectedTF);

        // Hentikan streaming sejenak, muat data baru, lalu restart streaming
        if (typeof window.restartLiveEngine === 'function') {
            window.restartLiveEngine();
        } else {
            loadChartData(window.activeTimeframeSeconds);
        }
    });
});
                    
