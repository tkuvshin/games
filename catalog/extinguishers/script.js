const room = document.getElementById('room');
const inventoryItems = document.querySelectorAll('.extinguisher');
const statusPanel = document.getElementById('status');

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
  
  const heightMeters = (400 - y) * 0.0075; 
  const maxAllowedHeight = data.weight < 15 ? 1.5 : 1.0;
  
  if (heightMeters > maxAllowedHeight) {
    showStatus(`❌ Нарушение! Огнетушитель весом ${data.weight} кг нельзя вешать выше ${maxAllowedHeight} м от пола. (Текущая: ${heightMeters.toFixed(1)} м)`, 'error');
    return;
  }
  
  const distanceToDoor = Math.sqrt(Math.pow(x - (rect.width * 0.4 + 40), 2) + Math.pow(y - 400, 2));
  if (distanceToDoor < 40) {
    showStatus(`❌ Нарушение! Огнетушитель мешает проходу (слишком близко к двери).`, 'error');
    return;
  }

  const el = document.createElement('div');
  el.className = 'placed';
  el.textContent = '🧯';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  
  el.addEventListener('click', () => { el.remove(); showStatus('Огнетушитель убран.', 'info'); });
  
  room.appendChild(el);
  showStatus(`✅ Огнетушитель установлен на высоте ${heightMeters.toFixed(1)} м. Доступен, не мешает эвакуации.`, 'success');
});

function showStatus(msg, type) {
  statusPanel.textContent = msg;
  statusPanel.className = 'status-panel';
  if (type === 'error') statusPanel.style.color = '#e53935';
  else if (type === 'success') statusPanel.style.color = '#2e7d32';
  else statusPanel.style.color = '#6b7a90';
}
