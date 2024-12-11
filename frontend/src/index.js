// Connect to the backend Socket.io server
const socket = io("http://127.0.0.1:5000");

// Get the necessary DOM elements
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const drawTool = document.getElementById('drawTool');
const eraseTool = document.getElementById('eraseTool');
const clearCanvasButton = document.getElementById('clearCanvas');
const colorPicker = document.getElementById('colorPicker');
const drawSizeSlider = document.getElementById('drawSize');
const eraseSizeSlider = document.getElementById('eraseSize');

// Initialize drawing parameters
let drawing = false;
let erasing = false;
let drawingColor = '#000000'; // Default color is black
let lineWidth = 5; // Default line width for drawing
let eraseWidth = 10; // Default erase width
let lastX = 0;
let lastY = 0;

// Set canvas dimensions
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.7;

// Set the initial stroke style (color) and line width for drawing
ctx.strokeStyle = drawingColor;
ctx.lineWidth = lineWidth;

// Fetch canvas state from the server on connection
socket.on("canvasState", (state) => {
  console.log("Received canvas state:", state);
  if (state) {
    state.forEach((action) => {
      if (action.type === "draw") {
        ctx.beginPath();
        ctx.moveTo(action.x1, action.y1);
        ctx.lineTo(action.x2, action.y2);
        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.width;
        ctx.stroke();
        ctx.closePath();
      } else if (action.type === "erase") {
        ctx.clearRect(action.x1 - action.width / 2, action.y1 - action.width / 2, action.width, action.width);
      } else if (action.type === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
  }
});

// Event listener for mouse down (start drawing or erasing)
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

// Event listener for mouse move (draw or erase while moving the mouse)
canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;

  const [currentX, currentY] = [e.offsetX, e.offsetY];

  if (erasing) {
    // Erase functionality
    ctx.clearRect(currentX - eraseWidth / 2, currentY - eraseWidth / 2, eraseWidth, eraseWidth);

    // Emit erase event
    socket.emit("draw", {
      type: "erase",
      x1: currentX,
      y1: currentY,
      width: eraseWidth
    });
  } else {
    // Drawing functionality
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    ctx.closePath();

    // Emit draw event
    socket.emit("draw", {
      type: "draw",
      x1: lastX,
      y1: lastY,
      x2: currentX,
      y2: currentY,
      color: drawingColor,
      width: lineWidth
    });
  }

  [lastX, lastY] = [currentX, currentY];
});

// Event listener for mouse up (end drawing or erasing)
canvas.addEventListener('mouseup', () => {
  drawing = false;
});

// Event listener for color picker
colorPicker.addEventListener('input', (e) => {
  drawingColor = e.target.value;
  ctx.strokeStyle = drawingColor; // Change the drawing color
});

// Event listener for draw tool
drawTool.addEventListener('click', () => {
  erasing = false;
  drawTool.classList.add('active');
  eraseTool.classList.remove('active');
});

// Event listener for erase tool
eraseTool.addEventListener('click', () => {
  erasing = true;
  eraseTool.classList.add('active');
  drawTool.classList.remove('active');
});

// Event listener for clear button
clearCanvasButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  // Emit clear event
  socket.emit("draw", { type: "clear" });
});

// Adjust tool sizes based on slider values
drawSizeSlider.addEventListener('input', () => {
  lineWidth = drawSizeSlider.value;
  ctx.lineWidth = lineWidth;
});

eraseSizeSlider.addEventListener('input', () => {
  eraseWidth = eraseSizeSlider.value;
});

// Listen for draw events from the server
socket.on("draw", (data) => {
  if (data.type === "draw") {
    ctx.beginPath();
    ctx.moveTo(data.x1, data.y1);
    ctx.lineTo(data.x2, data.y2);
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width;
    ctx.stroke();
    ctx.closePath();
  } else if (data.type === "erase") {
    ctx.clearRect(data.x1 - data.width / 2, data.y1 - data.width / 2, data.width, data.width);
  } else if (data.type === "clear") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});
