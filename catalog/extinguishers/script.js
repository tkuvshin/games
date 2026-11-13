const room = document.getElementById('room');
const inventoryItems = document.querySelectorAll('.extinguisher');
const statusPanel = document.getElementById('status');
const scoreEl = document.getElementById('score');
const remainingEl = document.getElementById('remaining');
const checkBtn = document.getElementById('checkBtn');

let score = 0;
let placedCount = 0;
const targetCount = 2;

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
  
  // Пол начинается с 30px от низа. Считаем высоту от пола.
  // Условно: 100px = 1 метр (тогда 1.5 метра = 150px)
  const heightInPixels = 400 - 30 - y; 
  const heightMeters = heightInPixels / 100; 
  
  if (heightMeters > 1.5) {
    showStatus(`❌ Нарушение! Вешать выше 1.5 м нельзя. (Высота: ${heightMeters.toFixed(1)} м)`, 'error');
    return;
  }
  
  // Проверка на дверь (дверь от 30px до 210px от низа, центр около 120px)
  if (x > rect.width * 0.4 - 20 && x < rect.width * 0.4 + 100 && y > 400 - 210 && y < 400 - 30) {
    showStatus(`❌ Нарушение! Нельзя ставить прямо на дверной проем.`, 'error');
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
  showStatus(`✅ Поставлен на высоте ${heightMeters.toFixed(1)} м. Осталось: ${targetCount - placedCount}`, 'success');
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
    showStatus('Выбран! Тапните по стене.', 'info');
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
    score += 50;
    updateUI();
    showStatus('🎉 Задание выполнено! Вы заработали 50 очков. Игра пройдена!', 'success');
    checkBtn.textContent = 'Игра пройдена!';
    checkBtn.style.background = '#2e7d32';
    checkBtn.disabled = true;
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

updateUI();
