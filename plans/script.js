const canvas = document.getElementById('canvas');
const contentLayer = document.getElementById('content-layer');
const clearBtn = document.getElementById('clearBtn');

const GRID_SIZE = 40;

function snap(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

document.querySelectorAll('.tool').forEach(tool => {
  tool.addEventListener('click', () => {
    const type = tool.dataset.type;
    const sign = tool.dataset.sign;
    
    const centerX = snap(canvas.clientWidth / 2);
    const centerY = snap(canvas.clientHeight / 2);

    if (type === 'wall-h' || type === 'wall-v') {
      createWall(centerX, centerY, type);
    } else if (type === 'sign') {
      createSign(centerX, centerY, sign);
    }
  });
});

// ... (функция createWall остается без изменений, не трогаем её) ...
function createWall(x, y, orientation) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("class", "wall");
  
  if (orientation === 'wall-h') {
    rect.setAttribute("width", GRID_SIZE * 2); 
    rect.setAttribute("height", "6");
  } else {
    rect.setAttribute("width", "6");
    rect.setAttribute("height", GRID_SIZE * 2);
  }
  
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  
  const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  handle.setAttribute("class", "resize-handle");
  handle.setAttribute("r", "6");
  
  if (orientation === 'wall-h') {
    handle.setAttribute("cx", x + GRID_SIZE * 2);
    handle.setAttribute("cy", y + 3);
  } else {
    handle.setAttribute("cx", x + 3);
    handle.setAttribute("cy", y + GRID_SIZE * 2);
  }

  g.appendChild(rect);
  g.appendChild(handle);
  contentLayer.appendChild(g);
  
  rect.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = parseFloat(rect.getAttribute("x"));
    const origY = parseFloat(rect.getAttribute("y"));

    function onMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newX = snap(origX + dx);
      const newY = snap(origY + dy);
      
      rect.setAttribute("x", newX);
      rect.setAttribute("y", newY);
      
      if (orientation === 'wall-h') {
        handle.setAttribute("cx", newX + parseFloat(rect.getAttribute("width")));
        handle.setAttribute("cy", newY + 3);
      } else {
        handle.setAttribute("cx", newX + 3);
        handle.setAttribute("cy", newY + parseFloat(rect.getAttribute("height")));
      }
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });

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
        let newWidth = initialWidth + dx;
        newWidth = Math.max(GRID_SIZE, snap(newWidth)); 
        rect.setAttribute("width", newWidth);
        handle.setAttribute("cx", parseFloat(rect.getAttribute("x")) + newWidth);
      } else {
        let newHeight = initialHeight + dy;
        newHeight = Math.max(GRID_SIZE, snap(newHeight));
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

// --- ОБНОВЛЕННАЯ ФУНКЦИЯ СОЗДАНИЯ ЗНАКА ---
function createSign(x, y, signType) {
  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  
  // Если это огнетушитель, используем наш SVG-файл
  if (signType === 'extinguisher') {
    image.setAttribute("href", "extinguisher.svg");
  } else {
    // Для остальных пока заглушка (или можно добавить другие SVG)
    image.setAttribute("href", "extinguisher.svg"); 
  }
  
  image.setAttribute("class", "sign-img");
  image.setAttribute("x", x - 15); // Центрируем по клику
  image.setAttribute("y", y - 15);
  image.setAttribute("width", "30");
  image.setAttribute("height", "30");
  image.setAttribute("style", "cursor: move;");

  contentLayer.appendChild(image);

  image.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = parseFloat(image.getAttribute("x"));
    const origY = parseFloat(image.getAttribute("y"));

    function onMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      image.setAttribute("x", snap(origX + dx));
      image.setAttribute("y", snap(origY + dy));
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
}

clearBtn.addEventListener('click', () => {
  contentLayer.innerHTML = '';
});
