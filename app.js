// Базовый класс для всех виджетов
class Widget {
    constructor(containerId, title) {
        this.container = document.getElementById(containerId);
        this.id = 'widget-' + Date.now();
        this.title = title;
        
        this.element = this.createBaseElement();
        this.closeBtn = this.element.querySelector('.close-btn');
        
        // Привязываем контекст для корректного удаления слушателя
        this.handleClose = this.handleClose.bind(this);
        this.closeBtn.addEventListener('click', this.handleClose);
    }

    createBaseElement() {
        const div = document.createElement('div');
        div.className = 'widget';
        div.innerHTML = `
            <div class="widget-header">
                <h3>${this.title}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="widget-body"></div>
        `;
        return div;
    }

    mount() {
        this.container.appendChild(this.element);
    }

    destroy() {
        // Требование 3: Корректное удаление слушателей событий
        this.closeBtn.removeEventListener('click', this.handleClose);
        this.element.remove();
    }

    handleClose() {
        this.destroy();
    }
}

// Требование 2: Независимое состояние (список задач)
class TodoWidget extends Widget {
    constructor(containerId) {
        super(containerId, 'Список задач');
        this.tasks = []; // Изолированный массив задач для каждого экземпляра
        
        this.body = this.element.querySelector('.widget-body');
        this.body.innerHTML = `
            <ul class="todo-list"></ul>
            <div style="display: flex; gap: 5px; margin-top: 10px;">
                <input type="text" placeholder="Новая задача..." style="flex-grow: 1;">
                <button class="btn add-btn">Добавить</button>
            </div>
        `;
        
        this.input = this.body.querySelector('input');
        this.addBtn = this.body.querySelector('.add-btn');
        this.list = this.body.querySelector('.todo-list');
        
        this.handleAddTask = this.handleAddTask.bind(this);
        this.handleListClick = this.handleListClick.bind(this);
        
        this.addBtn.addEventListener('click', this.handleAddTask);
        // Требование 3: Делегирование событий на весь список (вместо слушателей на каждую кнопку)
        this.list.addEventListener('click', this.handleListClick);
    }

    handleAddTask() {
        const text = this.input.value.trim();
        if (text) {
            this.tasks.push({ id: Date.now(), text });
            this.input.value = '';
            this.renderTasks();
        }
    }

    handleListClick(event) {
        if (event.target.tagName === 'BUTTON') {
            const id = Number(event.target.dataset.id);
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.renderTasks();
        }
    }

    renderTasks() {
        this.list.innerHTML = '';
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
                <span>${task.text}</span>
                <button data-id="${task.id}">X</button>
            `;
            this.list.appendChild(li);
        });
    }

    destroy() {
        // Очистка локальных слушателей перед удалением DOM-узла
        this.addBtn.removeEventListener('click', this.handleAddTask);
        this.list.removeEventListener('click', this.handleListClick);
        super.destroy();
    }
}

// Требование 2: Независимое состояние (текущая цитата)
class QuoteWidget extends Widget {
    constructor(containerId) {
        super(containerId, 'Мотивация');
        this.quotes = [
            "Пишите код так, как будто сопровождать его будет склонный к насилию психопат.",
            "Работает? Не трогай!",
            "Сначала решите проблему, потом пишите код."
        ];
        this.currentIndex = Math.floor(Math.random() * this.quotes.length);
        
        this.body = this.element.querySelector('.widget-body');
        this.body.innerHTML = `
            <p class="quote-text"></p>
            <button class="btn next-btn" style="width: 100%;">Следующая</button>
        `;
        
        this.quoteText = this.body.querySelector('.quote-text');
        this.nextBtn = this.body.querySelector('.next-btn');
        
        this.handleNext = this.handleNext.bind(this);
        this.nextBtn.addEventListener('click', this.handleNext);
        
        this.updateQuote();
    }

    updateQuote() {
        this.quoteText.textContent = this.quotes[this.currentIndex];
    }

    handleNext() {
        this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
        this.updateQuote();
    }

    destroy() {
        this.nextBtn.removeEventListener('click', this.handleNext);
        super.destroy();
    }
}

// Требование 1: Динамическое добавление виджетов
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-todo-btn').addEventListener('click', () => {
        new TodoWidget('dashboard').mount();
    });
    
    document.getElementById('add-quote-btn').addEventListener('click', () => {
        new QuoteWidget('dashboard').mount();
    });

    // Инициализация двух виджетов по умолчанию
    new TodoWidget('dashboard').mount();
    new QuoteWidget('dashboard').mount();
});
