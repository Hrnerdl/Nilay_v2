// Nöbet verilerini saklamak için bir obje (Tarih: {hours: Saat, friend: İsim, food: YemekListesi})
let shifts = JSON.parse(localStorage.getItem('shifts')) || {};

// Geçerli Takvim Ayını tutar.
let currentMonth = new Date();

// DOM Elementleri
const startSection = document.getElementById('start-section');
const calendarView = document.getElementById('calendar-view');
const calendarEl = document.getElementById('calendar');
const currentMonthYearEl = document.getElementById('current-month-year');
const fullMonthInputModal = document.getElementById('full-month-input-modal');
const fullMonthShiftForm = document.getElementById('full-month-shift-form');
const daysInputList = document.getElementById('days-input-list');
const editModal = document.getElementById('edit-modal');
const summaryContainer = document.getElementById('summary-container'); 

// Ay isimleri (Aynı)
const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                    
// Sabit Nöbet Seçenekleri (Aynı)
const SHIFT_OPTIONS = [
    { value: 0, label: "0 Saat (Boş/İzin)" },
    { value: 8, label: "8 Saat" },
    { value: 16, label: "16 Saat" },
    { value: 24, label: "24 Saat" }
];

// --- Helper Fonksiyonlar (Aynı) ---

const saveShifts = () => {
    localStorage.setItem('shifts', JSON.stringify(shifts));
};

const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

const getShiftColorClass = (hours) => {
    if (hours === 8) return 'shift-8';
    if (hours === 16) return 'shift-16';
    if (hours === 24) return 'shift-24';
    return ''; 
};

const getShiftIcon = (hours) => {
    if (hours === 8) return '☀️'; // Gündüz Nöbeti
    if (hours === 16) return '🌙'; // Akşam Nöbeti
    if (hours === 24) return '✨'; // Uzun Nöbet
    return ''; 
};

// --- Aylık Özet Hesaplama ve Gösterme (Aynı) ---
const calculateMonthlySummary = (year, month) => {
    let totalHours = 0;
    let totalShiftDays = 0;
    let totalFreeDays = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateKey = formatDate(fullDate);
        const shiftData = shifts[dateKey];

        if (shiftData && shiftData.hours > 0) {
            totalHours += shiftData.hours;
            totalShiftDays++;
        } else {
            totalFreeDays++;
        }
    }

    summaryContainer.innerHTML = `
        <div class="summary-item">
            <strong>Toplam Çalışma Saati:</strong> <span>${totalHours} Saat</span>
        </div>
        <div class="summary-item">
            <strong>Toplam Nöbet Günü:</strong> <span>${totalShiftDays} Gün</span>
        </div>
        <div class="summary-item">
            <strong>Toplam İzin/Boş Gün:</strong> <span>${totalFreeDays} Gün</span>
        </div>
    `;
};


// --- Takvim Oluşturma Fonksiyonu (Aynı) ---
// (renderCalendar fonksiyonu bir önceki adımda kart dönme mantığı için zaten güncellenmişti, tekrar aynı mantıkla kullanıldı)
const renderCalendar = (date) => {
    calendarEl.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();

    currentMonthYearEl.textContent = `${monthNames[month]} ${year}`;
    
    calculateMonthlySummary(year, month); 
    
    const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.classList.add('calendar-day-header');
        header.textContent = day;
        calendarEl.appendChild(header);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const startDayIndex = (firstDay === 0) ? 6 : firstDay - 1; 

    for (let i = 0; i < startDayIndex; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('empty-day');
        calendarEl.appendChild(emptyDay);
    }

    // Günleri Oluşturma Döngüsü
    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateKey = formatDate(fullDate);
        const shiftData = shifts[dateKey];
        const hours = shiftData ? shiftData.hours : undefined;
        const friend = shiftData ? shiftData.friend : '';
        const food = shiftData ? shiftData.food : ''; 

        // KART CONTAINER'I
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        dayEl.setAttribute('data-date', dateKey); 

        // KART İÇİ DÖNÜŞ YAPISI
        const cardInner = document.createElement('div');
        cardInner.classList.add('day-card-inner');
        dayEl.appendChild(cardInner);


        // KART ÖN YÜZÜ (Nöbet Bilgisi)
        const cardFront = document.createElement('div');
        cardFront.classList.add('day-card-front');
        cardInner.appendChild(cardFront);

        const dayNumberEl = document.createElement('div');
        dayNumberEl.classList.add('day-number');
        dayNumberEl.textContent = day;
        cardFront.appendChild(dayNumberEl);

        if (hours) { // Nöbet Günü
            dayEl.classList.add('shift-day');
            
            const shiftInfoEl = document.createElement('div');
            shiftInfoEl.classList.add('shift-info');
            
            const colorClass = getShiftColorClass(hours);
            if (colorClass) {
                shiftInfoEl.classList.add(colorClass); 
            }
            
            const icon = getShiftIcon(hours); 
            shiftInfoEl.textContent = `${icon} ${hours} Saat`; 
            cardFront.appendChild(shiftInfoEl);

            if (friend) {
                const friendInfoEl = document.createElement('div');
                friendInfoEl.classList.add('friend-info');
                friendInfoEl.textContent = friend;
                cardFront.appendChild(friendInfoEl);
            }
        } else { // Boş/İzin Günü
            dayEl.classList.add('free-day');
            
            const emojiEl = document.createElement('div');
            emojiEl.textContent = '😊'; 
            emojiEl.classList.add('free-day-emoji');
            cardFront.appendChild(emojiEl);
        }
        
        // KART ARKA YÜZÜ (Yemek Listesi)
        const cardBack = document.createElement('div');
        cardBack.classList.add('day-card-back');
        cardBack.innerHTML =
