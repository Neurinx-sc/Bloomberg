// --- Global Application Controller ---

function updateWIBClock() {
    const clockElement = document.querySelector('.header-clock, #clock, .clock');
    if (!clockElement) return;

    const now = new Date();
    // Memaksa konversi waktu ke timezone WIB (Asia/Jakarta)
    const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    clockElement.textContent = `${formatter.format(now).replace(/\./g, ':')} WIB`;
}

// Jalankan jam WIB tiap detik
document.addEventListener('DOMContentLoaded', () => {
    updateWIBClock();
    setInterval(updateWIBClock, 1000);
});
