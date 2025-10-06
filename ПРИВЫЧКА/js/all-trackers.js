// --- ИНИЦИАЛИЗАЦИОННАЯ ФУНКЦИЯ ДЛЯ ТРЕКЕРА ПОБЕД ---
function initWinsTracker() {
    console.log('initWinsTracker вызван'); // Для отладки
    // document.addEventListener('DOMContentLoaded', () => { // УБРАТЬ!
        const addBtn = document.querySelector('.add-tr');
        const modalOverlay = document.getElementById('modalOverlay');
        const victoryText = document.getElementById('victoryText');
        const victoryDate = document.getElementById('victoryDate');
        const cancelBtn = document.getElementById('cancelBtn');
        const addBtnModal = document.getElementById('addBtn');
        const blockTr = document.getElementById('victoriesContainer'); // Обновлено
        const toast = document.getElementById('toast');
        const editModal = document.getElementById('editModal');
        const editVictoryText = document.getElementById('editVictoryText');
        const editVictoryDate = document.getElementById('editVictoryDate');
        const editCancelBtn = document.getElementById('editCancelBtn');
        const editSaveBtn = document.getElementById('editSaveBtn');
        const deleteBtn = document.getElementById('deleteBtn');

        let currentEditEntry = null; // Для хранения редактируемой записи

        // ✅ Функция показа уведомления
        function showToast(message, type = 'error') {
            toast.textContent = message;
            toast.className = 'toast ' + type; // устанавливаем класс: 'toast error' или 'toast success'
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }

        // ✅ Функция сохранения побед
        function saveToStorage() {
            const entries = document.querySelectorAll('.win-entry');
            const victories = Array.from(entries).map(entry => {
                // Извлекаем только текст, исключая дату
                const fullText = entry.textContent;
                const datePart = entry.getAttribute('data-date');
                const displayDate = new Date(datePart).toLocaleDateString('ru-RU');
                const text = fullText.replace(displayDate + ' — ', '').trim();
                return { date: datePart, text };
            });
            localStorage.setItem('victories', JSON.stringify(victories));
        }

        // ✅ Функция загрузки побед
        function loadFromStorage() {
            const saved = localStorage.getItem('victories');
            if (!saved) return;

            const victories = JSON.parse(saved);
            victories.forEach(v => {
                createVictoryEntry(v.text, v.date, true); // true = при инициализации
            });
        }

        // ✅ Функция создания записи
        function createVictoryEntry(text, date, isInitialRender = false) {
            const entry = document.createElement('div');
            entry.className = 'win-entry';
            
            // Добавляем анимацию только при добавлении новой записи (не при инициализации)
            if (!isInitialRender) {
                entry.classList.add('animate__entry');
            }
            
            // Форматируем дату для отображения
            const displayDate = new Date(date).toLocaleDateString('ru-RU');
            
            entry.setAttribute('data-date', date);
            entry.textContent = `${displayDate} — ${text}`;

            // Добавляем обработчик клика для редактирования
            entry.addEventListener('click', () => {
                // Извлекаем текст (без даты) - используем только текст после " — "
                const fullText = entry.textContent;
                const displayDate = new Date(date).toLocaleDateString('ru-RU');
                const textWithoutDate = fullText.replace(displayDate + ' — ', '').trim();
                
                // Заполняем модальное окно
                editVictoryText.value = textWithoutDate; // Только текст без даты
                editVictoryDate.value = date; // Сохраняем в формате YYYY-MM-DD
                
                // Сохраняем ссылку на редактируемую запись
                currentEditEntry = entry;
                
                // Показываем модальное окно
                editModal.style.display = 'flex';
            });

            blockTr.appendChild(entry);
        }

        // ✅ Открыть модальное окно добавления
        addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modalOverlay.style.display = 'flex';
            const today = new Date().toISOString().split('T')[0];
            victoryDate.value = today;
            victoryText.value = ''; // Очищаем текст при открытии
            victoryText.focus();
        });

        // ✅ Закрыть модальное окно добавления
        cancelBtn.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });

        // ✅ Закрыть при клике вне окна добавления
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.style.display = 'none';
            }
        });

        // ✅ Закрыть модальное окно редактирования
        editCancelBtn.addEventListener('click', () => {
            editModal.style.display = 'none';
            currentEditEntry = null;
        });

        // ✅ Закрыть при клике вне окна редактирования
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                editModal.style.display = 'none';
                currentEditEntry = null;
            }
        });

        // ✅ Добавить победу
        addBtnModal.addEventListener('click', () => {
            const text = victoryText.value.trim();
            const date = victoryDate.value;

            if (!text) {
                showToast('Пожалуйста, введите текст', 'error');
                return;
            }

            // ✅ Создаём запись
            createVictoryEntry(text, date);

            // ✅ Сохраняем
            saveToStorage();

            // ✅ ✅ ✅ УСПЕХ! ПОКАЗЫВАЕМ ТЕПЛОЕ УВЕДОМЛЕНИЕ
            showToast('Вы успешно добавили новое достижение! Молодец!', 'success');

            // ✅ Закрываем и очищаем
            modalOverlay.style.display = 'none';
            victoryText.value = ''; // Очищаем текст после сохранения
            victoryDate.value = new Date().toISOString().split('T')[0]; // Устанавливаем сегодняшнюю дату
        });

        // ✅ Сохранить изменения
        editSaveBtn.addEventListener('click', () => {
            const text = editVictoryText.value.trim();
            const date = editVictoryDate.value;

            if (!text) {
                showToast('Пожалуйста, введите текст', 'error');
                return;
            }

            // ✅ Используем дату из input, если она была изменена, иначе сохраняем старую
            const currentDate = currentEditEntry.getAttribute('data-date');
            const finalDate = date || currentDate;
            
            // ✅ Форматируем дату для отображения
            const displayDate = new Date(finalDate).toLocaleDateString('ru-RU');

            // ✅ Обновляем запись
            currentEditEntry.textContent = `${displayDate} — ${text}`;
            currentEditEntry.setAttribute('data-date', finalDate);

            // ✅ Сохраняем
            saveToStorage();

            // ✅ ✅ ✅ УСПЕХ! ПОКАЗЫВАЕМ ТЕПЛОЕ УВЕДОМЛЕНИЕ
            showToast('Победа успешно отредактирована!', 'success');

            // ✅ Закрываем и очищаем
            editModal.style.display = 'none';
            currentEditEntry = null;
        });

        // ✅ Удалить запись
        deleteBtn.addEventListener('click', () => {
            if (currentEditEntry) {
                // ✅ Подтверждение удаления
                if (confirm('Вы уверены, что хотите удалить эту победу?')) {
                    // ✅ Удаляем запись
                    currentEditEntry.remove();
                    
                    // ✅ Сохраняем
                    saveToStorage();
                    
                    // ✅ ✅ ✅ УСПЕХ! ПОКАЗЫВАЕМ ТЕПЛОЕ УВЕДОМЛЕНИЕ
                    showToast('Победа успешно удалена!', 'success');
                    
                    // ✅ Закрываем модальное окно
                    editModal.style.display = 'none';
                    currentEditEntry = null;
                }
            }
        });

        // ✅ Загружаем победы при старте
        loadFromStorage();
    // }); // УБРАТЬ!
} // ЗАКРЫВАЕТСЯ ФУНКЦИЯ initWinsTracker


