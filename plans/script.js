const canvas = document.getElementById('canvas');
const contentLayer = document.getElementById('content-layer');
const clearBtn = document.getElementById('clearBtn');

// --- Клик по инструменту -> появление элемента на холсте ---
document.querySelectorAll('.tool').forEach(tool => {
  tool.addEventListener('click', () => {
    const type = tool.dataset.type;
    const sign = tool.dataset.sign;

    // Центр холста (с небольшим смещением, чтобы элементы не накладывались друг на друга)
    const centerX = canvas.clientWidth / 2 + (Math.random() * 100 - 50);
    const centerY = canvas.clientHeight / 2 + (Math.random() * 100 - 50);

    if (type === 'wall-h' || type === 'wall-v') {
      createWall(centerX, centerY, type);
    } else if (type === 'sign') {
      createSign(centerX, centerY, sign);
    }
  });
});

// --- Создание стены ---
function createWall(x, y, orientation) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "wall-group");
  
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("class", "wall");
  
  if (orientation === 'wall-h') {
    rect.setAttribute("width", "100");
    rect.setAttribute("height", "6"); // Толщина 6px
  } else {
    rect.setAttribute("width", "6");
    rect.setAttribute("height", "100");
  }
  
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  
  // Маркер для удлинения
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
  
  // 1. Перемещение всей стены
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
      
      if (orientation === 'wall-h') {
        handle.setAttribute("cx", origX + dx + parseFloat(rect.getAttribute("width")));
        handle.setAttribute("cy", origY + dy + 3);
      } else {
        handle.setAttribute("cx", origX + dx + 3);
        handle.setAttribute("cy", origY + dy + parseFloat(rect.getAttribute("height")));
      }
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });

  // 2. Удлинение стены за ручку
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
        const newWidth = Math.max(20, initialWidth + dx);
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
