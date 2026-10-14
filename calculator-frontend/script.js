// ============================================
// PROFESSIONAL CALCULATOR - FULL FEATURED
// ============================================

const API_URL = 'http://localhost:8080/api/calculator';

// ===== STATE =====
let currentInput = '0';
let previousInput = '';
let currentOperation = null;
let waitingForOperand = false;
let lastResult = null;
let currentMode = 'basic';
let soundEnabled = true;
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let allHistory = [];

// ===== DOM =====
const resultEl = document.getElementById('result');
const expressionEl = document.getElementById('expression');
const historyList = document.getElementById('historyList');
const saveBtn = document.getElementById('saveBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const themeToggle = document.getElementById('themeToggle');
const soundToggle = document.getElementById('soundToggle');
const exportBtn = document.getElementById('exportBtn');
const copyBtn = document.getElementById('copyBtn');
const searchInput = document.getElementById('searchInput');
const toastEl = document.getElementById('toast');

// ===== TOAST NOTIFICATION =====
function showToast(message, isError = false) {
    toastEl.textContent = message;
    toastEl.classList.toggle('error', isError);
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2000);
}

// ===== SOUND =====
let audioCtx = null;
function playClick() {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
}

// ===== DISPLAY =====
function updateDisplay() {
    resultEl.textContent = formatNumber(currentInput);

    if (currentOperation && previousInput) {
        const symbols = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
        expressionEl.textContent = `${formatNumber(previousInput)} ${symbols[currentOperation]}`;
    } else {
        expressionEl.textContent = '';
    }

    saveBtn.disabled = lastResult === null;
    favoriteBtn.disabled = lastResult === null;
}

function formatNumber(num) {
    if (num === '' || num === null) return '0';
    const str = String(num);
    if (str.length > 15) {
        const n = parseFloat(num);
        if (isNaN(n)) return num;
        return n.toExponential(6);
    }
    return str;
}

// ===== NUMBER INPUT =====
function inputNumber(num) {
    playClick();
    if (waitingForOperand) {
        currentInput = num;
        waitingForOperand = false;
    } else {
        if (currentInput === '0') currentInput = num;
        else if (currentInput.length < 15) currentInput += num;
    }
    updateDisplay();
}

function inputDecimal() {
    playClick();
    if (waitingForOperand) {
        currentInput = '0.';
        waitingForOperand = false;
    } else if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    updateDisplay();
}

// ===== OPERATIONS =====
function inputOperation(op) {
    playClick();
    if (currentOperation && !waitingForOperand && previousInput !== '') {
        const result = performCalculation();
        if (result === null) return;
        currentInput = String(result);
        previousInput = String(result);
    } else {
        previousInput = currentInput;
    }

    waitingForOperand = true;
    currentOperation = op;
    lastResult = null;
    updateDisplay();
}

function performCalculation() {
    const prev = parseFloat(previousInput);
    const curr = parseFloat(currentInput);
    if (isNaN(prev) || isNaN(curr)) return curr;

    let result;
    switch (currentOperation) {
        case 'add': result = prev + curr; break;
        case 'subtract': result = prev - curr; break;
        case 'multiply': result = prev * curr; break;
        case 'divide':
            if (curr === 0) { showError('Cannot divide by zero'); return null; }
            result = prev / curr;
            break;
        default: return curr;
    }
    return Math.round(result * 1e10) / 1e10;
}

// ===== EQUALS =====
function handleEquals() {
    playClick();
    if (!currentOperation || previousInput === '') return;

    const result = performCalculation();
    if (result === null) return;

    lastResult = {
        firstNumber: parseFloat(previousInput),
        secondNumber: parseFloat(currentInput),
        operation: currentOperation,
        result: result
    };

    currentInput = String(result);
    previousInput = '';
    currentOperation = null;
    waitingForOperand = true;

    resultEl.classList.add('flash');
    setTimeout(() => resultEl.classList.remove('flash'), 200);
    updateDisplay();
}

// ===== CLEAR =====
function clearAll() {
    playClick();
    currentInput = '0';
    previousInput = '';
    currentOperation = null;
    waitingForOperand = false;
    lastResult = null;
    resultEl.classList.remove('error');
    updateDisplay();
}

// ===== BACKSPACE =====
function backspace() {
    playClick();
    if (waitingForOperand) return;
    if (currentInput.length === 1) currentInput = '0';
    else currentInput = currentInput.slice(0, -1);
    updateDisplay();
}

// ===== PERCENT =====
function percent() {
    playClick();
    const num = parseFloat(currentInput);
    if (isNaN(num)) return;
    currentInput = String(num / 100);
    updateDisplay();
}

// ===== SIGN TOGGLE =====
function toggleSign() {
    playClick();
    if (currentInput === '0') return;
    if (currentInput.startsWith('-')) currentInput = currentInput.slice(1);
    else currentInput = '-' + currentInput;
    updateDisplay();
}

// ===== SCIENTIFIC FUNCTIONS =====
function sqrt() {
    playClick();
    const num = parseFloat(currentInput);
    if (num < 0) { showError('Cannot sqrt negative'); return; }
    currentInput = String(Math.round(Math.sqrt(num) * 1e10) / 1e10);
    updateDisplay();
}

