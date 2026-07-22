// --- Multi-Asset Live Streaming & Memory Optimization Engine ---

let liveIntervalId = null;

// State harga dasar untuk instrumen Watchlist lainnya
const marketState = {
    XAUUSD: { base: 2335.00, price: 2341.50, decimals: 2, vol: 0.30 },
    DXY:    { base: 104.40,  price: 104.25,  decimals: 2, vol: 0.05 },
    EURUSD: { base: 1.0830,  price: 1.0850,  decimals: 4, vol: 0.0004 },
    GBPUSD: { base: 1.2655,  price: 1.2640,  decimals: 4, vol: 0.0005 }
};

function startLiveStreaming() {
    if (liveIntervalId) clearInterval(liveIntervalId);

    liveIntervalId = setInterval(() => {
        if (!window.candleSeriesInstance || !window.tfDataCache) return;

        // 1. Update Semua Instrumen Pasar di Watchlist
        Object.keys(marketState).forEach(symbol => {
            const item = marketState[symbol];
            const delta = (Math.random() - 0.49) * item.vol;
            item.price = Number((item.price + delta).toFixed(item.decimals));

            // Jika symbol ini adalah XAUUSD, sinkronkan ke chart
            if (symbol === 'XAUUSD') {
                window.currentGlobalPrice = item.price;
            }

            // Update baris tabel watchlist terkait
            updateWatchlistRow(symbol, item.price, item.base, item.decimals);
        });

        // 2. Handling Update Chart Candlestick (XAUUSD)
        const tfLabel = window.activeTimeframeLabel;
        const tfSeconds = window.activeTimeframeSeconds;
        const nowSeconds = Math.floor(Date.now() / 1000);
        const currentCandleTime = Math.floor(nowSeconds / tfSeconds) * tfSeconds;

        let activeDataArray = window.tfDataCache[tfLabel];
        if (!activeDataArray) return;

        // Prevent Memory Leak: Batasi array max 150 items
        if (activeDataArray.length > 150) {
            activeDataArray.shift();
        }

        let lastCandle = activeDataArray[activeDataArray.length - 1];

        if (lastCandle.time !== currentCandleTime) {
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
            lastCandle.close = window.currentGlobalPrice;
            lastCandle.high = Math.max(lastCandle.high, window.currentGlobalPrice);
            lastCandle.low = Math.min(lastCandle.low, window.currentGlobalPrice);
        }

        // Render update ke chart
        window.candleSeriesInstance.update(lastCandle);

    }, 1200);
}

// Helper untuk update UI tabel dengan komparasi numerik aman
function updateWatchlistRow(symbol, newPrice, basePrice, decimals) {
    const tableRows = document.querySelectorAll('.watchlist-area table tbody tr');
    
    tableRows.forEach(row => {
        const symbolCell = row.cells[0];
        if (symbolCell && symbolCell.textContent.trim() === symbol) {
            const priceCell = row.cells[1];
            const changeCell = row.cells[2];
            
            // Komparasi Numerik Murni (Mencegah bug perbandingan string)
            const diffNumeric = newPrice - basePrice;
            const diffText = (diffNumeric >= 0 ? '+' : '') + diffNumeric.toFixed(decimals);
            
            priceCell.textContent = newPrice.toFixed(decimals);
            changeCell.textContent = diffText;
            changeCell.className = diffNumeric >= 0 ? 'up' : 'down';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(startLiveStreaming, 800);
});
                
