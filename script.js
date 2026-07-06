const body = document.body;
const brandConditionHotspot = document.querySelector(".brand-condition-hotspot");
const contactTrigger = document.querySelector(".contact-trigger");
const contactClose = document.querySelector(".contact-close");
const contactPanel = document.querySelector(".contact-panel");
const presentationTrigger = document.querySelector(".presentation-trigger");
const pdfModal = document.querySelector(".pdf-modal");
const pdfClose = document.querySelector(".pdf-close");
const greenhouseSwitch = document.querySelector(".greenhouse-switch");
const categories = document.querySelector(".categories");
const categoryArrows = document.querySelectorAll(".category-arrow");
const categoryText = document.querySelector(".category-text");
const categoryKicker = categoryText.querySelector(".kicker");
const categoryCopy = categoryText.querySelector("p:not(.kicker)");
const categoryImage = document.querySelector(".category-visual img");
const marketThumbs = document.querySelectorAll(".market-thumb");

const categoryData = [
  {
    label: "// PLANTS",
    copy:
      "A tropical room built as a living technological ecosystem. Organic plant forms are intertwined with cables that grow like vines, while liquids flow through them like an artificial life system. With dense vegetation, glowing structures and immersive light, the space feels like a tropical forest reimagined through technology.",
    image: "ASSETS/categories_1_cut.png",
    alt: "Cable-like tropical leaf",
  },
  {
    label: "// SPORES",
    copy:
      "A dark, bioluminescent room exploring fungi, mycelium and hidden growth systems. The space uses glowing textures, soft sound and layered organic forms to reveal the quiet processes happening beneath the surface.",
    image: "ASSETS/categories_2_cut.png",
    alt: "Layered glowing spore form",
  },
  {
    label: "// CROPS",
    copy:
      "A futuristic lab for cultivated produce, combining robotic farming, automated systems and 3D-printed fruits. Surrounded by mechanical arms, controlled lighting and artificial growing structures, the space imagines a future where agriculture is shaped by precision, technology and production.",
    image: "ASSETS/categories_3_cut.png",
    alt: "Futuristic cultivated crop form",
  },
];

function setContact(open) {
  body.classList.toggle("contact-open", open);
  contactTrigger.setAttribute("aria-expanded", String(open));
  contactPanel.setAttribute("aria-hidden", String(!open));
}

function setPresentation(open) {
  body.classList.toggle("pdf-open", open);
  pdfModal.hidden = !open;
  pdfModal.setAttribute("aria-hidden", String(!open));

  if (open) {
    setContact(false);
  }
}

contactTrigger.addEventListener("click", () => {
  setContact(!body.classList.contains("contact-open"));
});

contactClose.addEventListener("click", () => {
  setContact(false);
});

presentationTrigger.addEventListener("click", (event) => {
  event.preventDefault();
  setPresentation(true);
});

pdfClose.addEventListener("click", () => {
  setPresentation(false);
});

pdfModal.addEventListener("click", (event) => {
  if (event.target === pdfModal) {
    setPresentation(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setContact(false);
    setPresentation(false);
  }
});

brandConditionHotspot.addEventListener("mouseenter", () => {
  body.classList.add("condition-visible");
});

brandConditionHotspot.addEventListener("mouseleave", () => {
  body.classList.remove("condition-visible");
});

greenhouseSwitch.addEventListener(
  "mouseenter",
  () => {
    greenhouseSwitch.classList.add("is-lit");
  },
  { once: true }
);

let activeCategory = 0;
let categoryAnimating = false;
let categoryAnimationRun = 0;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const categoryImagePreloads = new Map();

function wrapCategory(index) {
  return (index + categoryData.length) % categoryData.length;
}

function waitForImage(image) {
  if (image.complete) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });
}

function preloadCategoryImage(src) {
  if (!categoryImagePreloads.has(src)) {
    const image = new Image();
    image.decoding = "async";
    image.src = src;
    categoryImagePreloads.set(src, waitForImage(image));
  }

  return categoryImagePreloads.get(src);
}

