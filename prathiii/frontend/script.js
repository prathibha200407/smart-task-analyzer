const taskForm = document.getElementById('taskForm');
const bulkInput = document.getElementById('bulkInput');
const outputSection = document.getElementById('output');
const analyzeBtn = document.getElementById('analyzeBtn');
const strategySelect = document.getElementById('strategy');
const suggestBtn = document.getElementById('suggestBtn');

let tasks = [];

// Add single task with animated message
taskForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const formData = new FormData(taskForm);
  const dependenciesRaw = formData.get('dependencies');
  const dependencies = dependenciesRaw
    ? dependenciesRaw.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const task = {
    title: formData.get('title'),
    due_date: formData.get('due_date'),
    estimated_hours: Number(formData.get('estimated_hours')),
    importance: Number(formData.get('importance')),
    dependencies: dependencies
  };

  tasks.push(task);
  taskForm.reset();
  showMessage('✅ Task added! You can add more or run analysis.', 'success');
});

// Handle Analyze button with loading animation
analyzeBtn.addEventListener('click', async function () {
  clearMessage();
  let inputTasks = tasks.slice();

  if (bulkInput.value.trim()) {
    try {
      const bulkTasks = JSON.parse(bulkInput.value);
      if (Array.isArray(bulkTasks)) {
        inputTasks = bulkTasks;
      } else {
        showMessage('⚠️ Bulk input must be a JSON array.', 'error');
        return;
      }
    } catch (e) {
      showMessage('❌ Invalid JSON in bulk input.', 'error');
      return;
    }
  }

  // Show animated loading indicator
  outputSection.innerHTML = `
    <div style="text-align:center;padding:24px;">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" stroke="#44a9fc" stroke-width="4" fill="none" opacity="0.3"/>
        <circle cx="24" cy="24" r="20" stroke="#44a9fc" stroke-width="4" fill="none"
          stroke-dasharray="62.8" stroke-dashoffset="40"
          style="animation: spin 1.1s linear infinite;"/>
      </svg>
      <br>Analyzing tasks...
    </div>
  `;

  console.log('Analyzing tasks:', inputTasks);

  try {
    const response = await fetch('http://127.0.0.1:8000/api/tasks/analyze/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: inputTasks, strategy: strategySelect.value })
    });

    if (!response.ok) {
      throw new Error('Analysis request failed.');
    }

    const sortedTasks = await response.json();
    renderResults(sortedTasks);
    showMessage('', 'success'); // clear any old error
  } catch (e) {
    showMessage('❌ Network/API error: ' + e.message, 'error');
    // Do NOT clear outputSection so last results stay visible
  }
});

// Suggestion button handler
suggestBtn.addEventListener('click', async function () {
  clearMessage();
  outputSection.innerHTML = `
    <div style="text-align:center;padding:24px;">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" stroke="#44a9fc" stroke-width="4" fill="none" opacity="0.3"/>
        <circle cx="24" cy="24" r="20" stroke="#44a9fc" stroke-width="4" fill="none"
          stroke-dasharray="62.8" stroke-dashoffset="40"
          style="animation: spin 1.1s linear infinite;"/>
      </svg>
      <br>Loading suggestions...
    </div>
  `;
  try {
    const response = await fetch('http://127.0.0.1:8000/api/tasks/suggest/');
    if (!response.ok) throw new Error('Failed to fetch suggestions.');
    const suggestedTasks = await response.json();
    renderResults(suggestedTasks);
    showMessage('', 'success'); // clear any old error
  } catch (err) {
    showMessage('❌ Error loading suggestions: ' + err.message, 'error');
    // Do NOT clear outputSection so last results stay visible
  }
});

// Render output with card fade-in and priority badge
function renderResults(tasksList) {
  outputSection.innerHTML = '';
  if (!tasksList.length) {
    showMessage('No tasks to analyze.', 'error');
    return;
  }
  tasksList.forEach((task, i) => {
    let priorityClass = 'priority-low';
    let badge = 'Low';
    if (task.score >= 20) { priorityClass = 'priority-high'; badge = 'High'; }
    else if (task.score >= 10) { priorityClass = 'priority-medium'; badge = 'Medium'; }

    const card = document.createElement('div');
    card.className = `task-card ${priorityClass}`;
    card.style.animationDelay = `${i * 0.12}s`; // Stagger fade-in

    card.innerHTML = `
      <div>
        <strong>${task.title}</strong>
        <span class="score-badge" title="Priority">${badge}</span>
      </div>
      <div>Due: <b>${task.due_date}</b> | Effort: <b>${task.estimated_hours} hrs</b> | Importance: <b>${task.importance}</b> | Score: <b>${task.score}</b></div>
      <div class="explanation" title="${task.explanation}">${task.explanation}</div>
    `;
    outputSection.appendChild(card);
  });
}

// Animated message with fade-in and fade-out
function showMessage(msg, type) {
  let el = document.getElementById('msg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'msg';
    document.body.insertBefore(el, document.body.firstChild);
  }
  el.textContent = msg;
  el.style.color = type === 'error' ? '#e74c3c' : '#2980b9';
  el.style.background = type === 'error' ? '#fff3f3' : '#eaf8ff';
  el.style.textAlign = 'center';
  el.style.padding = '10px 0 7px 0';
  el.style.fontWeight = 'bold';
  el.style.fontSize = '16px';
  el.style.borderRadius = '0 0 18px 18px';
  el.style.opacity = '1';
  el.style.transition = 'opacity 0.55s';

  // Fade out after 2.6s
  setTimeout(() => {
    el.style.opacity = '0';
  }, 30000);
}

function clearMessage() {
  let el = document.getElementById('msg');
  if (el) el.textContent = '';
}

// Bonus: Reset output and task data with animation if needed
function resetAll() {
  tasks = [];
  bulkInput.value = '';
  outputSection.style.boxShadow = '0 0 0 #fff';
  outputSection.innerHTML = '';
  setTimeout(() => {
    outputSection.style.boxShadow = '0 7px 26px rgba(70,110,170,0.13)';
  }, 400);
}

// Add spinning loader animation
const styleEl = document.createElement('style');
styleEl.textContent = `
@keyframes spin {
  0% { stroke-dashoffset: 48; transform: rotate(0deg);}
  100% { stroke-dashoffset: 0; transform: rotate(360deg);}
}
`;
document.head.appendChild(styleEl);
