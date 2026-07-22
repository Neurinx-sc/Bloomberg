/**
 * Bloomberg Dashboard - Core Application Controller (app.js)
 * Handling: WIB Clock, Sidebar Navigation, Search Filter, & Mobile Toggle
 */

// --- 1. Real-time WIB Clock Manager ---
function updateWIBClock() {
    // Mencari elemen clock di header atau tempat lain
    const clockElements = document.querySelectorAll('.header-clock, #clock, .clock');
    if (!clockElements.length) return;

    const now = new Date();
    
    // Konversi waktu presisi ke WIB (Asia/Jakarta)
    const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const formattedTime = `${formatter.format(now).replace(/\./g, ':')} WIB`;

    clockElements.forEach(el => {
        el.textContent = formattedTime;
    });
}

// --- 2. Sidebar & Header Navigation Handler ---
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar nav a, .sidebar-menu a, .nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Jika link berupa anchor link (#)
            if (href && href.startsWith('#')) {
                e.preventDefault();

                // Update status UI aktif pada tombol menu
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                const targetId = href.substring(1);
                if (!targetId) return;

                // Jika ada halaman/section terpisah (Multi-view)
                if (viewSections.length > 0) {
                    let foundSection = false;
                    viewSections.forEach(section => {
                        if (section.id === targetId) {
                            section.style.display = 'block';
                            foundSection = true;
                        } else {
                            section.style.display = 'none';
                        }
                    });

                    // Resize chart jika kembali ke view utama/dashboard
                    if (targetId === 'dashboard' || targetId === 'markets') {
                        setTimeout(() => {
                            window.dispatchEvent(new Event('resize'));
                        }, 100);
                    }
                }
            }
        });
    });
}

// --- 3. Watchlist Symbol Search Engine ---
function setupSearchBar() {
    const searchInput = document.querySelector('.search-bar input, #search-input, header input[type="text"]');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const watchlistRows = document.querySelectorAll('.watchlist-area table tbody tr');

        watchlistRows.forEach(row => {
            const symbolCell = row.cells[0];
            if (symbolCell) {
                const symbolText = symbolCell.textContent.toLowerCase();
                // Filter baris tabel berdasarkan keyword pencarian
                if (symbolText.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    });
}

// --- 4. Sidebar Responsive Toggle & Chart Auto-Adapt ---
function setupSidebarToggle() {
    const toggleBtn = document.querySelector('#sidebar-toggle, .mobile-menu-btn, .menu-toggle');
    const sidebar = document.querySelector('.sidebar, .sidebar-container');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            sidebar.classList.toggle('active');

            // Trigger event resize agar TradingView Chart menyesuaikan ukuran secara instan
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 300);
        });
    }
}

// --- 5. Application Lifecycle Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Jalankan Jam WIB saat halaman dimuat & perbarui setiap detik
    updateWIBClock();
    setInterval(updateWIBClock, 1000);

    // 2. Inisialisasi komponen interaktif UI
    setupNavigation();
    setupSearchBar();
    setupSidebarToggle();
});
        
