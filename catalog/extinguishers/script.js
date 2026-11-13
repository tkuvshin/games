const room = document.getElementById('room');
const inventoryItems = document.querySelectorAll('.extinguisher');
const statusPanel = document.getElementById('status');
const scoreEl = document.getElementById('score');
const remainingEl = document.getElementById('remaining');
const checkBtn = document.getElementById('checkBtn');

let score = 0;
let placedCount = 0;
const targetCount = 2; // Нужно поставить 2 штуки

function updateUI() {
  scoreEl.textContent = score;
  remainingEl.textContent = targetCount - placedCount;
}

function placeExtinguisher(data, x, y) {
  if (placedCount >= targetCount) {
    showStatus('✅ Вы уже поставили все огнетушители. Нажмите "Проверить".', 'info');
    return;
  }

  const rect = room.getBoundingClientRect();
  const heightInPixels = 400 - 40 - y; 
  const heightMeters = heightInPixels * 0.01; 
  const maxAllowedHeight = 1.5; 
  
  if (heightMeters > maxAllowedHeight) {
    showStatus(`❌ Нарушение! Вешать выше 1.5 м нельзя. (Высота: ${heightMeters.toFixed(1)} м)`, 'error');
    return;
  }
  
  const distanceToDoor = Math.sqrt(Math.pow(x - (rect.width * 0.4 + 40), 2) + Math.pow(y - (400 - 40), 2));
  if (distanceToDoor < 50) {
    showStatus(`❌ Нарушение! Нельзя ставить прямо на дверь.`, 'error');
    return;
  }

  const el = document.createElement('div');
  el.className = 'placed';
  el.textContent = '🧯';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  
  el.addEventListener('pointerdown', (e) => { 
    e.stopPropagation();
    el.remove(); 
    placedCount--;
    updateUI();
    showStatus('Огнетушитель убран.', 'info'); 
  });
  
  room.appendChild(el);
  placedCount++;
  updateUI();
  showStatus(`✅ Поставлен. Осталось: ${targetCount - placedCount}`, 'success');
}

// --- ПК (Drag and Drop) ---
inventoryItems.forEach(item => {
  item.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: item.dataset.type, weight: item.dataset.weight }));
  });
});

room.addEventListener('dragover', (e) => e.preventDefault());

room.addEventListener('drop', (e) => {
  e.preventDefault();
  const dataStr = e.dataTransfer.getData('text/plain');
  if (!dataStr) return;
  placeExtinguisher(JSON.parse(dataStr), e.clientX - room.getBoundingClientRect().left, e.clientY - room.getBoundingClientRect().top);
});

// --- Мобильные (Тапы) ---
let selectedItem = null;
inventoryItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    inventoryItems.forEach(i => i.style.borderColor = '#fdecea');
    item.style.borderColor = '#e53935';
    selectedItem = { type: item.dataset.type, weight: item.dataset.weight };
    showStatus('Выбран! Тапните по комнате.', 'info');
  });
});

room.addEventListener('pointerup', (e) => {
  if (!selectedItem || e.target.classList.contains('placed')) return;
  placeExtinguisher(selectedItem, e.clientX - room.getBoundingClientRect().left, e.clientY - room.getBoundingClientRect().top);
  selectedItem = null;
  inventoryItems.forEach(i => i.style.borderColor = '#fdecea');
});

// --- Проверка ---
checkBtn.addEventListener('click', () => {
  if (placedCount === 0) {
    showStatus('❌ Вы ничего не поставили!', 'error');
    return;
  }
  
  if (placedCount === targetCount) {
    score += 50; // Даем 50 очков за выполнение
    updateUI();
    showStatus('🎉 Задание выполнено! Вы заработали 50 очков. Игра пройдена!', 'success');
    checkBtn.textContent = 'Игра пройдена!';
    checkBtn.style.background = '#2e7d32'; // Зеленая
    checkBtn.disabled = true; // Блокируем кнопку
  } else {
    showStatus(`❌ Вы поставили только ${placedCount} из ${targetCount} огнетушителей.`, 'error');
  }
});

function showStatus(msg, type) {
  statusPanel.textContent = msg;
  statusPanel.className = 'status-panel';
  if (type === 'error') statusPanel.style.color = '#e53935';
  else if (type === 'success') statusPanel.style.color = '#2e7d32';
  else statusPanel.style.color = '#6b7a90';
}

// Инициализация
updateUI();