function power() {
    playClick();
    const num = parseFloat(currentInput);
    currentInput = String(num * num);
    updateDisplay();
}

function reciprocal() {
    playClick();
    const num = parseFloat(currentInput);
    if (num === 0) { showError('Cannot divide by zero'); return; }
    currentInput = String(Math.round((1 / num) * 1e10) / 1e10);
    updateDisplay();
}

function factorial() {
    playClick();
    const num = parseInt(currentInput);
    if (num < 0) { showError('Invalid input'); return; }
    if (num > 170) { showError('Number too large'); return; }
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    currentInput = String(result);
    updateDisplay();
}

function sin() {
    playClick();
    currentInput = String(Math.round(Math.sin(parseFloat(currentInput)) * 1e10) / 1e10);
    updateDisplay();
}

function cos() {
    playClick();
    currentInput = String(Math.round(Math.cos(parseFloat(currentInput)) * 1e10) / 1e10);
    updateDisplay();
}

function tan() {
    playClick();
    currentInput = String(Math.round(Math.tan(parseFloat(currentInput)) * 1e10) / 1e10);
    updateDisplay();
}

function log() {
    playClick();
    const num = parseFloat(currentInput);
    if (num <= 0) { showError('Invalid input'); return; }
    currentInput = String(Math.round(Math.log10(num) * 1e10) / 1e10);
    updateDisplay();
}

function ln() {
    playClick();
    const num = parseFloat(currentInput);
    if (num <= 0) { showError('Invalid input'); return; }
    currentInput = String(Math.round(Math.log(num) * 1e10) / 1e10);
    updateDisplay();
}

function pi() {
    playClick();
    currentInput = String(Math.PI);
    updateDisplay();
}

function e() {
    playClick();
    currentInput = String(Math.E);
    updateDisplay();
}

function exp() {
    playClick();
    const num = parseFloat(currentInput);
    currentInput = String(Math.round(Math.exp(num) * 1e10) / 1e10);
    updateDisplay();
}

// ===== ERROR =====
function showError(msg) {
    resultEl.textContent = msg;
    resultEl.classList.add('error');
    playClick();
    setTimeout(() => {
        resultEl.classList.remove('error');
        currentInput = '0';
        updateDisplay();
    }, 1500);
}

// ===== SAVE TO HISTORY =====
async function saveToHistory() {
    if (!lastResult) return;

    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Saving...';

    try {
        const response = await fetch(`${API_URL}/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lastResult)
        });

        if (!response.ok) throw new Error('Save failed');

        saveBtn.textContent = '✅ Saved!';
        saveBtn.classList.add('saved');
        showToast('Saved to history!');

        setTimeout(() => {
            saveBtn.textContent = '💾 Save to History';
            saveBtn.classList.remove('saved');
        }, 1500);

        loadHistory();
    } catch (err) {
        saveBtn.textContent = '❌ Failed';
        showToast('Failed to save', true);
        console.error(err);
        setTimeout(() => {
            saveBtn.textContent = '💾 Save to History';
            saveBtn.disabled = false;
        }, 1500);
    }
}

// ===== LOAD HISTORY =====
async function loadHistory() {
    try {
        const response = await fetch(`${API_URL}/history`);
        const history = await response.json();
        allHistory = history;
        renderHistory(history);
        updateStats();
    } catch (err) {
        historyList.innerHTML = '<li class="empty-state">⚠ Backend not reachable</li>';
    }
}

function renderHistory(history) {
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<li class="empty-state">No calculations yet</li>';
        return;
    }

    const symbols = {
        add: '+', subtract: '−', multiply: '×', divide: '÷',
        sqrt: '√', power: '²', reciprocal: '1/', percent: '%'
    };

    history.forEach(item => {
        const li = document.createElement('li');
        const symbol = symbols[item.operation] || item.operation;
        const resultStr = formatNumber(item.result);
        const firstStr = formatNumber(item.firstNumber);
        const secondStr = formatNumber(item.secondNumber);
        const isFav = favorites.includes(item.id);

        if (isFav) li.classList.add('favorite');

        let expression;
        if (['sqrt', 'power', 'reciprocal', 'percent'].includes(item.operation)) {
            if (item.operation === 'sqrt') expression = `√${firstStr}`;
            else if (item.operation === 'power') expression = `${firstStr}²`;
            else if (item.operation === 'reciprocal') expression = `1/${firstStr}`;
            else if (item.operation === 'percent') expression = `${firstStr}%`;
        } else {
            expression = `${firstStr} ${symbol} ${secondStr}`;
        }

        li.innerHTML = `
            <div class="expression-text">${expression}</div>
            <div class="result-text">= ${resultStr}</div>
        `;

        li.addEventListener('click', () => {
            currentInput = String(item.result);
            updateDisplay();
            showToast('Result loaded!');
        });

        historyList.appendChild(li);
    });
}

// ===== STATS =====
function updateStats() {
    document.getElementById('totalCount').textContent = allHistory.length;
    document.getElementById('favoritesCount').textContent = favorites.length;

    const today = new Date().toDateString();
    const todayCount = allHistory.filter(h => {
        return new Date(h.createdAt).toDateString() === today;
    }).length;
    document.getElementById('todayCount').textContent = todayCount;
}

// ===== FAVORITE =====
function toggleFavorite() {
    if (!lastResult) return;
    const id = lastResult.id;
    if (!id) { showToast('Save first!', true); return; }

    const index = favorites.indexOf(id);
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Removed from favorites');
    } else {
        favorites.push(id);
        showToast('Added to favorites!');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadHistory();
}

// ===== CLEAR HISTORY =====
async function clearHistory() {
    if (!confirm('Clear all history? This cannot be undone.')) return;

    try {
        await fetch(`${API_URL}/history`, { method: 'DELETE' });
        favorites = [];
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadHistory();
        showToast('History cleared!');
    } catch (err) {
        showToast('Failed to clear', true);
    }
}

// ===== COPY RESULT =====
function copyResult() {
    navigator.clipboard.writeText(currentInput).then(() => {
        showToast('Copied!');
    }).catch(() => {
        showToast('Copy failed', true);
    });
}

// ===== EXPORT CSV =====
function exportCSV() {
    if (allHistory.length === 0) {
        showToast('No history to export', true);
        return;
    }

    let csv = 'ID,First Number,Second Number,Operation,Result,Date\n';
    allHistory.forEach(item => {
        csv += `${item.id},${item.firstNumber},${item.secondNumber},${item.operation},${item.result},${item.createdAt}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculator-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported!');
}

// ===== SEARCH =====
function searchHistory() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        renderHistory(allHistory);
        return;
    }

    const filtered = allHistory.filter(item => {
        const text = `${item.firstNumber} ${item.operation} ${item.secondNumber} ${item.result}`.toLowerCase();
        return text.includes(query);
    });
    renderHistory(filtered);
}