// --- ИНИЦИАЛИЗАЦИОННАЯ ФУНКЦИЯ ДЛЯ ТРЕКЕРА ЖИЗНИ ---
function initLifeTracker() {
    console.log('initLifeTracker вызван'); // Для отладки
    const birthDateInput = document.getElementById('birthDate');
    const saveBtn = document.getElementById('saveBtn');
    const lifeTrackerDiv = document.getElementById('lifeTracker');
    const infoDiv = document.getElementById('info');

    if (!birthDateInput || !saveBtn || !lifeTrackerDiv || !infoDiv) {
        console.error('Элементы трекера жизни не найдены в DOM');
        return;
    }

    const MAX_YEARS = 90;
    const WEEKS_IN_YEAR = 365.25 / 7; // ~52.1786

    // Установим max для выбора даты — сегодня
    birthDateInput.max = new Date().toISOString().split('T')[0];

    // Загрузка даты рождения из localStorage
    function loadSavedDate() {
        const saved = localStorage.getItem('birthDate');
        if (saved) {
            birthDateInput.value = saved;
            drawTracker(saved);
        }
    }

    // Сохранить дату и показать трекер
    function saveDate() {
        const val = birthDateInput.value;
        if (!val) {
            alert('Пожалуйста, выберите дату рождения');
            return;
        }
        const birthDate = new Date(val);
        const today = new Date();
        if (birthDate > today) {
            alert('Дата рождения не может быть в будущем');
            return;
        }
        localStorage.setItem('birthDate', val);
        drawTracker(val);
    }

    // Вычисление количества полных недель между двумя датами
    function weeksBetween(date1, date2) {
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        return Math.floor((date2 - date1) / msPerWeek);
    }

    function drawTracker(birthDateString) {
        lifeTrackerDiv.innerHTML = '';
        infoDiv.innerHTML = '';

        const birthDate = new Date(birthDateString);
        const today = new Date();
        const totalWeeks = Math.floor(MAX_YEARS * WEEKS_IN_YEAR);
        let livedWeeks = weeksBetween(birthDate, today);

        if (livedWeeks < 0) {
            infoDiv.textContent = 'Дата рождения не может быть в будущем';
            return;
        }
        if (livedWeeks > totalWeeks) {
            infoDiv.textContent = `Вам больше ${MAX_YEARS} лет! Мы считаем максимум как ${MAX_YEARS} лет.`;
            livedWeeks = totalWeeks;
        } else {
            infoDiv.innerHTML = `
                <p>Вы прожили примерно <b>${livedWeeks}</b> недель.</p>
                <p>Осталось примерно <b>${Math.max(0, totalWeeks - livedWeeks)}</b> недель до ${MAX_YEARS} лет.</p>
            `;
        }

        let leftWeeks = totalWeeks - livedWeeks;
        if (leftWeeks < 0) leftWeeks = 0;

        // Ограничение квадратов для рендеринга для производительности (~900)
        const maxSquares = 900;
        let totalSquares = livedWeeks + leftWeeks;

        if (totalSquares > maxSquares) {
            const scale = maxSquares / totalSquares;
            livedWeeks = Math.round(livedWeeks * scale);
            leftWeeks = Math.round(leftWeeks * scale);
        }

        for (let i = 0; i < livedWeeks; i++) {
            const sq = document.createElement('div');
            sq.classList.add('square', 'lived');
            lifeTrackerDiv.appendChild(sq);
        }
        for (let i = 0; i < leftWeeks; i++) {
            const sq = document.createElement('div');
            sq.classList.add('square', 'left');
            lifeTrackerDiv.appendChild(sq);
        }
    }

    saveBtn.addEventListener('click', saveDate);

    loadSavedDate();
} // ЗАКРЫВАЕТСЯ ФУНКЦИЯ initLifeTracker


