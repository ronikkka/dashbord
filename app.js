const activeWidgets = new Set();

class Widget {
    constructor(containerId, title, widgetType) {
        this.container = document.getElementById(containerId);
        this.widgetType = widgetType;
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
        
        activeWidgets.delete(this.widgetType);
        const btn = document.getElementById(`btn-${this.widgetType}`);
        if(btn) btn.disabled = false;
    }

    handleClose() {
        this.destroy();
    }
}

class WeatherWidget extends Widget {
    constructor(containerId) {
        super(containerId, 'Погода (С-Пб)', 'WeatherWidget');
        this.body = this.element.querySelector('.widget-body');
        this.body.innerHTML = `<div class="quote-text">Загрузка данных...</div>`;
        this.fetchWeather();
    }

    async fetchWeather() {
        try {
            const url = 'https://api.open-meteo.com/v1/forecast?latitude=59.9386&longitude=30.3141&current_weather=true';
            const response = await fetch(url);
            const data = await response.json();
            const weather = data.current_weather;

            this.body.innerHTML = `
                <div class="weather-temp">${Math.round(weather.temperature)}°C</div>
                <div class="weather-desc">Ветер: ${weather.windspeed} км/ч</div>
                <button class="btn btn-primary" style="margin-top:1rem; width:100%" id="update-weather">Обновить</button>
            `;
            
            this.body.querySelector('#update-weather').addEventListener('click', () => {
                this.body.innerHTML = `<div class="quote-text">Обновление...</div>`;
                this.fetchWeather();
            });

        } catch (error) {
            this.body.innerHTML = `<div class="quote-text" style="color:var(--danger)">Ошибка загрузки API</div>`;
        }
    }
}

class QuoteWidget extends Widget {
    constructor(containerId) {
        super(containerId, 'Мотивация', 'QuoteWidget');
        this.body = this.element.querySelector('.widget-body');
        
        this.body.innerHTML = `
            <div class="quote-text">Загрузка мысли...</div>
            <div class="quote-author"></div>
            <button class="btn btn-primary next-btn" style="width: 100%;">Другая цитата</button>
        `;
        
        this.quoteText = this.body.querySelector('.quote-text');
        this.quoteAuthor = this.body.querySelector('.quote-author');
        this.nextBtn = this.body.querySelector('.next-btn');
        
        this.handleNext = this.handleNext.bind(this);
        this.nextBtn.addEventListener('click', this.handleNext);
        
        this.fetchQuote();
    }

    async fetchQuote() {
        this.nextBtn.disabled = true;
        this.quoteText.textContent = "Загрузка...";
        this.quoteAuthor.textContent = "";
        
        try {
            const response = await fetch('https://dummyjson.com/quotes/random');
            const data = await response.json();
            this.quoteText.textContent = `«${data.quote}»`;
            this.quoteAuthor.textContent = `- ${data.author}`;
        } catch (error) {
            this.quoteText.textContent = "Не удалось загрузить цитату.";
        } finally {
            this.nextBtn.disabled = false;
        }
    }

    handleNext() {
        this.fetchQuote();
    }

    destroy() {
        this.nextBtn.removeEventListener('click', this.handleNext);
        super.destroy();
    }
}


