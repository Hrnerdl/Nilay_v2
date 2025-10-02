// Nöbet verilerini saklamak için bir obje (Tarih: {hours: Saat, friend: İsim})
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
const summaryContainer = document.getElementById('summary-container'); // YENİ: Özet alanı

// Ay isimleri
const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                    
// Sabit Nöbet Seçenekleri (Değişmedi)
const SHIFT_OPTIONS = [
    { value: 0, label: "0 Saat (Boş/İzin)" },
    { value: 8, label: "8 Saat" },
    { value: 16, label: "16 Saat" },
    { value: 24, label: "24 Saat" }
];

// --- Helper Fonksiyonlar ---

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

// --- YENİ: Aylık Özet Hesaplama ve Gösterme ---
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


// --- Takvim Oluşturma Fonksiyonu (GÜNCELLENDİ) ---

const renderCalendar = (date) => {
    calendarEl.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();

    currentMonthYearEl.textContent = `${monthNames[month]} ${year}`;
    
    // AYRICA ÖZETİ HESAPLA VE GÖSTER
    calculateMonthlySummary(year, month); 
    
    const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    //... (Rest of renderCalendar function is mostly the same, ensuring day rendering is correct)
    
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

        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        dayEl.setAttribute('data-date', dateKey); 

        const dayNumberEl = document.createElement('div');
        dayNumberEl.classList.add('day-number');
        dayNumberEl.textContent = day;
        dayEl.appendChild(dayNumberEl);

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
            dayEl.appendChild(shiftInfoEl);

            if (friend) {
                const friendInfoEl = document.createElement('div');
                friendInfoEl.classList.add('friend-info');
                friendInfoEl.textContent = friend;
                dayEl.appendChild(friendInfoEl);
            }
            
            dayEl.addEventListener('click', () => openEditModal(dateKey, hours, friend)); 

        } else { // Boş/İzin Günü
            dayEl.classList.add('free-day');
            
            const emojiEl = document.createElement('div');
            emojiEl.textContent = '😊'; 
            emojiEl.classList.add('free-day-emoji');
            dayEl.appendChild(emojiEl);
            
            dayEl.addEventListener('click', () => openEditModal(dateKey, 0, ''));
        }
        
        calendarEl.appendChild(dayEl);
    }
};

// --- YENİ: Veri Aktarma Fonksiyonları ---