categoryData.forEach(({ image }) => {
  preloadCategoryImage(image);
});

async function setCategory(index, direction) {
  const nextIndex = wrapCategory(index);

  if (categoryAnimating || nextIndex === activeCategory) {
    return;
  }

  const scrollLeft = window.scrollX;
  const scrollTop = window.scrollY;
  categoryAnimating = true;
  const animationRun = ++categoryAnimationRun;
  const category = categoryData[nextIndex];
  const offset = direction > 0 ? -64 : 64;
  const shouldAnimate =
    !reduceMotion.matches && typeof categoryImage.animate === "function";

  categoryImage.getAnimations().forEach((animation) => animation.cancel());
  categoryImage.style.opacity = "1";
  categoryImage.style.transform = "translate3d(0, 0, 0) scale(1)";

  try {
    await preloadCategoryImage(category.image);

    if (categoryKicker && categoryCopy) {
      categoryKicker.textContent = category.label;
      categoryCopy.textContent = category.copy;
    }

    if (shouldAnimate) {
      const outgoing = categoryImage.animate(
        [
          { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
          {
            opacity: 0,
            transform: `translate3d(${offset}px, 0, 0) scale(0.985)`,
          },
        ],
        {
          duration: 190,
          easing: "cubic-bezier(0.55, 0, 0.45, 1)",
          fill: "forwards",
        }
      );

      await outgoing.finished.catch(() => {});
      categoryImage.style.opacity = "0";
      categoryImage.style.transform = `translate3d(${-offset}px, 0, 0) scale(1.01)`;
      categoryImage.getAnimations().forEach((animation) => animation.cancel());
    }

    categoryImage.src = category.image;
    categoryImage.alt = category.alt;
    activeCategory = nextIndex;
    categories.dataset.active = String(nextIndex);
    window.scrollTo(scrollLeft, scrollTop);

    if (shouldAnimate) {
      const incoming = categoryImage.animate(
        [
          {
            opacity: 0,
            transform: `translate3d(${-offset}px, 0, 0) scale(1.01)`,
          },
          { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
        ],
        {
          duration: 420,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both",
        }
      );

      incoming.finished
        .catch(() => {})
        .then(() => {
          if (activeCategory === nextIndex && categoryAnimationRun === animationRun) {
            categoryImage.style.opacity = "1";
            categoryImage.style.transform = "translate3d(0, 0, 0) scale(1)";
            categoryImage.getAnimations().forEach((animation) =>
              animation.cancel()
            );
          }
        });
    } else {
      categoryImage.style.opacity = "1";
      categoryImage.style.transform = "translate3d(0, 0, 0) scale(1)";
    }

    window.requestAnimationFrame(() => {
      window.scrollTo(scrollLeft, scrollTop);
    });
  } finally {
    categoryAnimating = false;
  }
}

categoryArrows.forEach((arrow) => {
  arrow.addEventListener("pointerdown", (event) => {
    event.preventDefault();
  });

  arrow.addEventListener("click", (event) => {
    event.preventDefault();
    const direction = Number(arrow.dataset.direction);
    setCategory(activeCategory + direction, direction);
  });
});

marketThumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    marketThumbs.forEach((item) => item.classList.remove("is-active"));
    thumb.classList.add("is-active");
  });
});

const canvas = document.querySelector(".pixel-canvas");
const hero = document.querySelector(".hero-stage");
const heroImage = document.querySelector(".hero-plants");
const ctx = canvas.getContext("2d", { alpha: true });
const sourceImage = new Image();
const stamps = [];
const patchCanvas = document.createElement("canvas");
const patchCtx = patchCanvas.getContext("2d", { willReadFrequently: true });

let lastMouseX = 0;
let lastMouseY = 0;
let pixelSize = 23.75;
let canvasW = 2200;
let canvasH = 1600;
let brushWidth = 5 * pixelSize;
let brushHeight = 5 * pixelSize;
let stampLife = 20;
let stampSpacing = 20;
let glitchBlockCount = 3;
let glitchAlphaStrength = 0.5;
let imageGeometry = null;
let animationFrame = null;
let ambientFrame = null;
let nextAmbientSpawn = 0;
let isHeroImageHovered = false;