// ===== THEME TOGGLE =====
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeToggle.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// ===== SOUND TOGGLE =====
function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    localStorage.setItem('sound', soundEnabled);
}

// ===== MODE SWITCHING =====
function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.mode === mode);
    });
    document.getElementById('basicKeypad').style.display = mode === 'basic' ? 'grid' : 'none';
    document.getElementById('scientificKeypad').style.display = mode === 'scientific' ? 'grid' : 'none';
}

// ===== EVENT LISTENERS =====

// Number/Operation buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const num = btn.dataset.num;
        const op = btn.dataset.op;
        const action = btn.dataset.action;

        if (num !== undefined) inputNumber(num);
        else if (op !== undefined) inputOperation(op);
        else {
            switch (action) {
                case 'clear': clearAll(); break;
                case 'backspace': backspace(); break;
                case 'percent': percent(); break;
                case 'sign': toggleSign(); break;
                case 'decimal': inputDecimal(); break;
                case 'equals': handleEquals(); break;
                case 'sqrt': sqrt(); break;
                case 'power': power(); break;
                case 'reciprocal': reciprocal(); break;
                case 'factorial': factorial(); break;
                case 'sin': sin(); break;
                case 'cos': cos(); break;
                case 'tan': tan(); break;
                case 'log': log(); break;
                case 'ln': ln(); break;
                case 'pi': pi(); break;
                case 'e': e(); break;
                case 'exp': exp(); break;
            }
        }

        btn.classList.add('ripple');
        setTimeout(() => btn.classList.remove('ripple'), 500);
    });
});

// Mode tabs
document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => switchMode(tab.dataset.mode));
});

// Top actions
themeToggle.addEventListener('click', toggleTheme);
soundToggle.addEventListener('click', toggleSound);
exportBtn.addEventListener('click', exportCSV);
copyBtn.addEventListener('click', copyResult);
saveBtn.addEventListener('click', saveToHistory);
favoriteBtn.addEventListener('click', toggleFavorite);
clearHistoryBtn.addEventListener('click', clearHistory);
searchInput.addEventListener('input', searchHistory);

// Keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;

    if (/^[0-9]$/.test(key)) { e.preventDefault(); inputNumber(key); }
    else if (key === '.') { e.preventDefault(); inputDecimal(); }
    else if (key === '+') { e.preventDefault(); inputOperation('add'); }
    else if (key === '-') { e.preventDefault(); inputOperation('subtract'); }
    else if (key === '*') { e.preventDefault(); inputOperation('multiply'); }
    else if (key === '/') { e.preventDefault(); inputOperation('divide'); }
    else if (key === 'Enter' || key === '=') { e.preventDefault(); handleEquals(); }
    else if (key === 'Escape') { e.preventDefault(); clearAll(); }
    else if (key === 'Backspace') { e.preventDefault(); backspace(); }
    else if (key === '%') { e.preventDefault(); percent(); }
});

// ===== INITIAL LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.textContent = '☀️';
    }

    // Load saved sound
    if (localStorage.getItem('sound') === 'false') {
        soundEnabled = false;
        soundToggle.textContent = '🔇';
    }

    updateDisplay();
    loadHistory();
});