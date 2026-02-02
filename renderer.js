const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const emptyState = document.getElementById('empty-state');

let tasks = [];

// Format seconds into MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTaskCount() {
    taskCount.textContent = `${tasks.length} Task${tasks.length !== 1 ? 's' : ''}`;
    emptyState.style.display = tasks.length === 0 ? 'block' : 'none';
}

function saveTasks() {
    // For now, let's keep it in-memory or localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks.map(t => ({
        id: t.id,
        name: t.name,
        duration: t.duration,
        remainingTime: t.remainingTime,
        status: 'stopped' // Always save as stopped
    }))));
}

function renderTasks() {
    taskList.innerHTML = '';
    if (tasks.length === 0) {
        taskList.appendChild(emptyState);
        emptyState.style.display = 'block';
    } else {
        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = `task-card ${task.intervalId ? 'timer-running' : ''}`;
            taskCard.id = `task-${task.id}`;

            taskCard.innerHTML = `
                <div class="task-info">
                    <h3>${task.name}</h3>
                    <div class="task-time-display" id="time-${task.id}">
                        ${formatTime(task.remainingTime)} / ${formatTime(task.duration)}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn ${task.intervalId ? 'stop-btn' : 'start-btn'}" onclick="toggleTimer(${task.id})">
                        ${task.intervalId ? 'Stop' : 'Start'}
                    </button>
                    <button class="action-btn remove-btn" onclick="removeTask(${task.id})">×</button>
                </div>
            `;
            taskList.appendChild(taskCard);
        });
    }
    updateTaskCount();
}

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('task-name').value;
    const minutes = parseInt(document.getElementById('task-time').value);

    const newTask = {
        id: Date.now(),
        name: name,
        duration: minutes * 60,
        remainingTime: minutes * 60,
        intervalId: null
    };

    tasks.push(newTask);
    taskForm.reset();
    saveTasks();
    renderTasks();
});

window.toggleTimer = function (id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.intervalId) {
        // Stop timer
        clearInterval(task.intervalId);
        task.intervalId = null;
        saveTasks();
    } else {
        // Start timer
        task.intervalId = setInterval(() => {
            if (task.remainingTime > 0) {
                task.remainingTime--;
                const timeEl = document.getElementById(`time-${task.id}`);
                if (timeEl) {
                    timeEl.textContent =
                        `${formatTime(task.remainingTime)} / ${formatTime(task.duration)}`;
                }
            } else {
                clearInterval(task.intervalId);
                task.intervalId = null;
                saveTasks();
                alert(`Task "${task.name}" completed!`);
                renderTasks();
            }
        }, 1000);
    }
    renderTasks();
};

window.removeTask = function (id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    if (tasks[taskIndex].intervalId) {
        clearInterval(tasks[taskIndex].intervalId);
    }

    tasks.splice(taskIndex, 1);
    saveTasks();
    renderTasks();
};

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        tasks = JSON.parse(saved).map(t => ({
            ...t,
            intervalId: null
        }));
        renderTasks();
    }
});