const ambientBrushes = [];

const glitchColors = [
  [252, 6, 178],
  [0, 255, 115],
  [0, 0, 0],
];

sourceImage.src = heroImage.currentSrc || heroImage.src;

function resizeCanvas() {
  const rect = hero.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  canvasW = Math.floor(rect.width / pixelSize) * pixelSize;
  canvasH = Math.floor(rect.height / pixelSize) * pixelSize;
  canvas.width = Math.max(pixelSize, Math.round(rect.width * ratio));
  canvas.height = Math.max(pixelSize, Math.round(rect.height * ratio));
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.imageSmoothingEnabled = false;

  const heroRect = hero.getBoundingClientRect();
  const imageRect = heroImage.getBoundingClientRect();
  imageGeometry = {
    displayLeft: imageRect.left - heroRect.left,
    displayTop: imageRect.top - heroRect.top,
    displayW: imageRect.width,
    displayH: imageRect.height,
    naturalW: sourceImage.naturalWidth || heroImage.naturalWidth || 1,
    naturalH: sourceImage.naturalHeight || heroImage.naturalHeight || 1,
  };

  brushWidth = Math.floor(brushWidth / pixelSize) * pixelSize;
  brushHeight = Math.floor(brushHeight / pixelSize) * pixelSize;
  stamps.length = 0;
  ctx.clearRect(0, 0, rect.width, rect.height);
}