// --- ИНИЦИАЛИЗАЦИОННАЯ ФУНКЦИЯ ДЛЯ ТРЕКЕРА ЗАДАЧ ---
function initQuestsTracker() {
    console.log('initQuestsTracker вызван'); // Для отладки
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');

    if (!taskInput || !addBtn || !taskList) {
        console.error('Элементы трекера задач не найдены в DOM');
        return;
    }

    // Загрузка задач из localStorage или пустой массив
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Сохранить задачи в localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Отрисовать список задач (выполненные внизу, разделённые линией)
    function renderTasks() {
        taskList.innerHTML = '';

        // Разделяем задачи: сначала невыполненные, потом выполненные
        const activeTasks = tasks.filter(task => !task.completed);
        const completedTasks = tasks.filter(task => task.completed);

        // Добавляем активные задачи
        activeTasks.forEach((task, index) => {
            addTaskElement(task, index);
        });

        // Если есть и активные, и выполненные — добавляем разделитель
        if (activeTasks.length > 0 && completedTasks.length > 0) {
            const separator = document.createElement('hr');
            separator.className = 'task-separator animate__separator';
            separator.style.animationDelay = `${0.3 + activeTasks.length * 0.1}s`;
            taskList.appendChild(separator);
        }

        // Добавляем выполненные задачи
        completedTasks.forEach((task, index) => {
            addTaskElement(task, activeTasks.length + index);
        });
    }

    // Создать и добавить элемент задачи
    function addTaskElement(task, index) {
        const li = document.createElement('li');
        li.dataset.id = task.id; // Для поиска элемента при обновлении
        if(task.completed) {
            li.classList.add('completed');
        }

        // Анимация для задач
        li.classList.add('animate__task');
        li.style.animationDelay = `${0.3 + index * 0.1}s`;

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.title;

        // Кнопка редактирования
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.className = 'edit-btn';
        editBtn.title = 'Редактировать задачу';

        // Кнопка удаления
        const delBtn = document.createElement('button');
        delBtn.textContent = '×';
        delBtn.className = 'delete-btn';
        delBtn.title = 'Удалить задачу';

        // Обработка нажатия на задачу — смена статуса (но не по кнопкам)
        li.addEventListener('click', function(e) {
            if(e.target === delBtn || e.target === editBtn) return;
            toggleComplete(task.id);
        });

        // Редактирование задачи
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            startEditing(task.id, taskText, task.title);
        });

        // Удаление задачи
        delBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteTask(task.id);
        });

        li.appendChild(taskText);
        li.appendChild(editBtn);
        li.appendChild(delBtn);
        taskList.appendChild(li);
    }

    // Найти элемент задачи по ID
    function findTaskElement(id) {
        return taskList.querySelector(`li[data-id="${id}"]`);
    }

    // Начать редактирование задачи
    function startEditing(id, taskTextEl, currentTitle) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentTitle;
        input.className = 'edit-input';

        taskTextEl.innerHTML = '';
        taskTextEl.appendChild(input);
        input.focus();

        const saveEdit = () => {
            const newValue = input.value.trim();
            if (newValue) {
                updateTask(id, newValue);
            } else {
                renderTasks(); // Отмена, если пусто
            }
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            }
            if (e.key === 'Escape') {
                renderTasks(); // Отмена редактирования
            }
        });
    }

    // Обновить задачу
    function updateTask(id, newTitle) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, title: newTitle };
            }
            return task;
        });
        saveTasks();
        renderTasks(); // Перерисовываем всё, чтобы сохранить порядок
    }

    // Добавить задачу
    function addTask(title) {
        const newTask = {
            id: Date.now().toString(),
            title: title,
            completed: false
        };
        tasks.push(newTask);
        saveTasks();

        // Находим индекс новой задачи
        const activeTasks = tasks.filter(task => !task.completed);
        const index = activeTasks.findIndex(task => task.id === newTask.id);

        // Добавляем элемент задачи с анимацией
        addTaskElement(newTask, index);
    }

    // Удалить задачу
    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks(); // Перерисовываем, чтобы сохранить порядок и разделитель
    }

    // Переключить статус выполнения
    function toggleComplete(id) {
        tasks = tasks.map(task => {
            if(task.id === id) {
                return {...task, completed: !task.completed};
            }
            return task;
        });
        saveTasks();
        renderTasks(); // Перерисовываем, чтобы переместить задачу в нужный список
    }

    // Добавление задачи по кнопке
    addBtn.addEventListener('click', () => {
        const val = taskInput.value.trim();
        if(val) {
            addTask(val);
            taskInput.value = '';
            taskInput.focus();
        }
    });

    // Добавление задачи по нажатию Enter в поле ввода
    taskInput.addEventListener('keydown', e => {
        if(e.key === 'Enter') {
            addBtn.click();
        }
    });

    // При загрузке отображаем задачи
    renderTasks();
} // ЗАКРЫВАЕТСЯ ФУНКЦИЯ initQuestsTracker


