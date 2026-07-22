// --- Lightweight Charts Controller (dengan Cache Management) ---
const chartContainer = document.getElementById('tvchart');

const chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth || 300,
    height: 380,
    layout: { background: { type: 'solid', color: '#111111' }, textColor: '#888888' },
    grid: { vertLines: { color: '#222222' }, horzLines: { color: '#222222' } },
    crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
    rightPriceScale: { borderColor: '#222222', autoScale: true },
    timeScale: { borderColor: '#222222', timeVisible: true, secondsVisible: false },
});

let candleSeries = chart.addCandlestickSeries({
    upColor: '#00ff00', downColor: '#ff3333',
    borderDownColor: '#ff3333', borderUpColor: '#00ff00',
    wickDownColor: '#ff3333', wickUpColor: '#00ff00',
});

// GLOBAL STATE MANAGEMENT
window.chartInstance = chart;
window.candleSeriesInstance = candleSeries;
window.tfDataCache = {}; // Memori penyimpan data chart per TF
window.currentGlobalPrice = 2341.50; // HARGA ACUAN UTAMA
window.activeTimeframeLabel = '15M';
window.activeTimeframeSeconds = 900;

function getTFSeconds(tfLabel) {
    switch (tfLabel) {
        case '15M': return 900;
        case '1H': return 3600;
        case '4H': return 14400;
        case '1D': return 86400;
        default: return 900;
    }
}

// Fungsi membuat data HANYA SEKALI per Timeframe
function getOrCreateChartData(tfLabel, tfSeconds) {
    // Jika data sudah ada di memori, panggil ulang (jangan diacak lagi)
    if (window.tfDataCache[tfLabel]) {
        return window.tfDataCache[tfLabel];
    }

    const data = [];
    const nowSeconds = Math.floor(Date.now() / 1000);
    const currentCandleTime = Math.floor(nowSeconds / tfSeconds) * tfSeconds;
    
    let startTime = currentCandleTime - (100 * tfSeconds);
    let lastClose = window.currentGlobalPrice - (Math.random() * 15); // Harga mulai agak di bawah

    for (let i = 0; i < 100; i++) {
        let candleTime = startTime + (i * tfSeconds);
        let open = lastClose;
        let vol = (tfSeconds / 900) * 1.5; 
        let change = (Math.random() - 0.48) * vol;
        let close = open + change;

        // Kunci candle terakhir agar SAMA PERSIS dengan harga live saat ini
        if (i === 99) close = window.currentGlobalPrice;

        let high = Math.max(open, close) + (Math.random() * vol * 0.5);
        let low = Math.min(open, close) - (Math.random() * vol * 0.5);

        data.push({ time: candleTime, open: Number(open.toFixed(2)), high: Number(high.toFixed(2)), low: Number(low.toFixed(2)), close: Number(close.toFixed(2)) });
        lastClose = close;
    }

    // Simpan ke memori Cache
    window.tfDataCache[tfLabel] = data;
    return data;
}

// Fungsi load chart ke layar
function loadChartUI(tfLabel) {
    const tfSeconds = getTFSeconds(tfLabel);
    const data = getOrCreateChartData(tfLabel, tfSeconds);
    
    // Sinkronisasi paksa candle terakhir dengan harga live detik ini
    if (data.length > 0) {
        let lastCandle = data[data.length - 1];
        lastCandle.close = window.currentGlobalPrice;
        lastCandle.high = Math.max(lastCandle.high, window.currentGlobalPrice);
        lastCandle.low = Math.min(lastCandle.low, window.currentGlobalPrice);
    }

    candleSeries.setData(data);
    chart.timeScale().fitContent(); // Rapikan zoom
}

// Inisialisasi awal
loadChartUI('15M');

window.addEventListener('resize', () => {
    if (chartContainer) chart.applyOptions({ width: chartContainer.clientWidth, height: 380 });
});

// Timeframe Switcher (Aman & Stabil)
const tfButtons = document.querySelectorAll('.tf-btn');
tfButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        tfButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        window.activeTimeframeLabel = e.target.textContent.trim();
        window.activeTimeframeSeconds = getTFSeconds(window.activeTimeframeLabel);
        
        loadChartUI(window.activeTimeframeLabel);
    });
});

// Fullscreen
const fullscreenBtn = document.getElementById('fullscreen-btn');
const chartWrapper = document.getElementById('chart-container-wrapper');
if (fullscreenBtn && chartWrapper) {
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) chartWrapper.requestFullscreen?.() || chartWrapper.webkitRequestFullscreen?.();
        else document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    });
}
