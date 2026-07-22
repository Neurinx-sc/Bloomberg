/**
 * Real-Time Market Chart Engine (chart.js)
 * Powered by TradingView Lightweight Charts & Binance Public API / WebSocket
 */

let chart;
let candlestickSeries;
let wsSocket = null;
let currentSymbol = 'PAXGUSDT'; // PAXG1:1 Emas / XAUUSD
let currentInterval = '15m';

// Mapping interval UI ke format Binance API
const timeframeMap = {
    '15M': '15m',
    '1H': '1h',
    '4H': '4h',
    '1D': '1d'
};

// --- 1. Inisialisasi TradingView Lightweight Chart ---
function initChart() {
    const chartContainer = document.getElementById('chart-container') || document.querySelector('.chart-area');
    if (!chartContainer) return;

    // Bersihkan kontainer jika sudah ada canvas sebelumnya
    chartContainer.innerHTML = '';

    chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight || 380,
        layout: {
            backgroundColor: '#121212',
            textColor: '#d1d4dc',
        },
        grid: {
            vertLines: { color: '#1f2937' },
            horzLines: { color: '#1f2937' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: '#374151',
        },
        timeScale: {
            borderColor: '#374151',
            timeVisible: true,
            secondsVisible: false,
        },
    });

    // Tambahkan seri Candlestick dengan warna khas terminal Bloomberg
    candlestickSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#10b981',
        wickDownColor: '#ef4444',
        wickUpColor: '#10b981',
    });

    // Handle auto-resize chart saat ukuran layar/sidebar berubah
    window.addEventListener('resize', () => {
        if (chart && chartContainer) {
            chart.applyOptions({
                width: chartContainer.clientWidth,
                height: chartContainer.clientHeight || 380
            });
        }
    });

    // Muat data historis pertama kali
    loadMarketData(currentSymbol, currentInterval);
}

// --- 2. Fetch Data Historis (Kline / Candlestick) via REST API ---
async function loadMarketData(symbol, interval) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=200`);
        const data = await response.json();

        // Format data dari Binance ke format Lightweight Charts
        const formattedCandles = data.map(d => ({
            time: Math.floor(d[0] / 1000), // Convert ms ke seconds
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
        }));

        candlestickSeries.setData(formattedCandles);

        // Pasang koneksi WebSocket untuk live streaming
        connectWebSocket(symbol, interval);

    } catch (error) {
        console.error("Gagal mengambil data pasar:", error);
    }
}

// --- 3. Live Streaming Update via WebSocket ---
function connectWebSocket(symbol, interval) {
    // Tutup socket lama jika ada
    if (wsSocket) {
        wsSocket.close();
    }

    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    wsSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`);

    wsSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.e === 'kline') {
            const k = message.k;
            const candle = {
                time: Math.floor(k.t / 1000),
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: parseFloat(k.c),
            };

            // Update candle terakhir secara live di chart
            candlestickSeries.update(candle);

            // Update harga di watchlist / header jika elemen tersedia
            updateHeaderPrice(candle.close);
        }
    };
}

// Helper untuk memperbarui teks harga saat ini di header/watchlist
function updateHeaderPrice(price) {
    const priceElements = document.querySelectorAll('.current-price, .xauusd-price');
    priceElements.forEach(el => {
        el.textContent = price.toFixed(2);
    });
}

// --- 4. Event Listener untuk Tombol Timeframe (15M, 1H, 4H, 1D) ---
function setupTimeframeButtons() {
    const tfButtons = document.querySelectorAll('.timeframe-btn, .tf-btn');
    tfButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tfButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tfText = btn.textContent.trim().toUpperCase();
            if (timeframeMap[tfText]) {
                currentInterval = timeframeMap[tfText];
                loadMarketData(currentSymbol, currentInterval);
            }
        });
    });
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    setupTimeframeButtons();
});
            
