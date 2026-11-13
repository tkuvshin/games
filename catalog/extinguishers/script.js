const room = document.getElementById('room');
const inventoryItems = document.querySelectorAll('.extinguisher');
const statusPanel = document.getElementById('status');

function placeExtinguisher(data, x, y) {
  const rect = room.getBoundingClientRect();
  
  // Высота от пола (линия пола на 40px от низа)
  const heightInPixels = 400 - 40 - y; 
  const heightMeters = heightInPixels * 0.01; 
  const maxAllowedHeight = data.weight < 15 ? 1.5 : 1.0;
  
  if (heightMeters > maxAllowedHeight) {
    showStatus(`❌ Нарушение! Вешать выше ${maxAllowedHeight} м нельзя. (Высота: ${heightMeters.toFixed(1)} м)`, 'error');
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
  
  // Удаление по клику/тапу
  el.addEventListener('pointerdown', (e) => { 
    e.stopPropagation();
    el.remove(); 
    showStatus('Огнетушитель убран.', 'info'); 
  });
  
  room.appendChild(el);
  showStatus(`✅ Установлен на высоте ${heightMeters.toFixed(1)} м. Доступен!`, 'success');
}

// --- ДЛЯ ПК (Мышка) ---
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
  const data = JSON.parse(dataStr);
  const rect = room.getBoundingClientRect();
  placeExtinguisher(data, e.clientX - rect.left, e.clientY - rect.top);
});

// --- ДЛЯ МОБИЛЬНЫХ (Тапы) ---
let selectedItem = null;

inventoryItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault(); // Отменяем стандартное поведение
    inventoryItems.forEach(i => i.style.borderColor = '#fdecea');
    item.style.borderColor = '#e53935'; // Выделяем красным
    selectedItem = { type: item.dataset.type, weight: item.dataset.weight };
    showStatus('Огнетушитель выбран! Теперь тапните по комнате.', 'info');
  });
});

// Используем pointerup для надежности на мобильных
room.addEventListener('pointerup', (e) => {
  if (!selectedItem) return;
  
  // Если ткнули в уже поставленный огнетушитель — не ставим новый
  if (e.target.classList.contains('placed')) return;

  const rect = room.getBoundingClientRect();
  placeExtinguisher(selectedItem, e.clientX - rect.left, e.clientY - rect.top);
  
  selectedItem = null;
  inventoryItems.forEach(i => i.style.borderColor = '#fdecea');
});

function showStatus(msg, type) {
  statusPanel.textContent = msg;
  statusPanel.className = 'status-panel';
  if (type === 'error') statusPanel.style.color = '#e53935';
  else if (type === 'success') statusPanel.style.color = '#2e7d32';
  else statusPanel.style.color = '#6b7a90';
}
