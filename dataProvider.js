// --- Robust Live Data Streaming Engine ---

let liveIntervalId = null;

function startLiveStreaming() {
    // Hentikan interval lama jika ada
    if (liveIntervalId) {
        clearInterval(liveIntervalId);
    }

    liveIntervalId = setInterval(() => {
        if (!window.candleSeriesInstance || !window.lastCandleObj) return;

        const tfSeconds = window.activeTimeframeSeconds || 900;
        const nowSeconds = Math.floor(Date.now() / 1000);
        const candleTime = Math.floor(nowSeconds / tfSeconds) * tfSeconds;

        let currentCandle = window.lastCandleObj;
        let lastPrice = currentCandle.close;

        // Simulasi fluktuasi harga kecil (+/- pips)
        const delta = (Math.random() - 0.49) * 0.30;
        let newPrice = Number((lastPrice + delta).toFixed(2));

        // Jika waktu berpindah ke candle baru
        if (currentCandle.time !== candleTime) {
            currentCandle = {
                time: candleTime,
                open: newPrice,
                high: newPrice,
                low: newPrice,
                close: newPrice
            };
        } else {
            // Update candle aktif
            currentCandle.high = Math.max(currentCandle.high, newPrice);
            currentCandle.low = Math.min(currentCandle.low, newPrice);
            currentCandle.close = newPrice;
        }

        // Simpan state terbaru
        window.lastCandleObj = currentCandle;

        // Update ke Chart Tanpa Merusak Skala
        window.candleSeriesInstance.update(currentCandle);

        // Update Watchlist
        updateWatchlistPrice('XAUUSD', newPrice);

    }, 1200);
}

// Fungsi reset jika ganti timeframe
window.restartLiveEngine = function() {
    if (liveIntervalId) clearInterval(liveIntervalId);
    
    // Reset data historis untuk timeframe baru
    if (typeof loadChartData === 'function') {
        loadChartData(window.activeTimeframeSeconds);
    }
    
    // Jalankan kembali streaming
    startLiveStreaming();
};

function updateWatchlistPrice(symbol, newPrice) {
    const tableRows = document.querySelectorAll('.watchlist-area table tbody tr');
    
    tableRows.forEach(row => {
        const symbolCell = row.cells[0];
        if (symbolCell && symbolCell.textContent.trim() === symbol) {
            const priceCell = row.cells[1];
            const changeCell = row.cells[2];
            
            const basePrice = 2335.00;
            const diff = (newPrice - basePrice).toFixed(2);
            
            priceCell.textContent = newPrice.toFixed(2);
            
            if (diff >= 0) {
                changeCell.textContent = `+${diff}`;
                changeCell.className = 'up';
            } else {
                changeCell.textContent = diff;
                changeCell.className = 'down';
            }
        }
    });
}

// Inisialisasi awal saat halaman siap
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(startLiveStreaming, 600);
});
    