class TodoWidget extends Widget {
    constructor(containerId) {
        super(containerId, 'Список задач', 'TodoWidget');
        this.tasks = []; 
        
        this.body = this.element.querySelector('.widget-body');
        this.body.innerHTML = `
            <ul class="todo-list"></ul>
            <div style="display: flex; gap: 8px; margin-top: 15px;">
                <input type="text" placeholder="Новая задача..." style="flex-grow: 1;">
                <button class="btn btn-primary add-btn">Добавить</button>
            </div>
        `;
        
        this.input = this.body.querySelector('input');
        this.addBtn = this.body.querySelector('.add-btn');
        this.list = this.body.querySelector('.todo-list');
        
        this.handleAddTask = this.handleAddTask.bind(this);
        this.handleListClick = this.handleListClick.bind(this);
        
        this.addBtn.addEventListener('click', this.handleAddTask);
        this.input.addEventListener('keypress', (e) => { if(e.key === 'Enter') this.handleAddTask() });
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
                <button data-id="${task.id}">✕</button>
            `;
            this.list.appendChild(li);
        });
    }
}

class ClockWidget extends Widget {
    constructor(containerId) {
        super(containerId, 'Время и Дата', 'ClockWidget');
        
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
        this.timeDisplay.textContent = now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});
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
        super(containerId, 'Таймер', 'PomodoroWidget');
        this.defaultTime = 25 * 60; 
        this.timeLeft = this.defaultTime;
        this.timerId = null;
        this.isRunning = false;

        this.body = this.element.querySelector('.widget-body');
        this.body.innerHTML = `
            <div class="timer-settings">
                <label>Минуты:</label>
                <input type="number" class="time-input" value="25" min="1" max="120">
            </div>
            <div class="timer-display">25:00</div>
            <div class="timer-controls">
                <button class="btn btn-primary toggle-btn">Старт</button>
                <button class="btn btn-danger reset-btn">Сброс</button>
            </div>
        `;

        this.display = this.body.querySelector('.timer-display');
        this.toggleBtn = this.body.querySelector('.toggle-btn');
        this.resetBtn = this.body.querySelector('.reset-btn');
        this.timeInput = this.body.querySelector('.time-input');

        this.handleToggle = this.handleToggle.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.tick = this.tick.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);

        this.toggleBtn.addEventListener('click', this.handleToggle);
        this.resetBtn.addEventListener('click', this.handleReset);
        this.timeInput.addEventListener('change', this.handleTimeChange);
    }

    handleTimeChange() {
        let mins = parseInt(this.timeInput.value, 10);
        if (isNaN(mins) || mins < 1) mins = 1; 
        this.timeInput.value = mins; 
        this.defaultTime = mins * 60; 
        if(!this.isRunning) {
            this.timeLeft = this.defaultTime; 
            this.updateDisplay();
        }
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
            this.toggleBtn.textContent = 'Продолжить';
            this.toggleBtn.classList.remove('btn-warning');
        } else {
            this.timeInput.disabled = true; 
            this.timerId = setInterval(this.tick, 1000);
            this.toggleBtn.textContent = 'Пауза';
            this.toggleBtn.classList.add('btn-warning');
        }
        this.isRunning = !this.isRunning;
    }

    handleReset() {
        clearInterval(this.timerId);
        this.isRunning = false;
        this.timeLeft = this.defaultTime; 
        this.timeInput.disabled = false; 
        this.toggleBtn.textContent = 'Старт';
        this.toggleBtn.classList.remove('btn-warning');
        this.updateDisplay();
    }
}

class NoteWidget extends Widget {
    constructor(containerId) {
        super(containerId, 'Быстрая заметка', 'NoteWidget');
        this.body = this.element.querySelector('.widget-body');
        this.body.innerHTML = `
            <textarea class="note-input" placeholder="Запишите вашу мысль..."></textarea>
        `;
    }
}

function addWidget(WidgetClass, widgetName) {
    if (activeWidgets.has(widgetName)) return;

    activeWidgets.add(widgetName);
    const btn = document.getElementById(`btn-${widgetName}`);
    if (btn) btn.disabled = true;

    new WidgetClass('dashboard').mount();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-TodoWidget').addEventListener('click', () => addWidget(TodoWidget, 'TodoWidget'));
    document.getElementById('btn-QuoteWidget').addEventListener('click', () => addWidget(QuoteWidget, 'QuoteWidget'));
    document.getElementById('btn-WeatherWidget').addEventListener('click', () => addWidget(WeatherWidget, 'WeatherWidget'));
    document.getElementById('btn-ClockWidget').addEventListener('click', () => addWidget(ClockWidget, 'ClockWidget'));
    document.getElementById('btn-PomodoroWidget').addEventListener('click', () => addWidget(PomodoroWidget, 'PomodoroWidget'));
    document.getElementById('btn-NoteWidget').addEventListener('click', () => addWidget(NoteWidget, 'NoteWidget'));

    addWidget(ClockWidget, 'ClockWidget');
    addWidget(WeatherWidget, 'WeatherWidget');
    addWidget(QuoteWidget, 'QuoteWidget');
});