function toCanvasPoint(event) {
  const rect = hero.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function mouseInsideCanvas(x, y) {
  const rect = hero.getBoundingClientRect();
  return x >= 0 && x < rect.width && y >= 0 && y < rect.height;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getImageBounds() {
  if (!imageGeometry) {
    return null;
  }

  return {
    left: imageGeometry.displayLeft,
    top: imageGeometry.displayTop,
    right: imageGeometry.displayLeft + imageGeometry.displayW,
    bottom: imageGeometry.displayTop + imageGeometry.displayH,
  };
}

function clampToImage(point) {
  const bounds = getImageBounds();

  if (!bounds) {
    return point;
  }

  return {
    x: clampStamp(point.x, bounds.left, bounds.right),
    y: clampStamp(point.y, bounds.top, bounds.bottom),
  };
}

function addStroke(x1, y1, x2, y2, strokeLife = stampLife) {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(1, Math.floor(distance / stampSpacing));

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    stamps.push({
      x: x1 + (x2 - x1) * t,
      y: y1 + (y2 - y1) * t,
      w: brushWidth,
      h: brushHeight,
      pixel: pixelSize,
      life: strokeLife,
      maxLife: strokeLife,
    });
  }
}

function clampStamp(value, min, max) {
  if (max <= min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function isPlantPixel(sample) {
  if (sample[3] <= 24) {
    return false;
  }

  const isDarkBackdrop = sample[0] < 26 && sample[1] < 42 && sample[2] < 68;
  return !isDarkBackdrop;
}

function pixelateStamp(cx, cy, width, height, pixelStep, alpha, fade) {
  if (!imageGeometry) {
    return;
  }

  const cols = Math.max(1, Math.floor(width / pixelStep));
  const rows = Math.max(1, Math.floor(height / pixelStep));
  const sw = cols * pixelStep;
  const sh = rows * pixelStep;
  const minX = Math.max(0, Math.ceil(imageGeometry.displayLeft / pixelStep) * pixelStep);
  const minY = Math.max(0, Math.ceil(imageGeometry.displayTop / pixelStep) * pixelStep);
  const maxX = Math.min(
    canvasW - sw,
    Math.floor((imageGeometry.displayLeft + imageGeometry.displayW - sw) / pixelStep) *
      pixelStep
  );
  const maxY = Math.min(
    canvasH - sh,
    Math.floor((imageGeometry.displayTop + imageGeometry.displayH - sh) / pixelStep) *
      pixelStep
  );

  let x = Math.floor((cx - sw / 2) / pixelStep) * pixelStep;
  let y = Math.floor((cy - sh / 2) / pixelStep) * pixelStep;
  x = clampStamp(x, minX, maxX);
  y = clampStamp(y, minY, maxY);

  const sourceX = ((x - imageGeometry.displayLeft) / imageGeometry.displayW) * imageGeometry.naturalW;
  const sourceY = ((y - imageGeometry.displayTop) / imageGeometry.displayH) * imageGeometry.naturalH;
  const sourceW = (sw / imageGeometry.displayW) * imageGeometry.naturalW;
  const sourceH = (sh / imageGeometry.displayH) * imageGeometry.naturalH;

  patchCanvas.width = cols;
  patchCanvas.height = rows;
  patchCtx.clearRect(0, 0, cols, rows);
  patchCtx.imageSmoothingEnabled = true;
  patchCtx.drawImage(sourceImage, sourceX, sourceY, sourceW, sourceH, 0, 0, cols, rows);

  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;

  for (let col = 0; col < cols; col += 1) {
    for (let row = 0; row < rows; row += 1) {
      let sample;

      try {
        sample = patchCtx.getImageData(col, row, 1, 1).data;
      } catch (error) {
        continue;
      }

      if (!isPlantPixel(sample)) {
        continue;
      }

      ctx.drawImage(
        patchCanvas,
        col,
        row,
        1,
        1,
        x + col * pixelStep,
        y + row * pixelStep,
        pixelStep,
        pixelStep
      );
    }
  }

  ctx.globalAlpha = 1;

  drawGlitchPixels(x, y, cols, rows, pixelStep, alpha, fade);
}

function drawGlitchPixels(x, y, cols, rows, pixelStep, alpha, fade) {
  const cells = [];

  for (let col = 0; col < cols; col += 1) {
    for (let row = 0; row < rows; row += 1) {
      let sample;

      try {
        sample = patchCtx.getImageData(col, row, 1, 1).data;
      } catch (error) {
        continue;
      }

      if (!isPlantPixel(sample)) {
        continue;
      }

      cells.push({ col, row });
    }
  }

  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const count = Math.min(Math.floor(glitchBlockCount * fade), cells.length);

  for (let i = 0; i < count; i += 1) {
    const cell = cells[i];
    const gx = x + cell.col * pixelStep;
    const gy = y + cell.row * pixelStep;
    let color;

    if (Math.random() < 0.6) {
      color = glitchColors[Math.floor(Math.random() * glitchColors.length)];
    } else {
      try {
        const sample = patchCtx.getImageData(cell.col, cell.row, 1, 1).data;
        color = [sample[0], sample[1], sample[2]];
      } catch (error) {
        color = glitchColors[Math.floor(Math.random() * glitchColors.length)];
      }
    }

    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${
      glitchAlphaStrength * alpha
    })`;
    ctx.fillRect(gx, gy, pixelStep, pixelStep);
  }
}

function drawStamps() {
  for (let i = stamps.length - 1; i >= 0; i -= 1) {
    const stamp = stamps[i];
    const fade = stamp.life / stamp.maxLife;

    pixelateStamp(stamp.x, stamp.y, stamp.w, stamp.h, stamp.pixel, fade, fade);
    stamp.life -= 1;

    if (stamp.life <= 0) {
      stamps.splice(i, 1);
    }
  }
}

function canvasToSourcePoint(x, y) {
  if (
    !imageGeometry ||
    x < imageGeometry.displayLeft ||
    y < imageGeometry.displayTop ||
    x > imageGeometry.displayLeft + imageGeometry.displayW ||
    y > imageGeometry.displayTop + imageGeometry.displayH
  ) {
    return null;
  }

  return {
    x: Math.floor(((x - imageGeometry.displayLeft) / imageGeometry.displayW) * imageGeometry.naturalW),
    y: Math.floor(((y - imageGeometry.displayTop) / imageGeometry.displayH) * imageGeometry.naturalH),
  };
}

function isPlantPoint(x, y) {
  const point = canvasToSourcePoint(x, y);

  if (!point || !sourceImage.complete || !sourceImage.naturalWidth) {
    return false;
  }

  patchCanvas.width = 1;
  patchCanvas.height = 1;
  patchCtx.clearRect(0, 0, 1, 1);

  try {
    patchCtx.drawImage(sourceImage, point.x, point.y, 1, 1, 0, 0, 1, 1);
    return isPlantPixel(patchCtx.getImageData(0, 0, 1, 1).data);
  } catch (error) {
    return false;
  }
}

function findRandomPlantPoint() {
  const bounds = getImageBounds();

  if (!bounds) {
    return null;
  }

  for (let i = 0; i < 48; i += 1) {
    const point = {
      x: randomBetween(bounds.left, bounds.right),
      y: randomBetween(bounds.top, bounds.bottom),
    };

    if (isPlantPoint(point.x, point.y)) {
      return point;
    }
  }

  return {
    x: randomBetween(bounds.left, bounds.right),
    y: randomBetween(bounds.top, bounds.bottom),
  };
}

function findNearbyPlantPoint(origin, radius) {
  const bounds = getImageBounds();

  if (!bounds) {
    return null;
  }

  for (let i = 0; i < 36; i += 1) {
    const angle = randomBetween(0, Math.PI * 2);
    const distance = randomBetween(pixelSize * 3, radius);
    const point = clampToImage({
      x: origin.x + Math.cos(angle) * distance,
      y: origin.y + Math.sin(angle) * distance,
    });

    if (isPlantPoint(point.x, point.y)) {
      return point;
    }
  }

  return clampToImage({
    x: origin.x + randomBetween(-radius, radius),
    y: origin.y + randomBetween(-radius, radius),
  });
}

function buildAmbientPath(start, target) {
  const bounds = getImageBounds();

  if (!bounds) {
    return { segments: [], totalLength: 0 };
  }

  const points = [start];
  const waypointCount = Math.floor(randomBetween(1, 4));
  const stepRadius = pixelSize * randomBetween(3.6, 7.4);
  let current = start;
  let axis = Math.random() < 0.5 ? "x" : "y";

  function pushPoint(point) {
    const previous = points[points.length - 1];

    if (Math.hypot(point.x - previous.x, point.y - previous.y) >= pixelSize * 1.5) {
      points.push(point);
      current = point;
    }
  }

  for (let i = 0; i < waypointCount; i += 1) {
    const point =
      axis === "x"
        ? clampToImage({ x: current.x + randomBetween(-stepRadius, stepRadius), y: current.y })
        : clampToImage({ x: current.x, y: current.y + randomBetween(-stepRadius, stepRadius) });

    pushPoint(point);
    axis = axis === "x" ? "y" : "x";
  }

  pushPoint(axis === "x" ? { x: target.x, y: current.y } : { x: current.x, y: target.y });
  pushPoint(target);

  const segments = [];
  let totalLength = 0;

  for (let i = 1; i < points.length; i += 1) {
    const from = points[i - 1];
    const to = points[i];
    const length = Math.hypot(to.x - from.x, to.y - from.y);

    if (length < pixelSize) {
      continue;
    }

    segments.push({
      from,
      to,
      start: totalLength,
      end: totalLength + length,
      length,
    });
    totalLength += length;
  }

  return { segments, totalLength };
}

function pointOnAmbientSegment(segment, distance) {
  const segmentProgress = clampStamp((distance - segment.start) / segment.length, 0, 1);

  return {
    x: segment.from.x + (segment.to.x - segment.from.x) * segmentProgress,
    y: segment.from.y + (segment.to.y - segment.from.y) * segmentProgress,
  };
}

function addAmbientPathStroke(segments, fromDistance, toDistance, strokeLife) {
  for (const segment of segments) {
    if (segment.end < fromDistance) {
      continue;
    }

    if (segment.start > toDistance) {
      break;
    }

    const startDistance = clampStamp(fromDistance, segment.start, segment.end);
    const endDistance = clampStamp(toDistance, segment.start, segment.end);

    if (endDistance <= startDistance) {
      continue;
    }

    const from = pointOnAmbientSegment(segment, startDistance);
    const to = pointOnAmbientSegment(segment, endDistance);
    addStroke(from.x, from.y, to.x, to.y, strokeLife);
  }
}

function spawnAmbientBrush() {
  if (ambientBrushes.length >= 2 || isHeroImageHovered || reduceMotion.matches) {
    return;
  }

  const point = findRandomPlantPoint();
  const target = point ? findNearbyPlantPoint(point, pixelSize * randomBetween(5.4, 9.8)) : null;

  if (!point || !target) {
    return;
  }

  const path = buildAmbientPath(point, target);

  if (!path.totalLength) {
    return;
  }

  ambientBrushes.push({
    segments: path.segments,
    totalLength: path.totalLength,
    distance: 0,
    startedAt: performance.now(),
    duration: clampStamp(path.totalLength / randomBetween(1.1, 1.8), 420, 980),
    strokeLife: stampLife * 1.55,
  });
}

function updateAmbientBrushes(now) {
  if (document.hidden || reduceMotion.matches || isHeroImageHovered) {
    ambientBrushes.length = 0;
    nextAmbientSpawn = now + randomBetween(1000, 2000);
    return;
  }

  if (!nextAmbientSpawn) {
    nextAmbientSpawn = now + randomBetween(1000, 2000);
  }

  if (now >= nextAmbientSpawn) {
    spawnAmbientBrush();
    nextAmbientSpawn = now + randomBetween(1000, 2000);
  }

  for (let i = ambientBrushes.length - 1; i >= 0; i -= 1) {
    const brush = ambientBrushes[i];
    const progress = Math.min(1, (now - brush.startedAt) / brush.duration);
    const previousDistance = brush.distance;
    const nextDistance = brush.totalLength * progress;

    addAmbientPathStroke(brush.segments, previousDistance, nextDistance, brush.strokeLife);
    brush.distance = nextDistance;

    if (progress >= 1) {
      ambientBrushes.splice(i, 1);
    }
  }

  if (ambientBrushes.length) {
    scheduleBrush();
  }
}

function runAmbientBrush(now) {
  updateAmbientBrushes(now);
  ambientFrame = requestAnimationFrame(runAmbientBrush);
}

function startAmbientBrush() {
  if (!ambientFrame && !reduceMotion.matches) {
    ambientFrame = requestAnimationFrame(runAmbientBrush);
  }
}

function renderBrush() {
  const rect = hero.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  drawStamps();
  animationFrame = stamps.length ? requestAnimationFrame(renderBrush) : null;
}

function scheduleBrush() {
  if (!animationFrame && !reduceMotion.matches) {
    animationFrame = requestAnimationFrame(renderBrush);
  }
}

heroImage.addEventListener("pointerenter", (event) => {
  isHeroImageHovered = true;
  ambientBrushes.length = 0;
  const point = toCanvasPoint(event);
  lastMouseX = point.x;
  lastMouseY = point.y;
});

heroImage.addEventListener("pointermove", (event) => {
  const point = toCanvasPoint(event);

  if (!mouseInsideCanvas(point.x, point.y)) {
    return;
  }

  const distance = Math.hypot(point.x - lastMouseX, point.y - lastMouseY);

  if (distance > 0.5) {
    addStroke(lastMouseX, lastMouseY, point.x, point.y);
  }

  lastMouseX = point.x;
  lastMouseY = point.y;
  scheduleBrush();
});

heroImage.addEventListener("pointerleave", () => {
  isHeroImageHovered = false;
  nextAmbientSpawn = performance.now() + randomBetween(1000, 2000);
  lastMouseX = 0;
  lastMouseY = 0;
});

sourceImage.addEventListener("load", () => {
  resizeCanvas();
  startAmbientBrush();
});

window.addEventListener("load", () => {
  resizeCanvas();
  startAmbientBrush();
});

window.addEventListener("resize", resizeCanvas);

if (sourceImage.complete) {
  resizeCanvas();
  startAmbientBrush();
}
