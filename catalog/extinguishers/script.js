const room = document.getElementById('room');
const inventoryItems = document.querySelectorAll('.extinguisher');
const statusPanel = document.getElementById('status');

// Функция проверки и установки
function placeExtinguisher(data, x, y) {
  const rect = room.getBoundingClientRect();
  
  // Проверка высоты (400px = условно 3 метра. 1px = 0.0075м)
  const heightMeters = (400 - y) * 0.0075; 
  const maxAllowedHeight = data.weight < 15 ? 1.5 : 1.0;
  
  if (heightMeters > maxAllowedHeight) {
    showStatus(`❌ Нарушение! Огнетушитель весом ${data.weight} кг нельзя вешать выше ${maxAllowedHeight} м. (Текущая: ${heightMeters.toFixed(1)} м)`, 'error');
    return;
  }
  
  // Проверка расстояния до двери
  const distanceToDoor = Math.sqrt(Math.pow(x - (rect.width * 0.4 + 40), 2) + Math.pow(y - 400, 2));
  if (distanceToDoor < 40) {
    showStatus(`❌ Нарушение! Огнетушитель мешает проходу (слишком близко к двери).`, 'error');
    return;
  }

  // Установка
  const el = document.createElement('div');
  el.className = 'placed';
  el.textContent = '🧯';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  
  el.addEventListener('click', (e) => { 
    e.stopPropagation(); // Чтобы клик не проваливался в комнату
    el.remove(); 
    showStatus('Огнетушитель убран.', 'info'); 
  });
  
  room.appendChild(el);
  showStatus(`✅ Огнетушитель установлен на высоте ${heightMeters.toFixed(1)} м.`, 'success');
}

// 1. Логика для ПК (Drag and Drop)
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
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  placeExtinguisher(data, x, y);
});

// 2. Логика для мобильных (Нажатие на склад)
let selectedItem = null;
inventoryItems.forEach(item => {
  item.addEventListener('click', () => {
    // Визуально выделяем выбранный
    inventoryItems.forEach(i => i.style.borderColor = '#fdecea');
    item.style.borderColor = '#e53935';
    selectedItem = { type: item.dataset.type, weight: item.dataset.weight };
    showStatus('Теперь нажмите на комнату, чтобы поставить огнетушитель.', 'info');
  });
});

room.addEventListener('click', (e) => {
  if (!selectedItem) return;
  
  const rect = room.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  placeExtinguisher(selectedItem, x, y);
  
  // Сбрасываем выбор
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
