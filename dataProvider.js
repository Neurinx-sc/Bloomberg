// --- Real-time Data Streaming Engine ---

let currentCandle = null;

function startLiveStreaming() {
    // Mengambil harga penutupan terakhir dari chart.js agar tidak lompat
    let lastTickPrice = window.lastGeneratedPrice || 2341.50;

    setInterval(() => {
        if (!candleSeries) return;

        // Simulasi fluktuasi pergerakan pips Emas yang halus
        const volatility = 0.25; 
        const delta = (Math.random() - 0.49) * volatility;
        lastTickPrice = Number((lastTickPrice + delta).toFixed(2));

        const nowSeconds = Math.floor(Date.now() / 1000);
        const currentCandleTime = Math.floor(nowSeconds / 900) * 900; // Align ke 15M

        if (!currentCandle || currentCandle.time !== currentCandleTime) {
            currentCandle = {
                time: currentCandleTime,
                open: lastTickPrice,
                high: lastTickPrice,
                low: lastTickPrice,
                close: lastTickPrice
            };
        } else {
            currentCandle.high = Math.max(currentCandle.high, lastTickPrice);
            currentCandle.low = Math.min(currentCandle.low, lastTickPrice);
            currentCandle.close = lastTickPrice;
        }

        // Update ke Candlestick Chart
        candleSeries.update(currentCandle);

        // Update ke Tabel Watchlist
        updateWatchlistPrice('XAUUSD', lastTickPrice);

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
    setTimeout(startLiveStreaming, 800);
});
                    
