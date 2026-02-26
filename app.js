class Widget {
    constructor(containerId, title) {
        this.container = document.getElementById(containerId);
        this.id = 'widget-' + Date.now();
        this.title = title;
        
        this.element = this.createBaseElement();
        this.closeBtn = this.element.querySelector('.close-btn');

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
        this.closeBtn.removeEventListener('click', this.handleClose);
        this.element.remove();
    }

    handleClose() {
        this.destroy();
    }
}

class TodoWidget extends Widget {
    constructor(containerId) {
        super(containerId, 'Список задач');
        this.tasks = []; 
        
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
        this.addBtn.removeEventListener('click', this.handleAddTask);
        this.list.removeEventListener('click', this.handleListClick);
        super.destroy();
    }
}

class QuoteWidget extends Widget {
    constructor(containerId) {
        super(containerId, 'Мотивация');
        this.quotes = [
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

class ClockWidget extends Widget {
    constructor(containerId) {
        super(containerId, 'Время и Дата');
        
        this.body = this.element.querySelector('.widget-body');
        this.body.innerHTML = `
            <div class="clock-time"></div>
            <div class="clock-date"></div>
        `;
        
        this.timeDisplay = this.body.querySelector('.clock-time');
        this.dateDisplay = this.body.querySelector('.clock-date');
        
        this.updateTime = this.updateTime.bind(this);
        
        this.timerId = setInterval(this.updateTime, 1000);
        this.updateTime();
    }

    updateTime() {
        const now = new Date();
        this.timeDisplay.textContent = now.toLocaleTimeString('ru-RU');
        this.dateDisplay.textContent = now.toLocaleDateString('ru-RU', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    destroy() {
        clearInterval(this.timerId); 
        super.destroy();
    }
}

class PomodoroWidget extends Widget {
    constructor(containerId) {
        super(containerId, 'Таймер Pomodoro');
        this.timeLeft = 25 * 60;
        this.timerId = null;
        this.isRunning = false;

        this.body = this.element.querySelector('.widget-body');
        this.body.innerHTML = `
            <div class="timer-display">25:00</div>
            <div class="timer-controls">
                <button class="btn toggle-btn">Старт</button>
                <button class="btn btn-danger reset-btn">Сброс</button>
            </div>
        `;

        this.display = this.body.querySelector('.timer-display');
        this.toggleBtn = this.body.querySelector('.toggle-btn');
        this.resetBtn = this.body.querySelector('.reset-btn');

        this.handleToggle = this.handleToggle.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.tick = this.tick.bind(this);

        this.toggleBtn.addEventListener('click', this.handleToggle);
        this.resetBtn.addEventListener('click', this.handleReset);
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const seconds = (this.timeLeft % 60).toString().padStart(2, '0');
        this.display.textContent = `${minutes}:${seconds}`;
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
        } else {
            this.handleToggle();
            alert('Время вышло! Пора отдохнуть.');
        }
    }

    handleToggle() {
        if (this.isRunning) {
            clearInterval(this.timerId);
            this.toggleBtn.textContent = 'Старт';
            this.toggleBtn.classList.remove('btn-warning');
        } else {
            this.timerId = setInterval(this.tick, 1000);
            this.toggleBtn.textContent = 'Пауза';
            this.toggleBtn.classList.add('btn-warning');
        }
        this.isRunning = !this.isRunning;
    }

    handleReset() {
        clearInterval(this.timerId);
        this.isRunning = false;
        this.timeLeft = 25 * 60;
        this.toggleBtn.textContent = 'Старт';
        this.toggleBtn.classList.remove('btn-warning');
        this.updateDisplay();
    }

    destroy() {
        clearInterval(this.timerId);
        this.toggleBtn.removeEventListener('click', this.handleToggle);
        this.resetBtn.removeEventListener('click', this.handleReset);
        super.destroy();
    }
}

class NoteWidget extends Widget {
    constructor(containerId) {
        super(containerId, 'Быстрая заметка');
        
        this.body = this.element.querySelector('.widget-body');
        this.body.innerHTML = `
            <textarea class="note-input" placeholder="Запишите вашу мысль..."></textarea>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-todo-btn').addEventListener('click', () => new TodoWidget('dashboard').mount());
    document.getElementById('add-quote-btn').addEventListener('click', () => new QuoteWidget('dashboard').mount());
    document.getElementById('add-clock-btn').addEventListener('click', () => new ClockWidget('dashboard').mount());
    document.getElementById('add-pomodoro-btn').addEventListener('click', () => new PomodoroWidget('dashboard').mount());
    document.getElementById('add-note-btn').addEventListener('click', () => new NoteWidget('dashboard').mount());

    new ClockWidget('dashboard').mount();
    new TodoWidget('dashboard').mount();
    new PomodoroWidget('dashboard').mount();
});
