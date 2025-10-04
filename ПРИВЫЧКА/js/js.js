// --- ЗАГРУЗКА ПОСЛЕДНЕГО КОНТЕНТА ---
function loadLastContentOnStart() {
    console.log('Проверка последнего загруженного контента...');
    const lastUrl = localStorage.getItem('lastLoadedContent');
    console.log('Найден URL:', lastUrl);

    if (lastUrl && lastUrl !== 'index.html') {
        console.log('Загружаю последний контента:', lastUrl);
        requestAnimationFrame(() => {
            loadContent(lastUrl);
        });
    } else {
        console.log('Нет сохранённого контента или это index.html, остаюсь на главной.');
    }
}

// --- ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ (внутренняя) ---
async function _loadContentInternal(url) {
    const slideScreen = document.getElementById('slideScreen');
    if (!slideScreen) {
        console.error('Элемент slideScreen не найден!');
        return;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка загрузки: ' + response.statusText);
        const html = await response.text();
        setTimeout(() => {
            slideScreen.innerHTML = html;
            // --- СОХРАНЕНИЕ СОСТОЯНИЯ ---
            if (url !== 'index.html') {
                localStorage.setItem('lastLoadedContent', url);
                console.log('Сохранён URL подгруженного контента:', url);
            } else {
                localStorage.removeItem('lastLoadedContent');
                console.log('Удалён URL последнего контента (возврат к главной).');
            }
            // --- ВЫЗОВ ИНИЦИАЛИЗАЦИОННОЙ ФУНКЦИИ ---
            if (url.includes('fiat-tr.html')) {
                if (typeof initFinanceTracker === 'function') initFinanceTracker();
            } else if (url.includes('qutes-tr.html')) {
                if (typeof initQuestsTracker === 'function') initQuestsTracker();
            } else if (url.includes('life-tr.html')) {
                if (typeof initLifeTracker === 'function') initLifeTracker();
            } else if (url.includes('win-tr.html')) {
                if (typeof initWinsTracker === 'function') initWinsTracker();
            }
        }, 150);
    } catch (err) {
        slideScreen.innerHTML = `<p>Ошибка загрузки: ${err.message}</p>`;
        console.error('Ошибка в _loadContentInternal:', err);
    }
}

// --- ЗАГРУЗКА КОНТЕНТА ---
async function loadContent(url) {
    console.log('loadContent вызван с URL:', url);
    await _loadContentInternal(url);
    const slideScreen = document.getElementById('slideScreen');
    const mainScreen = document.getElementById('mainScreen');
    if (slideScreen && mainScreen) {
        slideScreen.classList.add('open');
        mainScreen.classList.add('moving');
        slideScreen.focus();

        history.pushState({ slideOpen: true, url }, '', location.pathname + '#' + url);
    } else {
        console.error('mainScreen или slideScreen не найдены!');
    }
}

// --- ЗАКРЫТИЕ СЛАЙДА ---
function closeSlideScreen() {
    const slideScreen = document.getElementById('slideScreen');
    const mainScreen = document.getElementById('mainScreen');

    if (!slideScreen || !mainScreen) {
        console.error('mainScreen или slideScreen не найдены!');
        return;
    }

    slideScreen.classList.remove('open');
    slideScreen.classList.add('closing');
    mainScreen.classList.remove('moving');

    setTimeout(() => {
        slideScreen.classList.remove('closing');
        slideScreen.innerHTML = '';
    }, 300);

    localStorage.removeItem('lastLoadedContent');

    if (history.state && history.state.slideOpen) {
        if (history.length > 1) {
            history.back();
        } else {
            history.replaceState({ slideOpen: false }, '', location.pathname);
        }
    }
}

// --- ОБНОВЛЕНИЕ ВРЕМЕНИ ---
function updateRealTime() {
    const now = new Date();
    const datePart = now.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const timePart = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const formatted = `${datePart}, ${timePart}`;
    const element = document.getElementById('realTime');
    if (element) element.textContent = formatted;
}

// --- ЗАПУСК ПРИ ЗАГРУЗКЕ ---
document.addEventListener('DOMContentLoaded', () => {
    loadLastContentOnStart();
    updateRealTime();
    setInterval(updateRealTime, 1000);
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateRealTime();
});

// --- СВАЙП ---
let startX = 0;
let isSwiping = false;

document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('touchend', handleTouchEnd, { passive: true });

function handleTouchStart(e) {
    const slideScreen = document.getElementById('slideScreen');
    if (!slideScreen || !slideScreen.classList.contains('open')) return;

    startX = e.touches[0].clientX;
    isSwiping = true;
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;

    if (diffX > 0) {
        const slideScreen = document.getElementById('slideScreen');
        const mainScreen = document.getElementById('mainScreen');
        if (!slideScreen || !mainScreen) return;

        const maxPercent = 1;
        const percent = Math.min(diffX / window.innerWidth, maxPercent);

        // Применяем стиль напрямую (это нормально для отслеживания свайпа)
        slideScreen.style.transform = `translateX(${100 - (percent * 100)}%)`;
        mainScreen.style.transform = `translateX(${-20 * (1 - percent)}%)`;
        mainScreen.style.opacity = 0.9 + (0.1 * percent);
    }
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!isSwiping) return;

    const currentX = e.changedTouches[0].clientX;
    const diffX = currentX - startX; // Положительное значение = свайп вправо

    // Если свайп дальше 5% ширины экрана — автоматически закрываем
    if (diffX > window.innerWidth * 0.1) {
        // Убираем inline-стили и добавляем класс для анимации закрытия
        const slideScreen = document.getElementById('slideScreen');
        const mainScreen = document.getElementById('mainScreen');
        if (slideScreen && mainScreen) {
            slideScreen.style.transform = ''; // Убираем inline-style
            slideScreen.classList.add('closing');
            // --- СРАЗУ ВОЗВРАЩАЕМ mainScreen ---
            mainScreen.classList.remove('moving');
            mainScreen.style.transform = '';
            mainScreen.style.opacity = '';
        }
        // Через 300мс (время анимации) — очищаем слайд и вызываем закрытие
        setTimeout(() => {
            const slideScreen = document.getElementById('slideScreen');
            if (slideScreen) {
                slideScreen.classList.remove('closing');
                slideScreen.innerHTML = ''; // Очищаем контент
                closeSlideScreen(); // Вызываем остальные действия
            }
        }, 300);
    } else {
        // Возвращаем слайд и mainScreen на место
        const slideScreen = document.getElementById('slideScreen');
        const mainScreen = document.getElementById('mainScreen');
        if (slideScreen && mainScreen) {
            slideScreen.style.transform = ''; // Убираем inline-style
            mainScreen.style.transform = '';
            mainScreen.style.opacity = '';
        }
    }

    isSwiping = false;
}

// --- КНОПКА "НАЗАД" ---
window.addEventListener('popstate', (event) => {
    const slideScreen = document.getElementById('slideScreen');
    if (slideScreen && slideScreen.classList.contains('open')) {
        closeSlideScreen();
    }
});