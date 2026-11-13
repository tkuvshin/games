const room = document.getElementById('room');
const inventoryItems = document.querySelectorAll('.extinguisher');
const statusPanel = document.getElementById('status');

function placeExtinguisher(data, x, y) {
  const rect = room.getBoundingClientRect();
  
  // Высота от пола (линия пола находится на 40px от низа)
  const heightInPixels = 400 - 40 - y; 
  const heightMeters = heightInPixels * 0.01; // условно 1px = 1 см (3.6 метра - 360px)
  
  const maxAllowedHeight = data.weight < 15 ? 1.5 : 1.0;
  
  if (heightMeters > maxAllowedHeight) {
    showStatus(`❌ Нарушение! Огнетушитель весом ${data.weight} кг нельзя вешать выше ${maxAllowedHeight} м. (Текущая: ${heightMeters.toFixed(1)} м)`, 'error');
    return;
  }
  
  // Проверка на дверь (дверь теперь на 40px от низа)
  const distanceToDoor = Math.sqrt(Math.pow(x - (rect.width * 0.4 + 40), 2) + Math.pow(y - (400 - 40), 2));
  if (distanceToDoor < 50) {
    showStatus(`❌ Нарушение! Нельзя ставить огнетушитель прямо на дверь.`, 'error');
    return;
  }

  const el = document.createElement('div');
  el.className = 'placed';
  el.textContent = '🧯';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  
  el.addEventListener('click', (e) => { 
    e.stopPropagation();
    el.remove(); 
    showStatus('Огнетушитель убран.', 'info'); 
  });
  
  room.appendChild(el);
  showStatus(`✅ Отлично! Огнетушитель на высоте ${heightMeters.toFixed(1)} м — это соответствует нормам.`, 'success');
}

// Логика для ПК
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

// Логика для мобильных
let selectedItem = null;
inventoryItems.forEach(item => {
  item.addEventListener('click', () => {
    inventoryItems.forEach(i => i.style.borderColor = '#fdecea');
    item.style.borderColor = '#e53935';
    selectedItem = { type: item.dataset.type, weight: item.dataset.weight };
    showStatus('Теперь тапните по комнате, чтобы поставить огнетушитель.', 'info');
  });
});

room.addEventListener('click', (e) => {
  if (!selectedItem) return;
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
