// Original p5.js brush interaction source from CODE.docx.
// Kept as a standalone source file so the Word document can be removed later.
// This file is not loaded by index.html; the live browser implementation is in ../script.js.

let img;

let stamps = [];

let lastMouseX = 0;
let lastMouseY = 0;

// Grid pixel size.
let pixelSize = 25;

// Desired canvas size.
let canvasW = 2200;
let canvasH = 1600;

// Brush settings. These values are rounded to pixelSize multiples.
let brushWidth = 5 * pixelSize;
let brushHeight = 5 * pixelSize;

// How long each stamp remains.
let stampLife = 20;

// Spacing between stamps along movement.
let stampSpacing = 20;

// Glitch settings.
let glitchBlockCount = 3;
let glitchAlphaStrength = 0.5;

function preload() {
  img = loadImage("plants_neg.png");
}

function setup() {
  pixelDensity(1);

  canvasW = floor(canvasW / pixelSize) * pixelSize;
  canvasH = floor(canvasH / pixelSize) * pixelSize;

  createCanvas(canvasW, canvasH);
  noSmooth();
  noStroke();

  img.resize(width, height);

  brushWidth = floor(brushWidth / pixelSize) * pixelSize;
  brushHeight = floor(brushHeight / pixelSize) * pixelSize;

  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function draw() {
  background(10);

  image(img, 0, 0);

  if (mouseInsideCanvas()) {
    let d = dist(mouseX, mouseY, lastMouseX, lastMouseY);

    if (d > 0.5) {
      addStroke(lastMouseX, lastMouseY, mouseX, mouseY);
    }
  }

  drawStamps();

  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function addStroke(x1, y1, x2, y2) {
  let d = dist(x1, y1, x2, y2);
  let steps = max(1, floor(d / stampSpacing));

  for (let i = 0; i <= steps; i += 1) {
    let t = i / steps;

    let x = lerp(x1, x2, t);
    let y = lerp(y1, y2, t);

    stamps.push({
      x: x,
      y: y,
      w: brushWidth,
      h: brushHeight,
      pixel: pixelSize,
      life: stampLife,
      maxLife: stampLife,
    });
  }
}

function drawStamps() {
  for (let i = stamps.length - 1; i >= 0; i -= 1) {
    let s = stamps[i];

    let fade = s.life / s.maxLife;
    let alpha = 255 * fade;

    pixelateStamp(s.x, s.y, s.w, s.h, s.pixel, alpha, fade);

    s.life -= 1;

    if (s.life <= 0) {
      stamps.splice(i, 1);
    }
  }
}

function pixelateStamp(cx, cy, w, h, pixelStep, alpha, fade) {
  let x = floor((cx - w / 2) / pixelStep) * pixelStep;
  let y = floor((cy - h / 2) / pixelStep) * pixelStep;

  x = constrain(x, 0, width - w);
  y = constrain(y, 0, height - h);

  let sw = w;
  let sh = h;

  if (sw <= 0 || sh <= 0) return;

  let patch = img.get(x, y, sw, sh);

  let smallW = sw / pixelStep;
  let smallH = sh / pixelStep;

  patch.resize(smallW, smallH);

  push();
  tint(255, alpha);
  image(patch, x, y, sw, sh);
  pop();

  drawGlitchPixels(x, y, sw, sh, pixelStep, alpha, fade);
}

function drawGlitchPixels(x, y, sw, sh, pixelStep, alpha, fade) {
  let cols = sw / pixelStep;
  let rows = sh / pixelStep;

  let cells = [];

  for (let col = 0; col < cols; col += 1) {
    for (let row = 0; row < rows; row += 1) {
      cells.push({ col, row });
    }
  }

  shuffle(cells, true);

  let count = min(floor(glitchBlockCount * fade), cells.length);

  for (let i = 0; i < count; i += 1) {
    let cell = cells[i];

    let gx = x + cell.col * pixelStep;
    let gy = y + cell.row * pixelStep;

    let useNeon = random() < 0.6;

    if (useNeon) {
      let neonColors = [
        [255, 0, 180],
        [80, 255, 120],
        [0, 0, 0],
      ];

      let chosen = random(neonColors);

      fill(chosen[0], chosen[1], chosen[2], alpha * glitchAlphaStrength);
    } else {
      let c = img.get(gx, gy);

      fill(red(c), green(c), blue(c), alpha * 0.55);
    }

    rect(gx, gy, pixelStep, pixelStep);
  }
}

function mouseInsideCanvas() {
  return mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height;
}
