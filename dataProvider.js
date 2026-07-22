// --- Real-time Data Streaming Engine ---

// Simpan referensi candle terakhir dari chart.js
let currentCandle = null;
let lastTickPrice = 2341.50;

// Fungsi untuk memperbarui candle secara live
function startLiveStreaming() {
    // Jalankan pembaruan harga setiap 1.5 detik (1500 ms)
    setInterval(() => {
        if (!candleSeries) return;

        // Generator pergerakan harga acak (Simulasi Volatilitas Pasar Finansial)
        const volatility = 0.40; 
        const delta = (Math.random() - 0.49) * volatility;
        lastTickPrice = Number((lastTickPrice + delta).toFixed(2));

        const nowSeconds = Math.floor(Date.now() / 1000);
        // Pembulatan waktu ke interval 15 menit (900 detik)
        const currentCandleTime = Math.floor(nowSeconds / 900) * 900;

        // Jika candle baru dimulai atau belum ada candle aktif
        if (!currentCandle || currentCandle.time !== currentCandleTime) {
            currentCandle = {
                time: currentCandleTime,
                open: lastTickPrice,
                high: lastTickPrice,
                low: lastTickPrice,
                close: lastTickPrice
            };
        } else {
            // Update candle yang sedang berjalan
            currentCandle.high = Math.max(currentCandle.high, lastTickPrice);
            currentCandle.low = Math.min(currentCandle.low, lastTickPrice);
            currentCandle.close = lastTickPrice;
        }

        // 1. Update Chart Candlestick
        candleSeries.update(currentCandle);

        // 2. Update Table Watchlist (Baris XAUUSD)
        updateWatchlistPrice('XAUUSD', lastTickPrice);

    }, 1500);
}

// Fungsi Helper untuk update harga di Watchlist secara dinamis
function updateWatchlistPrice(symbol, newPrice) {
    const tableRows = document.querySelectorAll('.watchlist-area table tbody tr');
    
    tableRows.forEach(row => {
        const symbolCell = row.cells[0];
        if (symbolCell && symbolCell.textContent.trim() === symbol) {
            const priceCell = row.cells[1];
            const changeCell = row.cells[2];
            
            const oldPrice = parseFloat(priceCell.textContent);
            const diff = (newPrice - 2329.20).toFixed(2); // Menghitung perubahan dari harga acuan hari ini
            
            priceCell.textContent = newPrice.toFixed(2);
            
            if (diff >= 0) {
                changeCell.textContent = `+${diff}`;
                changeCell.className = 'up';
            } else {
                changeCell.textContent = diff;
                changeCell.className = 'down';
            }

            // Efek Flashing/Kedip saat harga berubah
            priceCell.style.color = newPrice >= oldPrice ? '#00ff00' : '#ff3333';
            setTimeout(() => {
                priceCell.style.color = 'var(--text-main)';
            }, 500);
        }
    });
}

// Jalankan Engine Streaming saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Beri jeda kecil agar chart.js selesai inisialisasi lebih dulu
    setTimeout(startLiveStreaming, 1000);
});
