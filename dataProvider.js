// --- Real-time Data Streaming Engine ---

let currentCandle = null;

function startLiveStreaming() {
    // Ambil candle terakhir dari chart.js
    if (window.lastCandleState) {
        currentCandle = window.lastCandleState;
    }

    setInterval(() => {
        if (!candleSeries) return;

        const intervalSeconds = 900; // 15M
        const nowSeconds = Math.floor(Date.now() / 1000);
        const candleTime = Math.floor(nowSeconds / intervalSeconds) * intervalSeconds;

        // Ambil harga terakhir
        let lastPrice = currentCandle ? currentCandle.close : 2341.50;
        
        // Pergerakan pips acak (+ / -)
        const delta = (Math.random() - 0.49) * 0.35;
        let newPrice = Number((lastPrice + delta).toFixed(2));

        // Jika masuk ke interval candle baru (misal pergantian 15 menit)
        if (!currentCandle || currentCandle.time !== candleTime) {
            currentCandle = {
                time: candleTime,
                open: newPrice,
                high: newPrice,
                low: newPrice,
                close: newPrice
            };
        } else {
            // Update candle yang sedang berjalan
            currentCandle.high = Math.max(currentCandle.high, newPrice);
            currentCandle.low = Math.min(currentCandle.low, newPrice);
            currentCandle.close = newPrice;
        }

        // 1. Update ke Candlestick Chart (Menyambung candle secara seamless)
        candleSeries.update(currentCandle);

        // 2. Update ke Tabel Watchlist
        updateWatchlistPrice('XAUUSD', newPrice);

    }, 1200);
}

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

document.addEventListener('DOMContentLoaded', () => {
    // Beri waktu sebentar agar chart.js selesai membuat data awal
    setTimeout(startLiveStreaming, 500);
});
        
