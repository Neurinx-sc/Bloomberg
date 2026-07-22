// --- Live Streaming Engine (Sinkronisasi Global) ---

let liveIntervalId = null;

function startLiveStreaming() {
    if (liveIntervalId) clearInterval(liveIntervalId);

    liveIntervalId = setInterval(() => {
        if (!window.candleSeriesInstance || !window.tfDataCache) return;

        // 1. Update Harga Terpusat (Global Price)
        const delta = (Math.random() - 0.49) * 0.30;
        window.currentGlobalPrice = Number((window.currentGlobalPrice + delta).toFixed(2));

        const tfLabel = window.activeTimeframeLabel;
        const tfSeconds = window.activeTimeframeSeconds;
        const nowSeconds = Math.floor(Date.now() / 1000);
        const currentCandleTime = Math.floor(nowSeconds / tfSeconds) * tfSeconds;

        // 2. Ambil data dari Cache TF yang sedang aktif
        let activeDataArray = window.tfDataCache[tfLabel];
        if (!activeDataArray) return;
        
        let lastCandle = activeDataArray[activeDataArray.length - 1];

        // 3. Logika Update Candle (Garis Hijau menempel sempurna)
        if (lastCandle.time !== currentCandleTime) {
            // Jika jamnya sudah ganti, buat candle baru
            const newCandle = {
                time: currentCandleTime,
                open: window.currentGlobalPrice,
                high: window.currentGlobalPrice,
                low: window.currentGlobalPrice,
                close: window.currentGlobalPrice
            };
            activeDataArray.push(newCandle);
            lastCandle = newCandle;
        } else {
            // Update candle yang sedang berjalan
            lastCandle.close = window.currentGlobalPrice;
            lastCandle.high = Math.max(lastCandle.high, window.currentGlobalPrice);
            lastCandle.low = Math.min(lastCandle.low, window.currentGlobalPrice);
        }

        // 4. Render ke layar
        window.candleSeriesInstance.update(lastCandle);

        // 5. Update Watchlist Table
        updateWatchlistPrice('XAUUSD', window.currentGlobalPrice);

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
            changeCell.textContent = (diff >= 0 ? '+' : '') + diff;
            changeCell.className = diff >= 0 ? 'up' : 'down';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(startLiveStreaming, 800);
});
        
