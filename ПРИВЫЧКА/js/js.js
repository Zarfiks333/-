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




// --- UNIVERSAL DRAG AND DROP FOR PC & MOBILE (IMPROVED) ---

let draggedItem = null;
let startY = 0;
let currentY = 0;
let isDragging = false;
let isTouch = false;

function initDraggableTrackers() {
    const trackerButtons = document.querySelectorAll('main button[data-tracker-id]');

    trackerButtons.forEach(button => {
        // Для ПК (мышь)
        button.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Для мобильных (touch)
        button.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Блокируем клик, если было перетаскивание
        button.addEventListener('click', handleClick, { capture: true });
    });
}

// --- ОБЩАЯ ЛОГИКА ДЛЯ НАХОЖДЕНИЯ ЦЕЛИ ---
function findTargetButton(yPosition) {
    const buttons = Array.from(document.querySelectorAll('main button[data-tracker-id]'));
    let closest = null;
    let minDistance = Infinity;

    buttons.forEach(btn => {
        if (btn === draggedItem) return;

        const rect = btn.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(yPosition - center);

        if (distance < minDistance) {
            minDistance = distance;
            closest = btn;
        }
    });

    return closest;
}

// --- ПК: MOUSE EVENTS ---

function handleMouseDown(e) {
    if (e.button !== 0) return; // Только левая кнопка мыши

    draggedItem = e.target.closest('button[data-tracker-id]');
    if (!draggedItem) return;

    isTouch = false;
    startY = e.clientY;
    currentY = startY;
    isDragging = true;

    // Визуальная подсказка
    draggedItem.classList.add('dragging');
    draggedItem.style.transform = 'scale(1.05)';
    draggedItem.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    draggedItem.style.zIndex = '1000';

    e.preventDefault();
}

function handleMouseMove(e) {
    if (!isDragging || !draggedItem || isTouch) return;

    currentY = e.clientY;
    const deltaY = currentY - startY;

    // Перемещаем элемент "визуально" — только по Y
    draggedItem.style.transform = `translateY(${deltaY}px) scale(1.05)`;

    e.preventDefault();
}

function handleMouseUp(e) {
    if (!isDragging || !draggedItem || isTouch) return;

    isDragging = false;

    // Убираем стили
    draggedItem.classList.remove('dragging');
    draggedItem.style.transform = '';
    draggedItem.style.boxShadow = '';
    draggedItem.style.zIndex = '';

    // Находим целевой элемент для вставки
    const targetButton = findTargetButton(currentY);
    if (targetButton && targetButton !== draggedItem) {
        const rect = targetButton.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        if (currentY < midY) {
            targetButton.before(draggedItem);
        } else {
            targetButton.after(draggedItem);
        }

        saveTrackerOrder();
    }

    e.preventDefault();
}

// --- МОБИЛЬНЫЕ: TOUCH EVENTS ---

function handleTouchStart(e) {
    if (e.touches.length !== 1) return;

    draggedItem = e.target.closest('button[data-tracker-id]');
    if (!draggedItem) return;

    isTouch = true;
    startY = e.touches[0].clientY;
    currentY = startY;
    isDragging = true;

    // Визуальная подсказка
    draggedItem.classList.add('dragging');
    draggedItem.style.transform = 'scale(1.05)';
    draggedItem.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    draggedItem.style.zIndex = '1000';

    e.preventDefault();
}

function handleTouchMove(e) {
    if (!isDragging || !draggedItem) return;

    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    // Перемещаем элемент "визуально"
    draggedItem.style.transform = `translateY(${deltaY}px) scale(1.05)`;
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!isDragging || !draggedItem) return;

    isDragging = false;

    // Убираем стили
    draggedItem.classList.remove('dragging');
    draggedItem.style.transform = '';
    draggedItem.style.boxShadow = '';
    draggedItem.style.zIndex = '';

    // Находим целевой элемент для вставки
    const targetButton = findTargetButton(currentY);
    if (targetButton && targetButton !== draggedItem) {
        const rect = targetButton.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        if (currentY < midY) {
            targetButton.before(draggedItem);
        } else {
            targetButton.after(draggedItem);
        }

        saveTrackerOrder();
    }

    e.preventDefault();
}

// --- БЛОКИРУЕМ КЛИК, ЕСЛИ БЫЛО ПЕРЕТАСКИВАНИЕ ---
function handleClick(e) {
    if (isDragging) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
    }
}

// --- СОХРАНЕНИЕ И ЗАГРУЗКА ПОРЯДКА ТРЕКЕРОВ ---

function saveTrackerOrder() {
    const trackerButtons = Array.from(document.querySelectorAll('main button[data-tracker-id]'));
    const order = trackerButtons.map(btn => btn.dataset.trackerId);
    localStorage.setItem('trackerOrder', JSON.stringify(order));
    console.log('Порядок трекеров сохранён:', order);
}

function loadTrackerOrder() {
    const savedOrder = localStorage.getItem('trackerOrder');
    if (!savedOrder) return;

    try {
        const order = JSON.parse(savedOrder);
        const mainSection = document.querySelector('main');
        const buttons = Array.from(mainSection.querySelectorAll('button[data-tracker-id]'));

        // Создаём карту элементов по ID
        const buttonMap = {};
        buttons.forEach(btn => {
            buttonMap[btn.dataset.trackerId] = btn;
        });

        // Перемещаем элементы в нужном порядке
        order.forEach(id => {
            if (buttonMap[id]) {
                mainSection.appendChild(buttonMap[id]); // Перемещает в конец — так обеспечивается порядок
            }
        });

        console.log('Порядок трекеров восстановлен:', order);
    } catch (e) {
        console.error('Ошибка при загрузке порядка трекеров:', e);
    }
}

// --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ---
document.addEventListener('DOMContentLoaded', () => {
    loadLastContentOnStart();
    updateRealTime();
    setInterval(updateRealTime, 1000);

    // Инициализация универсального драга
    initDraggableTrackers();
    loadTrackerOrder(); // Восстанавливаем сохранённый порядок
});