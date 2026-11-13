const canvas = document.getElementById('canvas');
const contentLayer = document.getElementById('content-layer');
const clearBtn = document.getElementById('clearBtn');

// --- Логика Drag & Drop для ПК ---
document.querySelectorAll('.tool').forEach(tool => {
  tool.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: tool.dataset.type,
      sign: tool.dataset.sign
    }));
  });
});

canvas.addEventListener('dragover', (e) => e.preventDefault());

canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  const dataStr = e.dataTransfer.getData('text/plain');
  if (!dataStr) return;
  const data = JSON.parse(dataStr);
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (data.type === 'wall-h' || data.type === 'wall-v') {
    createWall(x, y, data.type);
  } else if (data.type === 'sign') {
    createSign(x, y, data.sign);
  }
});

// --- Создание стены ---
function createWall(x, y, orientation) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "wall-group");
  
  // Сама стена (прямоугольник)
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("class", "wall");
  
  if (orientation === 'wall-h') {
    rect.setAttribute("width", "100");
    rect.setAttribute("height", "6"); // Фиксированная толщина (4 мм условно)
  } else {
    rect.setAttribute("width", "6");
    rect.setAttribute("height", "100");
  }
  
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  
  // Маркер для удлинения (маленький кружок на конце)
  const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  handle.setAttribute("class", "resize-handle");
  handle.setAttribute("r", "6");
  
  if (orientation === 'wall-h') {
    handle.setAttribute("cx", x + 100);
    handle.setAttribute("cy", y + 3);
  } else {
    handle.setAttribute("cx", x + 3);
    handle.setAttribute("cy", y + 100);
  }

  g.appendChild(rect);
  g.appendChild(handle);
  contentLayer.appendChild(g);
  
  // Логика перемещения стены
  rect.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = parseFloat(rect.getAttribute("x"));
    const origY = parseFloat(rect.getAttribute("y"));

    function onMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      rect.setAttribute("x", origX + dx);
      rect.setAttribute("y", origY + dy);
      
      // Двигаем ручку вместе со стеной
      if (orientation === 'wall-h') {
        handle.setAttribute("cx", origX + dx + 100);
        handle.setAttribute("cy", origY + dy + 3);
      } else {
        handle.setAttribute("cx", origX + dx + 3);
        handle.setAttribute("cy", origY + dy + 100);
      }
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });

  // Логика удлинения стены (за ручку)
  handle.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    
    const initialWidth = parseFloat(rect.getAttribute("width"));
    const initialHeight = parseFloat(rect.getAttribute("height"));

    function onMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      if (orientation === 'wall-h') {
        const newWidth = Math.max(20, initialWidth + dx); // Минимум 20px
        rect.setAttribute("width", newWidth);
        handle.setAttribute("cx", parseFloat(rect.getAttribute("x")) + newWidth);
      } else {
        const newHeight = Math.max(20, initialHeight + dy);
        rect.setAttribute("height", newHeight);
        handle.setAttribute("cy", parseFloat(rect.getAttribute("y")) + newHeight);
      }
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
}

// --- Создание знака ---
function createSign(x, y, signType) {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("class", "sign");
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  
  // Тут мы пока используем эмодзи, потом заменим на твои SVG-знаки
  let symbol = '❓';
  if (signType === 'exit') symbol = '🚪';
  if (signType === 'extinguisher') symbol = '🧯';
  if (signType === 'phone') symbol = '📞';
  
  text.textContent = symbol;
  contentLayer.appendChild(text);

  // Перемещение знака
  text.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = parseFloat(text.getAttribute("x"));
    const origY = parseFloat(text.getAttribute("y"));

    function onMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      text.setAttribute("x", origX + dx);
      text.setAttribute("y", origY + dy);
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
}

// Очистка холста
clearBtn.addEventListener('click', () => {
  contentLayer.innerHTML = '';
});
