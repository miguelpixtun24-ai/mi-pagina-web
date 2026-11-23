/* ==========================================================
   LÓGICA INTERACTIVA (JAVASCRIPT) - ESTUDIO DE DIBUJO
   
   ¿Para qué sirve este archivo?
   JavaScript es el motor. Detecta cuando el usuario hace clic,
   arrastra el ratón o mueve el dedo, y le dice al <canvas>
   exactamente qué trazo dibujar pixel por pixel.
   ========================================================== */

// ----------------------------------------------------------
// PASO 1: SELECCIONAR ELEMENTOS DEL HTML
// Usamos 'document.getElementById' para conectar nuestras etiquetas 
// de HTML con variables que JavaScript pueda manipular.
// ----------------------------------------------------------
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d'); // 'ctx' significa "Contexto 2D": es nuestro pincel digital

const colorPicker = document.getElementById('colorPicker');
const brushSizeInput = document.getElementById('brushSize');
const brushSizeDisplay = document.getElementById('brushSizeDisplay');
const brushPreviewDot = document.getElementById('brushPreviewDot');
const eraserBtn = document.getElementById('eraserBtn');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');

// ----------------------------------------------------------
// PASO 2: VARIABLES DE ESTADO
// Guardan en memoria qué está pasando en cada instante:
// ¿Se está presionando el ratón? ¿Qué color y tamaño están activos?
// ----------------------------------------------------------
let isDrawing = false;           // true cuando se mantiene pulsado el clic, false al soltar
let lastX = 0;                   // última posición horizontal del cursor
let lastY = 0;                   // última posición vertical del cursor

let currentColor = colorPicker.value;
let currentSize = brushSizeInput.value;
let isEraserActive = false;      // ¿estamos borrando o pintando?

// Inicializar el lienzo con un fondo blanco sólido
// (Si no hacemos esto, al descargar la imagen tendría fondo transparente)
function initializeCanvasBackground() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
initializeCanvasBackground();

// ----------------------------------------------------------
// PASO 3: FUNCIÓN PARA OBTENER COORDENADAS EXACTAS
// Dado que la pantalla puede cambiar de tamaño, 'getBoundingClientRect'
// calcula la posición exacta dentro del lienzo sin importar la resolución.
// ----------------------------------------------------------
function getCoordinates(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  // Si es un evento táctil (pantalla de celular o tablet)
  if (event.touches && event.touches.length > 0) {
    return {
      x: (event.touches[0].clientX - rect.left) * scaleX,
      y: (event.touches[0].clientY - rect.top) * scaleY
    };
  }

  // Si es un evento de ratón estándar
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

// ----------------------------------------------------------
// PASO 4: FUNCIONES PRINCIPALES DE DIBUJO
// ----------------------------------------------------------

// Iniciar el trazo cuando se presiona el botón del ratón o se toca la pantalla
function startDrawing(e) {
  isDrawing = true;
  const coords = getCoordinates(e);
  lastX = coords.x;
  lastY = coords.y;

  // Dibuja un punto incluso si el usuario solo hace un clic rápido sin arrastrar
  draw(e);
}

// Dibujar una línea continua mientras se mueve el cursor
function draw(e) {
  if (!isDrawing) return; // Si no está presionado el ratón, no hacemos nada

  const coords = getCoordinates(e);

  // Configuración del pincel
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);       // Desde dónde venía el trazo
  ctx.lineTo(coords.x, coords.y); // Hacia dónde se movió el cursor

  // Si el borrador está activo, pintamos con blanco; si no, con el color elegido
  ctx.strokeStyle = isEraserActive ? '#ffffff' : currentColor;
  ctx.lineWidth = currentSize;
  ctx.lineCap = 'round';          // Extremos redondeados para que el trazo sea suave y orgánico
  ctx.lineJoin = 'round';         // Esquinas redondeadas en giros rápidos

  ctx.stroke();                   // ¡Pintar la línea!

  // Actualizar la última posición
  lastX = coords.x;
  lastY = coords.y;
}

// Detener el trazo al soltar el ratón o salir del lienzo
function stopDrawing() {
  isDrawing = false;
}

// ----------------------------------------------------------
// PASO 5: ESCUCHAR LOS EVENTOS DEL RATÓN Y PANTALLA TÁCTIL
// Los "Event Listeners" son vigilantes que esperan una acción del usuario
// ----------------------------------------------------------

// Eventos de ratón de computadora
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Eventos táctiles para dispositivos móviles
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Evita que la pantalla se desplace al intentar dibujar
  startDrawing(e);
});
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  draw(e);
});
canvas.addEventListener('touchend', stopDrawing);

// ----------------------------------------------------------
// PASO 6: CONTROLES DE LA BARRA DE HERRAMIENTAS
// ----------------------------------------------------------

// 1. Cambio de Color
colorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
  // Si estábamos usando el borrador, lo desactivamos al elegir un nuevo color
  if (isEraserActive) {
    toggleEraser(false);
  }
  updatePreviewDot();
});

// 2. Control del Grosor del Pincel (Slider)
brushSizeInput.addEventListener('input', (e) => {
  currentSize = e.target.value;
  // Actualizar el texto numérico (ej. "14 px")
  brushSizeDisplay.textContent = `${currentSize} px`;
  // Actualizar el círculo de previsualización visual
  updatePreviewDot();
});

// Función para actualizar el punto de muestra del tamaño del pincel
function updatePreviewDot() {
  brushPreviewDot.style.width = `${Math.min(currentSize, 28)}px`;
  brushPreviewDot.style.height = `${Math.min(currentSize, 28)}px`;
  brushPreviewDot.style.backgroundColor = isEraserActive ? '#94a3b8' : currentColor;
}

// 3. Alternar Modo Borrador
function toggleEraser(forceState = null) {
  isEraserActive = forceState !== null ? forceState : !isEraserActive;
  
  if (isEraserActive) {
    eraserBtn.classList.add('active');
    eraserBtn.innerHTML = '<span class="icon">✏️</span> Pincel';
  } else {
    eraserBtn.classList.remove('active');
    eraserBtn.innerHTML = '<span class="icon">🧽</span> Borrador';
  }
  updatePreviewDot();
}

eraserBtn.addEventListener('click', () => toggleEraser());

// 4. Limpiar todo el lienzo
clearBtn.addEventListener('click', () => {
  const confirmClear = confirm('¿Quieres borrar todo el dibujo y empezar de nuevo?');
  if (confirmClear) {
    // Limpia y restablece el fondo blanco
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initializeCanvasBackground();
  }
});

// 5. Guardar el dibujo como imagen PNG
saveBtn.addEventListener('click', () => {
  // Convertir el contenido del lienzo en una URL de datos de imagen PNG
  const imageURL = canvas.toDataURL('image/png');

  // Creamos un enlace temporal invisible en HTML para descargar automáticamente
  const downloadLink = document.createElement('a');
  downloadLink.href = imageURL;
  downloadLink.download = 'mi-dibujo.png'; // Nombre del archivo descargado
  
  // Simulamos un clic en el enlace para iniciar la descarga
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
});

// Configuración inicial de la vista previa del pincel
updatePreviewDot();