// --- ИНИЦИАЛИЗАЦИОННАЯ ФУНКЦИЯ ДЛЯ ТРЕКЕРА ФИНАНСОВ ---
function initFinanceTracker() {
    console.log('initFinanceTracker вызван'); // Для отладки
    // document.addEventListener('DOMContentLoaded', () => { // УБРАТЬ!
        // Элементы DOM
        const elements = {
            modal: document.querySelector('.modal'),
            modalEdit: document.querySelector('.modal-edit'),
            addBtn: document.querySelector('.add-tr'),
            removeBtn: document.querySelector('.remove-tr'),
            cancelBtn: document.querySelector('.cancel'),
            cancelEditBtn: document.querySelector('.cancel-edit'),
            deleteBtnEdit: document.querySelector('.delete-btn'), // Добавлено
            saveEditBtn: document.querySelector('.save-edit'),
            addRecordBtn: document.querySelector('.add'),
            amountInput: document.getElementById('amountInput'),
            descInput: document.getElementById('descriptionInput'),
            editAmountInput: document.getElementById('editAmountInput'),
            editDescriptionInput: document.getElementById('editDescriptionInput'),
            blockTr: document.getElementById('transactionsContainer'), // Обновлено
            tratiEl: document.querySelector('.trati'),
            zarabotanoEl: document.querySelector('.zarabotano'),
            balanceEl: document.querySelector('.balance'),
            toast: document.getElementById('toast'),
            monthFilter: document.getElementById('monthFilter')
        };

        // Проверка на null для всех элементов
        for (const [key, el] of Object.entries(elements)) {
             if (!el) {
                 console.error(`Ошибка: Элемент с селектором/ID '${key}' не найден в DOM.`);
                 // Останавливаем выполнение скрипта, если критический элемент отсутствует
                 return; // или throw new Error(...);
             }
        }

        // Состояния
        let state = {
            currentType: 'income',
            transactions: JSON.parse(localStorage.getItem('transactions')) || [],
            currentEditId: null,
            selectedTransaction: null
        };

        // Инициализация
        init();

        function init() {
            bindEvents();
            renderTransactions();
        }

        function bindEvents() {
            // Основные кнопки
            elements.addBtn.addEventListener('click', (e) => { e.preventDefault(); openAddModal('income'); });
            elements.removeBtn.addEventListener('click', (e) => { e.preventDefault(); openAddModal('expense'); });

            // Кнопки модального окна добавления
            elements.cancelBtn.addEventListener('click', closeAddModal);
            elements.addRecordBtn.addEventListener('click', handleAdd);

            // Кнопки модального окна редактирования
            elements.cancelEditBtn.addEventListener('click', closeEditModal);
            elements.deleteBtnEdit.addEventListener('click', handleDelete); // Добавлено
            elements.saveEditBtn.addEventListener('click', handleSaveEdit);

            // Закрытие модальных окон при клике вне их содержимого
            elements.modal.addEventListener('click', e => {
                if (e.target === elements.modal) closeAddModal();
            });
            elements.modalEdit.addEventListener('click', e => {
                if (e.target === elements.modalEdit) closeEditModal();
            });

            // Фильтр по месяцу
            elements.monthFilter.addEventListener('change', () => renderTransactions());
        }

        function openAddModal(type) {
            state.currentType = type;
            elements.amountInput.value = '';
            elements.descInput.value = '';
            document.getElementById('modalTitle').textContent = type === 'income' ? 'Добавить доход' : 'Добавить расход';
            elements.modal.style.display = 'flex';
            elements.amountInput.focus();
        }

        function closeAddModal() {
            elements.modal.style.display = 'none';
            elements.amountInput.value = '';
            elements.descInput.value = '';
            state.currentType = 'income';
        }

        function openEditModal(transaction) {
            state.selectedTransaction = transaction;
            elements.editAmountInput.value = Math.abs(transaction.amount);
            elements.editDescriptionInput.value = transaction.description;
            elements.modalEdit.style.display = 'flex';
            elements.editAmountInput.focus();
        }

        function closeEditModal() {
            elements.modalEdit.style.display = 'none';
            elements.editAmountInput.value = '';
            elements.editDescriptionInput.value = '';
            state.selectedTransaction = null;
        }

        function handleAdd() {
            const amount = parseFloat(elements.amountInput.value);
            const desc = elements.descInput.value.trim();

            if (!amount || isNaN(amount) || amount <= 0) {
                showToast('Введите корректную сумму', 'error');
                return;
            }

            const transaction = {
                id: Date.now(),
                amount: state.currentType === 'income' ? amount : -amount,
                description: desc || 'Без описания',
                date: new Date().toISOString(),
                type: state.currentType
            };
            state.transactions.push(transaction);
            saveToStorage();
            // Вместо renderTransactions() - добавляем только новую запись
            if (shouldShowTransaction(transaction)) {
                addTransactionElement(transaction);
            }
            updateStats();
            closeAddModal();
            showToast('Запись добавлена', 'success');
        }

         // Функция для обработки сохранения изменений
        function handleSaveEdit() {
            if (!state.selectedTransaction) return;

            const amount = parseFloat(elements.editAmountInput.value);
            const desc = elements.editDescriptionInput.value.trim();

            if (!amount || isNaN(amount) || amount <= 0) {
                showToast('Введите корректную сумму', 'error');
                return;
            }

            const index = state.transactions.findIndex(t => t.id === state.selectedTransaction.id);
            if (index !== -1) {
                const type = state.transactions[index].type;
                const oldTransaction = {...state.transactions[index]}; // Сохраняем старую версию
                state.transactions[index].amount = type === 'income' ? amount : -amount;
                state.transactions[index].description = desc || 'Без описания';

                saveToStorage();
                // Обновляем только изменённую запись
                const oldShouldShow = shouldShowTransaction(oldTransaction);
                const newShouldShow = shouldShowTransaction(state.transactions[index]);

                if (oldShouldShow && !newShouldShow) {
                    // Удаляем элемент, если он больше не должен отображаться
                    const element = document.querySelector(`[data-id="${state.transactions[index].id}"]`);
                    if (element) {
                        element.remove();
                    }
                } else if (!oldShouldShow && newShouldShow) {
                    // Добавляем элемент, если он теперь должен отображаться
                    addTransactionElement(state.transactions[index]);
                } else if (oldShouldShow && newShouldShow) {
                    // Обновляем элемент, если он должен отображаться
                    updateTransactionElement(state.transactions[index]);
                }
                updateStats();
                closeEditModal();
                showToast('Запись обновлена', 'success');
            }
        }

        // Функция для обработки удаления
        function handleDelete() {
            if (!state.selectedTransaction) return;

            if (confirm(`Удалить запись "${state.selectedTransaction.description}"?`)) {
                state.transactions = state.transactions.filter(t => t.id !== state.selectedTransaction.id);
                saveToStorage();
                // Удаляем элемент из DOM
                const element = document.querySelector(`[data-id="${state.selectedTransaction.id}"]`);
                if (element) {
                    element.remove();
                }
                updateStats();
                closeEditModal();
                showToast('Запись удалена', 'error');
            }
        }

        function handleRecordClick(transaction) {
            openEditModal(transaction);
        }

        // Проверяет, должна ли запись отображаться с учётом фильтра
        function shouldShowTransaction(transaction) {
            const filterMonth = elements.monthFilter.value;
            if (filterMonth === 'all') {
                return true;
            }
            const month = parseInt(filterMonth);
            return new Date(transaction.date).getMonth() === month;
        }

        // Функция для обновления статистики
        function updateStats() {
            const filterMonth = elements.monthFilter.value;
            let filtered = state.transactions;

            if (filterMonth !== 'all') {
                const month = parseInt(filterMonth);
                filtered = state.transactions.filter(t => new Date(t.date).getMonth() === month);
            }

            let totalIncome = 0;
            let totalExpense = 0;

            filtered.forEach(t => {
                if (t.amount > 0) {
                    totalIncome += t.amount;
                } else {
                    totalExpense += Math.abs(t.amount);
                }
            });

            // Обновление статистики
            elements.zarabotanoEl.textContent = totalIncome.toFixed(2) + ' ₽';
            elements.tratiEl.textContent = totalExpense.toFixed(2) + ' ₽';
            const balance = totalIncome - totalExpense;
            elements.balanceEl.textContent = balance.toFixed(2) + ' ₽';

            // Цвет баланса
            elements.balanceEl.className = 'balance';
            if (balance < 0) {
                elements.balanceEl.classList.add('negative');
            }
        }

        // Отрисовать список транзакций (только при изменении фильтра)
        function renderTransactions() {
            elements.blockTr.innerHTML = '';

            const filterMonth = elements.monthFilter.value;
            let filtered = state.transactions;

            if (filterMonth !== 'all') {
                const month = parseInt(filterMonth);
                filtered = state.transactions.filter(t => new Date(t.date).getMonth() === month);
            }

            // Добавляем все отфильтрованные записи
            filtered.forEach(t => {
                addTransactionElement(t, true); // true = при инициализации
            });

            updateStats();
        }

        // Создать и добавить элемент записи
        function addTransactionElement(transaction, isInitialRender = false) {
            // Проверяем, должна ли запись отображаться
            if (!shouldShowTransaction(transaction)) {
                return;
            }

            const item = document.createElement('div');
            item.className = `record-item ${transaction.type === 'income' ? 'record-income' : 'record-expense'}`;
            item.dataset.id = transaction.id; // Для поиска элемента

            // Добавляем анимацию только при добавлении новой записи (не при инициализации)
            if (!isInitialRender) {
                item.classList.add('animate__record');
            }

            item.innerHTML = `
                <div>
                    <strong>${transaction.description}</strong><br>
                    <small>${new Date(transaction.date).toLocaleDateString()}</small>
                </div>
                <div>
                    <span>${transaction.amount > 0 ? '+' : ''}${transaction.amount.toFixed(2)} ₽</span>
                </div>
            `;
            item.addEventListener('click', () => handleRecordClick(transaction));
            elements.blockTr.appendChild(item);
        }

        // Обновить элемент записи (при редактировании)
        function updateTransactionElement(transaction) {
            const item = document.querySelector(`[data-id="${transaction.id}"]`);
            if (item) {
                item.className = `record-item ${transaction.type === 'income' ? 'record-income' : 'record-expense'}`;
                item.innerHTML = `
                    <div>
                        <strong>${transaction.description}</strong><br>
                        <small>${new Date(transaction.date).toLocaleDateString()}</small>
                    </div>
                    <div>
                        <span>${transaction.amount > 0 ? '+' : ''}${transaction.amount.toFixed(2)} ₽</span>
                    </div>
                `;
                item.addEventListener('click', () => handleRecordClick(transaction));
            }
        }

        function saveToStorage() {
            localStorage.setItem('transactions', JSON.stringify(state.transactions));
        }

        function showToast(message, type) {
            elements.toast.textContent = message;
            elements.toast.className = `toast ${type} show`;
            setTimeout(() => {
                elements.toast.className = 'toast';
            }, 3000);
        }
} 