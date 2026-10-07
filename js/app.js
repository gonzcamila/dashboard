// ===== Weather =====


function loadWeather() {
    fetch('./data/weather.json')
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => {
            console.error('Error loading weather:', error);
            displayWeatherError();
        });
}

function displayWeather(weather) {
    document.getElementById('weather-display').innerHTML = `
        <div class="weather-current">
            <div class="weather-icon">${weather.icon}</div>
            <div class="weather-temp">${weather.temperature}°F</div>
            <div class="weather-location">${weather.location}</div>
            <div class="weather-condition">${weather.condition}</div>
            <p class="weather-note">Sample weather, not a current report.</p>
        </div>`;
}

function displayWeatherError() {
    document.getElementById('weather-display').innerHTML =
        `<p class="widget-error">Weather data is unavailable right now.</p>`;
}

// ===== Quotes =====

let allQuotes = [];
let currentQuoteIndex = -1;
const quoteButton = document.getElementById('new-quote-btn');

function displayRandomQuote() {
    const display = document.getElementById('quotes-display');
    if (allQuotes.length === 0) {
        display.innerHTML = `<p class="widget-error">No quotes to show.</p>`;
        return;
    }
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * allQuotes.length);
    } while (randomIndex === currentQuoteIndex && allQuotes.length > 1);
    currentQuoteIndex = randomIndex;
    const quote = allQuotes[randomIndex];
    display.innerHTML = `
        <div class="quote-card">
            <div class="quote-text">"${quote.text}"</div>
            <div class="quote-author">— ${quote.author}</div>
        </div>`;
}

function loadQuotes() {
    fetch('./data/quotes.json')
        .then(response => response.json())
        .then(quotes => {
            allQuotes = quotes;
            displayRandomQuote();
            if (allQuotes.length > 0) {
                quoteButton.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error loading quotes:', error);
            displayQuotesError();
        });
}

function displayQuotesError() {
    document.getElementById('quotes-display').innerHTML =
        `<p class="widget-error">Quotes are unavailable right now.</p>`;
}

quoteButton.addEventListener('click', displayRandomQuote);

// ===== Tasks =====

function loadTasks() {
    const tasksJSON = localStorage.getItem('dashboardTasks');
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function saveTasks(tasks) {
    localStorage.setItem('dashboardTasks', JSON.stringify(tasks));
}

function addTask(taskText) {
    const tasks = loadTasks();
    tasks.push({ text: taskText, completed: false, id: Date.now() });
    saveTasks(tasks);
    displayTasks();
}

function toggleTask(index) {
    const tasks = loadTasks();
    tasks[index].completed = !tasks[index].completed;
    saveTasks(tasks);
    displayTasks();
}

function deleteTask(index) {
    const tasks = loadTasks();
    if (confirm(`Delete task: "${tasks[index].text}"?`)) {
        tasks.splice(index, 1);
        saveTasks(tasks);
        displayTasks();
    }
}

function displayTasks() {
    const tasks = loadTasks();
    const list = document.getElementById('task-list');
    list.innerHTML = '';

    tasks.forEach((task, index) => {
        const item = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `task-${task.id}`;
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(index));

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = task.text;

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteTask(index));

        item.append(checkbox, label, deleteButton);
        list.appendChild(item);
    });

    displayTaskStats(tasks);
}

function displayTaskStats(tasks) {
    const stats = document.getElementById('task-stats');
    const total = tasks.length;
    if (total === 0) {
        stats.textContent = 'No tasks yet. Add one above.';
        return;
    }
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.filter(task => !task.completed).length;
    const percent = Math.round((completed / total) * 100);
    stats.textContent = `${total} total · ${completed} completed · ${pending} pending · ${percent}% done`;
}

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');

taskForm.addEventListener('submit', event => {
    event.preventDefault();
    const text = taskInput.value.trim();
    if (text === '') {
        return;
    }
    addTask(text);
    taskInput.value = '';
});

// ===== Theme =====

function initializeTheme() {
    if (localStorage.getItem('dashboardTheme') === 'dark') {
        document.body.classList.add('theme-dark');
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('theme-dark');
    if (isDark) {
        localStorage.setItem('dashboardTheme', 'dark');
    } else {
        localStorage.setItem('dashboardTheme', 'light');
    }
}

document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
initializeTheme();

// ===== Start =====

loadWeather();
loadQuotes();
displayTasks();
