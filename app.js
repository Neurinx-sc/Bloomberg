// Sidebar Toggle untuk tampilan HP
const mobileMenuBtn = document.getElementById('mobile-menu');
const sidebar = document.getElementById('sidebar');

mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Menutup sidebar jika mengklik area di luar sidebar pada layar HP
document.addEventListener('click', (event) => {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnMenuBtn = mobileMenuBtn.contains(event.target);

    if (!isClickInsideSidebar && !isClickOnMenuBtn && window.innerWidth <= 768) {
        sidebar.classList.remove('active');
    }
});

// Real-time Clock Update (WIB Time format)
function updateClock() {
    const now = new Date();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds} WIB`;
}

// Update jam setiap detik
setInterval(updateClock, 1000);
updateClock(); // Inisialisasi awal
