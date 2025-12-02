async function api(path, method = 'GET', body) {
  const opts = { method, headers: {} };
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  const res = await fetch('/api' + path, opts);
  if (!res.ok) throw new Error('API error ' + res.status);
  return res.json();
}

const tasksEl = document.getElementById('tasks');
const form = document.getElementById('addForm');
const titleInput = document.getElementById('taskTitle');

async function load() {
  try {
    const tasks = await api('/tasks');
    render(tasks);
  } catch (err) {
    tasksEl.innerHTML = '<li>Error loading tasks</li>';
    console.error(err);
  }
}

function render(tasks) {
  if (!tasks.length) { tasksEl.innerHTML = '<li>No tasks yet</li>'; return; }
  tasksEl.innerHTML = '';
  tasks.slice().reverse().forEach(task => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', async () => {
      try {
        await api('/tasks/' + task.id, 'PUT', { completed: checkbox.checked });
        load();
      } catch (e) { console.error(e); }
    });

    const span = document.createElement('span');
    span.textContent = task.title;
    span.className = 'title' + (task.completed ? ' completed' : '');

    left.appendChild(checkbox);
    left.appendChild(span);

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      if (!confirm('Delete this task?')) return;
      try { await api('/tasks/' + task.id, 'DELETE'); load(); } catch (e) { console.error(e); }
    });

    li.appendChild(left);
    li.appendChild(del);
    tasksEl.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  try { await api('/tasks', 'POST', { title }); titleInput.value = ''; load(); } catch (e) { console.error(e); }
});

load();