const exportData = () => {
    // Sadece mevcut nöbet verilerini (shifts objesi) dışa aktar
    const dataStr = JSON.stringify(shifts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `nobet-takip-yedek-${new Date().toLocaleDateString('tr-TR')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Nöbet verileri başarıyla indirildi!');
};

const importData = (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedShifts = JSON.parse(e.target.result);
            
            // Veri yapısı kontrolü (Basit bir kontrol)
            if (typeof importedShifts === 'object' && Object.keys(importedShifts).length > 0) {
                shifts = importedShifts;
                saveShifts();
                
                // En son nöbetin olduğu aya git
                const lastDate = Object.keys(shifts).sort().pop();
                if (lastDate) {
                    const [year, month] = lastDate.split('-').map(Number);
                    currentMonth = new Date(year, month - 1, 1);
                }
                
                renderCalendar(currentMonth);
                alert('Nöbet verileri başarıyla yüklendi ve takvim güncellendi!');
                
                // İlk giriş ekranından takvim görünümüne geçişi sağla
                startSection.classList.add('hidden');
                calendarView.classList.remove('hidden');

            } else {
                alert('Yüklenen dosya geçerli bir nöbet verisi (JSON) içermiyor.');
            }
        } catch (error) {
            console.error("Veri yükleme hatası:", error);
            alert('Dosya okunurken bir hata oluştu. Lütfen dosyanın doğru formatta (JSON) olduğundan emin olun.');
        }
    };
    reader.readAsText(file);
};


// --- Olay Dinleyicileri (Güncellendi) ---

// İçe/Dışa Aktarma Dinleyicileri
document.getElementById('export-data-btn').addEventListener('click', exportData);
document.getElementById('import-data-btn').addEventListener('click', () => {
    // Gizli dosya inputunu tetikle
    document.getElementById('import-file-input').click();
});
document.getElementById('import-file-input').addEventListener('change', importData);

// Diğer Olay Dinleyicileri (Değişmedi/Özetle)
document.getElementById('open-input-modal-btn').addEventListener('click', () => {
    openFullMonthInputModal(new Date());
});

document.getElementById('reopen-input-modal-btn').addEventListener('click', () => {
    openFullMonthInputModal(currentMonth);
});

document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar(currentMonth);
});

document.getElementById('next-month').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar(currentMonth);
});

// Modal Kapatma vs. (Aynı)
document.querySelector('.full-month-close-btn').addEventListener('click', () => fullMonthInputModal.style.display = 'none');
//... (edit modal functions and DOMContentLoaded remains mostly the same)
// Tek Gün Düzenleme Modalı ve Form Submit olayları (Değişmedi)

let currentEditingDate = null;  

const openEditModal = (dateKey, hours, friend) => {
    currentEditingDate = dateKey;
    const dateParts = dateKey.split('-');
    const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;  

    document.getElementById('edit-date-display').textContent = `${formattedDate} tarihindeki nöbeti düzenle`;
    
    document.getElementById('edit-hours').value = hours;
    document.getElementById('edit-friend-name').value = friend;

    editModal.style.display = 'block';
};

const closeEditModal = () => {
    editModal.style.display = 'none';
    currentEditingDate = null;
};

// Tek Gün Kaydetme Formu
document.getElementById('edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentEditingDate) return;

    const newHours = parseInt(document.getElementById('edit-hours').value);
    const newFriend = document.getElementById('edit-friend-name').value.trim();
    
    if (newHours > 0) {
        shifts[currentEditingDate] = { hours: newHours, friend: newFriend };
    } else {
        delete shifts[currentEditingDate];
    }

    saveShifts();
    renderCalendar(currentMonth);
    closeEditModal();
});

// Tek Gün Silme Butonu
document.getElementById('delete-shift-btn').addEventListener('click', () => {
    if (!currentEditingDate) return;

    if (confirm(`${currentEditingDate} tarihindeki nöbeti silmek istediğinizden emin misiniz?`)) {
        delete shifts[currentEditingDate];
        saveShifts();
        renderCalendar(currentMonth);
        closeEditModal();
    }
});

// Toplu Giriş Modalındaki Gün Inputlarını Oluşturma (Aynı)
const generateDayInputs = (year, month) => {
    // ... (Your existing generateDayInputs logic here)
    daysInputList.innerHTML = '';
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateKey = formatDate(fullDate);
        const existingShift = shifts[dateKey] || {}; 
        const existingHours = existingShift.hours || 0;
        const existingFriend = existingShift.friend || '';

        const dayInputGroup = document.createElement('div');
        dayInputGroup.classList.add('day-input-group');
        
        const dayName = fullDate.toLocaleDateString('tr-TR', { weekday: 'short' });
        
        let selectHtml = `<select id="hours-${dateKey}" name="hours-${dateKey}">`;
        
        SHIFT_OPTIONS.forEach(option => {
            const selected = (option.value === existingHours) ? 'selected' : '';
            selectHtml += `<option value="${option.value}" ${selected}>${option.label}</option>`;
        });
        
        selectHtml += `</select>`;

        const friendInputHtml = `<input type="text" id="friend-${dateKey}" name="friend-${dateKey}" placeholder="İsim" value="${existingFriend}">`;

        dayInputGroup.innerHTML = `
            <label for="hours-${dateKey}">
                ${day}. ${monthNames[month].substring(0, 3)} (${dayName})
            </label>
            ${selectHtml}
            ${friendInputHtml}
        `;
        daysInputList.appendChild(dayInputGroup);
    }
};

const openFullMonthInputModal = (date) => {
    document.getElementById('default-friend-name').value = '';  

    const year = date.getFullYear();
    const month = date.getMonth();

    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    document.getElementById('input-month').value = monthKey;
    document.getElementById('modal-month-name').textContent = monthNames[month];

    generateDayInputs(year, month);
    fullMonthInputModal.style.display = 'block';
};


// Toplu Giriş Formu Submit Olayı (Aynı)
fullMonthShiftForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const selectedMonth = document.getElementById('input-month').value;
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1;  
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const defaultFriendName = document.getElementById('default-friend-name').value.trim();

    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateKey = formatDate(fullDate);
        
        const hoursSelect = document.getElementById(`hours-${dateKey}`); 
        const friendInput = document.getElementById(`friend-${dateKey}`); 
        
        if (hoursSelect) {
            const hours = parseInt(hoursSelect.value); 
            let friend = friendInput ? friendInput.value.trim() : ''; 
            
            if (hours > 0 && friend === '') {
                friend = defaultFriendName;
            }
            
            if (hours > 0) {
                shifts[dateKey] = { hours: hours, friend: friend };
            } else {
                delete shifts[dateKey];
            }
        }
    }
    
    saveShifts();
    fullMonthInputModal.style.display = 'none';
    
    currentMonth = new Date(year, month, 1);
    renderCalendar(currentMonth);
    
    startSection.classList.add('hidden');
    calendarView.classList.remove('hidden');
});

document.getElementById('input-month').addEventListener('change', (e) => {
    const [year, month] = e.target.value.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    document.getElementById('modal-month-name').textContent = monthNames[month - 1];
    generateDayInputs(date.getFullYear(), date.getMonth());
});

// Modal Kapanışları
document.querySelector('.full-month-close-btn').addEventListener('click', () => fullMonthInputModal.style.display = 'none');
document.querySelector('.edit-close-btn').addEventListener('click', closeEditModal);
window.addEventListener('click', (event) => {
    if (event.target === fullMonthInputModal) {
        fullMonthInputModal.style.display = 'none';
    } else if (event.target === editModal) {
        closeEditModal();
    }
});


// --- Uygulamayı Başlat ---
document.addEventListener('DOMContentLoaded', () => {
    if (Object.keys(shifts).length > 0) {
        const lastDate = Object.keys(shifts).sort().pop();
        if (lastDate) {
            const [year, month] = lastDate.split('-').map(Number);
            currentMonth = new Date(year, month - 1, 1);
        }
        
        startSection.classList.add('hidden');
        calendarView.classList.remove('hidden');
        renderCalendar(currentMonth);
    } else {
        startSection.classList.remove('hidden');
        calendarView.classList.add('hidden');
    }
});
