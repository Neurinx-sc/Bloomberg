// --- Inisialisasi TradingView Lightweight Charts ---
const chartProperties = {
    layout: {
        background: { type: 'solid', color: '#111111' }, // Warna background panel gelap
        textColor: '#888888',
    },
    grid: {
        vertLines: { color: '#222222', style: 1 },
        horzLines: { color: '#222222', style: 1 },
    },
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: { width: 1, color: '#888888', style: 3, labelBackgroundColor: '#222222' },
        horzLine: { width: 1, color: '#888888', style: 3, labelBackgroundColor: '#222222' },
    },
    rightPriceScale: { borderColor: '#222222' },
    timeScale: { borderColor: '#222222', timeVisible: true, secondsVisible: false },
};

// Pasang chart ke dalam elemen HTML
const chartContainer = document.getElementById('tvchart');
const chart = LightweightCharts.createChart(chartContainer, chartProperties);

// Konfigurasi visual Candlestick (Warna Neon/Terminal)
const candleSeries = chart.addCandlestickSeries({
    upColor: '#00ff00',      // Bullish Hijau
    downColor: '#ff3333',    // Bearish Merah
    borderDownColor: '#ff3333',
    borderUpColor: '#00ff00',
    wickDownColor: '#ff3333',
    wickUpColor: '#00ff00',
});

// --- Fungsi Pembuat Data Dummy (Simulasi XAUUSD) ---
function generateDummyData() {
    let data = [];
    let time = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000); 
    let lastClose = 2300.50; // Harga emas kisaran 2300

    for (let i = 0; i < 200; i++) {
        time.setHours(time.getHours() + 4); 
        let open = lastClose;
        let high = open + (Math.random() * 10);
        let low = open - (Math.random() * 10);
        let close = low + (Math.random() * (high - low));
        
        data.push({
            time: time.getTime() / 1000,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2))
        });
        lastClose = close;
    }
    return data;
}

// Masukkan data ke dalam chart
candleSeries.setData(generateDummyData());

// --- Fitur Auto Resize (Responsive) ---
new ResizeObserver(entries => {
    if (entries.length === 0 || entries[0].target !== chartContainer) { return; }
    const newRect = entries[0].contentRect;
    chart.applyOptions({ height: newRect.height, width: newRect.width });
}).observe(chartContainer);

// --- Fitur Fullscreen ---
const fullscreenBtn = document.getElementById('fullscreen-btn');
const chartWrapper = document.getElementById('chart-container-wrapper');

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        chartWrapper.requestFullscreen().catch(err => {
            console.error(`Error fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

// --- Fitur Ganti Timeframe (UI) ---
const tfButtons = document.querySelectorAll('.tf-btn');
tfButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        tfButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        // Regenerasi data agar terlihat chart berubah saat tombol diklik
        candleSeries.setData(generateDummyData());
    });
});
