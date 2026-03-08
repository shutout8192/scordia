import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "images", "listening");

const W = 800, H = 600;

// ─── Color helpers ───
function gradient(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [pos, color] of stops) g.addColorStop(pos, color);
  return g;
}
function radGrad(ctx, cx, cy, r, stops) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  for (const [pos, color] of stops) g.addColorStop(pos, color);
  return g;
}

// ─── Drawing helpers ───
function drawSky(ctx, color1 = "#87ceeb", color2 = "#b0e0f0") {
  ctx.fillStyle = gradient(ctx, 0, 0, 0, H * 0.55, [[0, color1], [1, color2]]);
  ctx.fillRect(0, 0, W, H * 0.55);
}
function drawCloud(ctx, cx, cy, s = 1) {
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 40 * s, 16 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(cx - 25 * s, cy + 5 * s, 25 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 28 * s, cy + 3 * s, 28 * s, 13 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}
function drawSun(ctx, x = 680, y = 70) {
  ctx.fillStyle = radGrad(ctx, x, y, 50, [[0, "#fff7a0"], [0.4, "#fbbf24"], [1, "rgba(251,191,36,0)"]]);
  ctx.beginPath(); ctx.arc(x, y, 50, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2); ctx.fill();
}
function drawIndoorFloor(ctx, color = "#d4c5a9") {
  ctx.fillStyle = gradient(ctx, 0, H * 0.55, 0, H, [[0, color], [1, darken(color, 20)]]);
  ctx.fillRect(0, H * 0.55, W, H * 0.45);
}
function drawWall(ctx, color = "#f5f0e6") {
  ctx.fillStyle = gradient(ctx, 0, 0, 0, H * 0.55, [[0, lighten(color, 10)], [1, color]]);
  ctx.fillRect(0, 0, W, H * 0.55);
}
function drawWindow(ctx, x, y, w = 80, h = 100) {
  ctx.fillStyle = "#a8d8ea";
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.strokeStyle = "white"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
  ctx.strokeStyle = "#c0c0c0"; ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 4); ctx.stroke();
}

// Person with more detail
function drawPerson(ctx, x, y, opts = {}) {
  const { h = 120, gender = "m", pose = "stand", color = "#2563eb", facing = "front", hairColor = "#3b2f1e" } = opts;
  const headR = h * 0.1;
  const bodyW = h * 0.22;
  const bodyH = h * 0.3;
  const legH = h * 0.32;
  const armW = h * 0.06;

  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath(); ctx.ellipse(0, 0, bodyW * 0.8, 6, 0, 0, Math.PI * 2); ctx.fill();

  const topBody = -legH - bodyH;
  const headY = topBody - headR - 3;

  // Legs
  ctx.fillStyle = gender === "f" ? "#1f2937" : "#374151";
  const legW = bodyW * 0.2;
  if (pose === "walk" || pose === "jog") {
    roundRect(ctx, -bodyW * 0.25, -legH - 5, legW, legH + 5, 3); ctx.fill();
    roundRect(ctx, bodyW * 0.08, -legH + 10, legW, legH - 10, 3); ctx.fill();
  } else if (pose === "sit") {
    ctx.fillRect(-bodyW * 0.25, -legH * 0.5, bodyW * 0.5, legW);
    roundRect(ctx, -bodyW * 0.25, -legH * 0.5 + legW - 3, legW, legH * 0.4, 3); ctx.fill();
    roundRect(ctx, bodyW * 0.08, -legH * 0.5 + legW - 3, legW, legH * 0.4, 3); ctx.fill();
  } else {
    roundRect(ctx, -bodyW * 0.25, -legH, legW, legH, 3); ctx.fill();
    roundRect(ctx, bodyW * 0.08, -legH, legW, legH, 3); ctx.fill();
  }

  // Shoes
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(-bodyW * 0.28, -3, legW + 4, 5);
  ctx.fillRect(bodyW * 0.05, -3, legW + 4, 5);

  // Body
  ctx.fillStyle = color;
  roundRect(ctx, -bodyW / 2, topBody, bodyW, bodyH, 5); ctx.fill();

  // Arms
  ctx.fillStyle = color;
  if (pose === "reach") {
    // One arm reaching up
    roundRect(ctx, -bodyW / 2 - armW, topBody - 10, armW, bodyH * 0.8, 3); ctx.fill();
    ctx.save();
    ctx.translate(bodyW / 2, topBody + 5);
    ctx.rotate(-0.8);
    roundRect(ctx, 0, 0, armW, bodyH * 0.7, 3); ctx.fill();
    ctx.restore();
  } else if (pose === "type") {
    ctx.save();
    ctx.translate(-bodyW / 2 - armW, topBody + bodyH * 0.3);
    ctx.rotate(0.6);
    roundRect(ctx, 0, 0, armW, bodyH * 0.6, 3); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(bodyW / 2, topBody + bodyH * 0.3);
    ctx.rotate(-0.6);
    roundRect(ctx, 0, 0, armW, bodyH * 0.6, 3); ctx.fill();
    ctx.restore();
  } else {
    roundRect(ctx, -bodyW / 2 - armW, topBody + 3, armW, bodyH * 0.75, 3); ctx.fill();
    roundRect(ctx, bodyW / 2, topBody + 3, armW, bodyH * 0.75, 3); ctx.fill();
  }

  // Hand (skin)
  ctx.fillStyle = "#e8c4a0";
  ctx.beginPath(); ctx.arc(-bodyW / 2 - armW / 2, topBody + bodyH * 0.8, armW * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(bodyW / 2 + armW / 2, topBody + bodyH * 0.8, armW * 0.6, 0, Math.PI * 2); ctx.fill();

  // Neck
  ctx.fillStyle = "#e8c4a0";
  ctx.fillRect(-4, headY + headR - 1, 8, 5);

  // Head
  ctx.fillStyle = "#e8c4a0";
  ctx.beginPath(); ctx.arc(0, headY, headR, 0, Math.PI * 2); ctx.fill();

  // Hair
  ctx.fillStyle = hairColor;
  if (gender === "f") {
    ctx.beginPath();
    ctx.arc(0, headY - 2, headR + 1, Math.PI, Math.PI * 2);
    ctx.fill();
    // Longer hair sides
    roundRect(ctx, -headR - 2, headY - headR * 0.5, 4, headR * 1.5, 2); ctx.fill();
    roundRect(ctx, headR - 2, headY - headR * 0.5, 4, headR * 1.5, 2); ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, headY - 2, headR + 1, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
  }

  ctx.restore();
}

// Rounded rectangle helper
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Color utilities
function darken(hex, amt) {
  let r = parseInt(hex.slice(1, 3), 16) - amt;
  let g = parseInt(hex.slice(3, 5), 16) - amt;
  let b = parseInt(hex.slice(5, 7), 16) - amt;
  return `rgb(${Math.max(0, r)},${Math.max(0, g)},${Math.max(0, b)})`;
}
function lighten(hex, amt) { return darken(hex, -amt); }

// Object drawers
function drawDesk(ctx, x, y, w = 160, h = 50) {
  // Desktop surface
  ctx.fillStyle = gradient(ctx, x, y, x, y + 10, [[0, "#c8985e"], [1, "#a0752e"]]);
  roundRect(ctx, x, y, w, 10, 3); ctx.fill();
  // Legs
  ctx.fillStyle = "#8B6914";
  ctx.fillRect(x + 8, y + 10, 6, h - 10);
  ctx.fillRect(x + w - 14, y + 10, 6, h - 10);
}

function drawLaptop(ctx, x, y, w = 55) {
  // Screen
  ctx.fillStyle = "#2d3748";
  roundRect(ctx, x, y - w * 0.65, w, w * 0.55, 3); ctx.fill();
  ctx.fillStyle = "#4299e1";
  roundRect(ctx, x + 3, y - w * 0.6, w - 6, w * 0.42, 2); ctx.fill();
  // Lines on screen
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + 8, y - w * 0.55 + i * 12, w - 20, 3);
  }
  // Base
  ctx.fillStyle = "#4a5568";
  roundRect(ctx, x - 5, y, w + 10, 4, 2); ctx.fill();
}

function drawCopyMachine(ctx, x, y, w = 80, h = 130) {
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 5, w * 0.5, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Body
  ctx.fillStyle = gradient(ctx, x, y, x + w, y + h, [[0, "#94a3b8"], [1, "#64748b"]]);
  roundRect(ctx, x, y, w, h, 6); ctx.fill();
  // Top panel
  ctx.fillStyle = "#475569";
  roundRect(ctx, x + 5, y + 5, w - 10, 35, 4); ctx.fill();
  // Scanner glass
  ctx.fillStyle = "#a8d8ea";
  roundRect(ctx, x + 8, y + 8, w - 16, 28, 3); ctx.fill();
  // Control panel
  ctx.fillStyle = "#1e293b";
  roundRect(ctx, x + 10, y + 50, w - 20, 20, 3); ctx.fill();
  // Display
  ctx.fillStyle = "#22d3ee";
  roundRect(ctx, x + 14, y + 53, 30, 14, 2); ctx.fill();
  // Buttons
  ctx.fillStyle = "#ef4444";
  ctx.beginPath(); ctx.arc(x + w - 22, y + 60, 5, 0, Math.PI * 2); ctx.fill();
  // Paper tray
  ctx.fillStyle = "#e2e8f0";
  roundRect(ctx, x + 5, y + h - 30, w - 10, 24, 3); ctx.fill();
  ctx.fillStyle = "white";
  roundRect(ctx, x + 10, y + h - 28, w - 20, 18, 2); ctx.fill();
  // Legs
  ctx.fillStyle = "#374151";
  ctx.fillRect(x + 8, y + h, 6, 15);
  ctx.fillRect(x + w - 14, y + h, 6, 15);
}

function drawTree(ctx, x, y, s = 1) {
  // Trunk
  ctx.fillStyle = "#8B6914";
  roundRect(ctx, x - 6 * s, y - 30 * s, 12 * s, 35 * s, 3); ctx.fill();
  // Canopy layers
  ctx.fillStyle = "#22863a";
  ctx.beginPath(); ctx.arc(x, y - 50 * s, 28 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2ea043";
  ctx.beginPath(); ctx.arc(x - 12 * s, y - 40 * s, 22 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 14 * s, y - 42 * s, 20 * s, 0, Math.PI * 2); ctx.fill();
}

function drawCar(ctx, x, y, w = 100, color = "#3b82f6") {
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + 5, w * 0.45, 6, 0, 0, Math.PI * 2); ctx.fill();
  // Body
  ctx.fillStyle = color;
  roundRect(ctx, x, y - 25, w, 25, 5); ctx.fill();
  // Cabin
  ctx.fillStyle = darken(color, 15);
  roundRect(ctx, x + w * 0.15, y - 45, w * 0.55, 22, 8); ctx.fill();
  // Windows
  ctx.fillStyle = "#bfdbfe";
  roundRect(ctx, x + w * 0.18, y - 42, w * 0.22, 16, 3); ctx.fill();
  roundRect(ctx, x + w * 0.43, y - 42, w * 0.22, 16, 3); ctx.fill();
  // Wheels
  ctx.fillStyle = "#1f2937";
  ctx.beginPath(); ctx.arc(x + w * 0.2, y, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w * 0.8, y, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#9ca3af";
  ctx.beginPath(); ctx.arc(x + w * 0.2, y, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w * 0.8, y, 5, 0, Math.PI * 2); ctx.fill();
  // Headlights
  ctx.fillStyle = "#fbbf24";
  roundRect(ctx, x + w - 5, y - 20, 5, 8, 2); ctx.fill();
}

function drawChair(ctx, x, y, w = 40, h = 50) {
  ctx.fillStyle = "#6b7280";
  roundRect(ctx, x, y, w, 8, 3); ctx.fill();
  roundRect(ctx, x, y - h * 0.6, w, h * 0.6, 4); ctx.fill();
  ctx.fillRect(x + 4, y + 8, 5, h * 0.35);
  ctx.fillRect(x + w - 9, y + 8, 5, h * 0.35);
}

function drawTable(ctx, x, y, w = 140, h = 8) {
  ctx.fillStyle = gradient(ctx, x, y, x, y + h, [[0, "#a0752e"], [1, "#8B6914"]]);
  roundRect(ctx, x, y, w, h, 3); ctx.fill();
  ctx.fillStyle = "#78350f";
  ctx.fillRect(x + 6, y + h, 5, 40);
  ctx.fillRect(x + w - 11, y + h, 5, 40);
}

function drawBookshelf(ctx, x, y, w = 80, h = 160) {
  ctx.fillStyle = "#a0752e";
  roundRect(ctx, x, y, w, h, 3); ctx.fill();
  const cols = ["#dc2626", "#2563eb", "#16a34a", "#eab308", "#9333ea", "#ea580c", "#0891b2", "#be185d"];
  for (let row = 0; row < 4; row++) {
    const shelfY = y + 4 + row * (h / 4);
    const shelfH = h / 4;
    ctx.fillStyle = "#8B6914";
    ctx.fillRect(x + 2, shelfY + shelfH - 4, w - 4, 4);
    for (let i = 0; i < 7; i++) {
      const bw = 6 + Math.random() * 4;
      const bh = shelfH - 12 + Math.random() * 6;
      ctx.fillStyle = cols[(row * 7 + i) % cols.length];
      roundRect(ctx, x + 4 + i * (w - 8) / 7, shelfY + shelfH - 4 - bh, bw, bh, 1);
      ctx.fill();
    }
  }
}

function drawUmbrella(ctx, cx, y, color = "#ef4444") {
  ctx.fillStyle = "#78350f";
  ctx.fillRect(cx - 2, y, 4, 80);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - 50, y);
  ctx.quadraticCurveTo(cx, y - 45, cx + 50, y);
  ctx.fill();
  // Stripe
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.moveTo(cx - 15, y);
  ctx.quadraticCurveTo(cx, y - 42, cx + 15, y);
  ctx.fill();
}

// ─── Scene generators ───
const scenes = {
  lp1_001(ctx) { // Woman near copy machine
    drawWall(ctx, "#f0ead6");
    drawIndoorFloor(ctx, "#d4c5a9");
    drawWindow(ctx, 80, 60, 90, 120);
    drawWindow(ctx, 220, 60, 90, 120);
    drawCopyMachine(ctx, 500, 200, 100, 150);
    drawPerson(ctx, 420, H * 0.88, { h: 140, gender: "f", color: "#ec4899", pose: "stand" });
  },
  lp1_002(ctx) { // Two men shaking hands in conference room
    drawWall(ctx, "#eee8d8");
    drawIndoorFloor(ctx, "#c8b898");
    drawWindow(ctx, 300, 40, 200, 130);
    drawTable(ctx, 250, 340, 300);
    drawChair(ctx, 270, 370);
    drawChair(ctx, 480, 370);
    drawPerson(ctx, 360, H * 0.88, { h: 140, gender: "m", color: "#1e40af", pose: "stand" });
    drawPerson(ctx, 470, H * 0.88, { h: 140, gender: "m", color: "#374151", pose: "stand" });
    // Handshake
    ctx.fillStyle = "#e8c4a0";
    ctx.beginPath(); ctx.ellipse(415, 400, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
  },
  lp1_003(ctx) { // Boxes loaded onto truck
    drawSky(ctx); drawCloud(ctx, 150, 60); drawCloud(ctx, 500, 90, 1.2);
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    // Truck
    ctx.fillStyle = "#f59e0b";
    roundRect(ctx, 400, 180, 260, 130, 8); ctx.fill();
    ctx.fillStyle = "#d97706";
    roundRect(ctx, 660, 210, 100, 100, 8); ctx.fill();
    ctx.fillStyle = "#bfdbfe";
    roundRect(ctx, 675, 220, 50, 40, 4); ctx.fill();
    ctx.fillStyle = "#1f2937";
    ctx.beginPath(); ctx.arc(460, 315, 18, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(600, 315, 18, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(710, 315, 18, 0, Math.PI * 2); ctx.fill();
    // Boxes
    const boxColors = ["#d97706", "#92400e", "#b45309", "#a16207"];
    [[130, 290, 45, 35], [190, 295, 40, 30], [155, 260, 42, 32], [440, 240, 40, 30], [490, 235, 45, 35]].forEach(([bx, by, bw, bh], i) => {
      ctx.fillStyle = boxColors[i % boxColors.length];
      roundRect(ctx, bx, by, bw, bh, 3); ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, by + bh / 2); ctx.lineTo(bx + bw, by + bh / 2); ctx.stroke();
    });
    drawPerson(ctx, 280, H * 0.88, { h: 130, gender: "m", color: "#4b5563", pose: "stand" });
  },
  lp1_004(ctx) { // Woman typing on laptop
    drawWall(ctx, "#f5f0e6");
    drawIndoorFloor(ctx, "#d4c5a9");
    drawWindow(ctx, 550, 50, 100, 130);
    drawDesk(ctx, 280, 350, 200, 60);
    drawLaptop(ctx, 350, 350, 55);
    drawPerson(ctx, 380, H * 0.88, { h: 135, gender: "f", color: "#ec4899", pose: "type" });
  },
  lp1_005(ctx) { // Passengers boarding airplane
    drawSky(ctx, "#c7d2fe", "#e0e7ff");
    ctx.fillStyle = "#9ca3af";
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    // Airplane
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath(); ctx.ellipse(620, 200, 100, 30, -0.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath(); ctx.moveTo(555, 175); ctx.lineTo(555, 130); ctx.lineTo(600, 175); ctx.fill();
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath(); ctx.moveTo(630, 175); ctx.lineTo(680, 135); ctx.lineTo(680, 175); ctx.fill();
    ctx.beginPath(); ctx.moveTo(630, 225); ctx.lineTo(680, 265); ctx.lineTo(680, 225); ctx.fill();
    // Windows on plane
    ctx.fillStyle = "#93c5fd";
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(575 + i * 15, 197, 4, 0, Math.PI * 2); ctx.fill(); }
    // Jetway
    ctx.fillStyle = "#e2e8f0";
    roundRect(ctx, 270, 230, 240, 40, 6); ctx.fill();
    ctx.fillStyle = "#cbd5e1";
    roundRect(ctx, 240, 220, 45, 65, 6); ctx.fill();
    // Passengers
    drawPerson(ctx, 200, H * 0.88, { h: 110, gender: "m", color: "#3b82f6", pose: "walk" });
    drawPerson(ctx, 260, H * 0.88, { h: 105, gender: "f", color: "#ef4444", pose: "walk" });
    drawPerson(ctx, 320, H * 0.88, { h: 110, gender: "m", color: "#10b981", pose: "walk" });
    drawPerson(ctx, 380, H * 0.88, { h: 108, gender: "f", color: "#8b5cf6", pose: "walk" });
  },
  lp1_006(ctx) { // Waiter pouring water
    drawWall(ctx, "#fff8e7");
    drawIndoorFloor(ctx, "#c4a882");
    drawTable(ctx, 230, 360, 180);
    // Glass
    ctx.fillStyle = "rgba(147,197,253,0.5)";
    roundRect(ctx, 340, 330, 16, 30, 3); ctx.fill();
    ctx.strokeStyle = "#93c5fd"; ctx.lineWidth = 1.5;
    roundRect(ctx, 340, 330, 16, 30, 3); ctx.stroke();
    // Plate
    ctx.fillStyle = "#f5f5f5";
    ctx.beginPath(); ctx.ellipse(300, 358, 25, 8, 0, 0, Math.PI * 2); ctx.fill();
    // Waiter
    drawPerson(ctx, 450, H * 0.86, { h: 140, gender: "m", color: "#1f2937", pose: "stand" });
    // Customer
    drawPerson(ctx, 280, H * 0.88, { h: 120, gender: "f", color: "#6366f1", pose: "sit" });
    // Water stream
    ctx.strokeStyle = "rgba(96,165,250,0.5)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(430, 360); ctx.quadraticCurveTo(390, 340, 350, 332); ctx.stroke();
  },
  lp1_007(ctx) { // Luggage on conveyor belt
    drawWall(ctx, "#e8ecf4");
    drawIndoorFloor(ctx, "#c0c0c0");
    // Conveyor belt
    ctx.fillStyle = "#4b5563";
    roundRect(ctx, 60, 360, 680, 22, 8); ctx.fill();
    ctx.fillStyle = "#6b7280";
    roundRect(ctx, 60, 360, 680, 12, 6); ctx.fill();
    // Luggage
    const lugColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
    [[120, 325], [260, 320], [400, 322], [530, 318]].forEach(([lx, ly], i) => {
      ctx.fillStyle = lugColors[i];
      roundRect(ctx, lx, ly, 55, 40, 5); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(lx + 5, ly + 15, 45, 3);
      // Handle
      ctx.strokeStyle = darken(lugColors[i], 30); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(lx + 20, ly); ctx.lineTo(lx + 20, ly - 8); ctx.lineTo(lx + 35, ly - 8); ctx.lineTo(lx + 35, ly); ctx.stroke();
    });
    drawPerson(ctx, 180, H * 0.88, { h: 125, gender: "m", color: "#7c3aed", pose: "stand" });
    drawPerson(ctx, 470, H * 0.88, { h: 120, gender: "f", color: "#dc2626", pose: "stand" });
    // Sign
    ctx.fillStyle = "#1e3a5f";
    roundRect(ctx, 300, 50, 200, 40, 5); ctx.fill();
    ctx.fillStyle = "#fbbf24"; ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Baggage Claim", 400, 76);
  },
  lp1_008(ctx) { // Construction worker with hard hat
    drawSky(ctx); drawSun(ctx); drawCloud(ctx, 200, 55);
    ctx.fillStyle = "#a0866c";
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    // Building frame
    ctx.fillStyle = "rgba(156,163,175,0.5)";
    roundRect(ctx, 450, 100, 220, 230, 4); ctx.fill();
    ctx.strokeStyle = "#6b7280"; ctx.lineWidth = 3;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      roundRect(ctx, 465 + c * 65, 115 + r * 70, 50, 55, 2); ctx.stroke();
    }
    // Crane
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(425, 20, 12, 310);
    ctx.fillRect(425, 20, 180, 10);
    ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(437, 30); ctx.lineTo(605, 25); ctx.stroke();
    // Worker with hard hat
    drawPerson(ctx, 260, H * 0.87, { h: 145, gender: "m", color: "#d97706", pose: "stand" });
    ctx.fillStyle = "#f59e0b";
    roundRect(ctx, 260 - 18, H * 0.87 - 145 * 0.86, 36, 10, 3); ctx.fill();
    roundRect(ctx, 260 - 22, H * 0.87 - 145 * 0.79, 44, 5, 2); ctx.fill();
  },
  lp1_009(ctx) { // People jogging in park
    drawSky(ctx); drawCloud(ctx, 200, 50); drawCloud(ctx, 550, 80, 0.8);
    ctx.fillStyle = "#7ec850";
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    // Path
    ctx.fillStyle = gradient(ctx, 0, H * 0.65, 0, H * 0.72, [[0, "#d4c5a9"], [1, "#c4b599"]]);
    ctx.fillRect(0, H * 0.65, W, H * 0.08);
    drawTree(ctx, 80, H * 0.55, 1.2);
    drawTree(ctx, 650, H * 0.55, 1.0);
    drawTree(ctx, 720, H * 0.55, 0.8);
    drawPerson(ctx, 250, H * 0.72, { h: 100, gender: "f", color: "#ef4444", pose: "jog" });
    drawPerson(ctx, 350, H * 0.72, { h: 105, gender: "m", color: "#3b82f6", pose: "jog" });
    drawPerson(ctx, 450, H * 0.72, { h: 98, gender: "m", color: "#10b981", pose: "jog" });
  },
  lp1_010(ctx) { // Cashier scanning items
    drawWall(ctx, "#fef9f0");
    drawIndoorFloor(ctx, "#e0d5c5");
    // Counter
    ctx.fillStyle = gradient(ctx, 300, 320, 300, 380, [[0, "#94a3b8"], [1, "#64748b"]]);
    roundRect(ctx, 300, 320, 220, 60, 5); ctx.fill();
    // Register/POS
    ctx.fillStyle = "#2d3748";
    roundRect(ctx, 460, 280, 40, 45, 3); ctx.fill();
    ctx.fillStyle = "#60a5fa";
    roundRect(ctx, 464, 284, 32, 25, 2); ctx.fill();
    // Items
    ctx.fillStyle = "#ef4444"; roundRect(ctx, 320, 305, 20, 18, 2); ctx.fill();
    ctx.fillStyle = "#fbbf24"; roundRect(ctx, 348, 308, 18, 14, 2); ctx.fill();
    ctx.fillStyle = "#10b981"; roundRect(ctx, 374, 304, 22, 18, 2); ctx.fill();
    // Cashier
    drawPerson(ctx, 530, H * 0.88, { h: 130, gender: "m", color: "#1e40af", pose: "stand" });
    // Customer
    drawPerson(ctx, 230, H * 0.88, { h: 125, gender: "f", color: "#ec4899", pose: "stand" });
  },
  lp1_011(ctx) { // Nurse adjusting equipment
    drawWall(ctx, "#f5f0ff");
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    // Bed
    ctx.fillStyle = "white";
    roundRect(ctx, 150, 360, 280, 20, 4); ctx.fill();
    ctx.fillStyle = "#e0e7ff";
    roundRect(ctx, 160, 340, 80, 25, 4); ctx.fill();
    ctx.fillStyle = "#9ca3af";
    ctx.fillRect(155, 380, 8, 50);
    ctx.fillRect(422, 380, 8, 50);
    // Patient
    ctx.fillStyle = "#e8c4a0";
    ctx.beginPath(); ctx.arc(200, 335, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#93c5fd";
    ctx.fillRect(180, 350, 180, 12);
    // Medical equipment
    ctx.fillStyle = "#6b7280";
    ctx.fillRect(500, 200, 8, 180);
    ctx.fillStyle = "#1f2937";
    roundRect(ctx, 480, 190, 50, 40, 4); ctx.fill();
    ctx.fillStyle = "#34d399";
    roundRect(ctx, 484, 194, 42, 30, 3); ctx.fill();
    // IV bag
    ctx.fillStyle = "rgba(147,197,253,0.6)";
    roundRect(ctx, 496, 240, 20, 30, 3); ctx.fill();
    ctx.strokeStyle = "#93c5fd"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(506, 270); ctx.lineTo(506, 350); ctx.stroke();
    // Nurse
    drawPerson(ctx, 530, H * 0.88, { h: 135, gender: "f", color: "#dbeafe", pose: "stand", hairColor: "#1a1a1a" });
  },
  lp1_012(ctx) { // Workers directing traffic
    drawSky(ctx); drawCloud(ctx, 400, 50);
    ctx.fillStyle = "#6b7280";
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    // Road markings
    ctx.fillStyle = "#fbbf24";
    for (let i = 0; i < 8; i++) ctx.fillRect(40 + i * 100, H * 0.72, 50, 6);
    // Cones
    [[280, H * 0.65], [340, H * 0.65], [400, H * 0.65]].forEach(([cx, cy]) => {
      ctx.fillStyle = "#f97316";
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 12, cy - 30); ctx.lineTo(cx + 24, cy); ctx.fill();
      ctx.fillStyle = "white"; ctx.fillRect(cx + 4, cy - 18, 16, 4);
    });
    // Barrier
    ctx.fillStyle = "#f97316";
    roundRect(ctx, 450, H * 0.58, 160, 10, 3); ctx.fill();
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(455, H * 0.58 + 10, 6, 35);
    ctx.fillRect(600, H * 0.58 + 10, 6, 35);
    // Workers in vests
    drawPerson(ctx, 180, H * 0.88, { h: 135, gender: "m", color: "#22c55e", pose: "stand" });
    drawPerson(ctx, 580, H * 0.88, { h: 130, gender: "m", color: "#22c55e", pose: "stand" });
  },
  lp1_013(ctx) { // Products assembled on factory floor
    drawWall(ctx, "#e2e8f0");
    drawIndoorFloor(ctx, "#9ca3af");
    // Assembly line
    ctx.fillStyle = "#4b5563";
    roundRect(ctx, 60, 340, 680, 16, 4); ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.fillRect(60, 356, 12, 60);
    ctx.fillRect(350, 356, 12, 60);
    ctx.fillRect(728, 356, 12, 60);
    // Products
    ctx.fillStyle = "#60a5fa";
    [[130, 310], [270, 313], [430, 308], [570, 312]].forEach(([px, py]) => {
      roundRect(ctx, px, py, 40, 30, 3); ctx.fill();
    });
    // Robotic arm
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(500, 140, 16, 180);
    roundRect(ctx, 470, 130, 75, 16, 4); ctx.fill();
    ctx.fillStyle = "#d97706";
    ctx.beginPath(); ctx.arc(540, 138, 8, 0, Math.PI * 2); ctx.fill();
    // Workers
    drawPerson(ctx, 200, H * 0.88, { h: 125, gender: "m", color: "#1e40af", pose: "stand" });
    drawPerson(ctx, 600, H * 0.88, { h: 125, gender: "m", color: "#1e40af", pose: "stand" });
  },
  lp1_014(ctx) { // Diners at terrace
    drawSky(ctx); drawCloud(ctx, 150, 55);
    ctx.fillStyle = "#c4a882";
    ctx.fillRect(0, H * 0.5, W, H * 0.5);
    // Garden
    drawTree(ctx, 60, H * 0.5, 1.0);
    drawTree(ctx, 160, H * 0.5, 1.1);
    ctx.fillStyle = "#22c55e";
    ctx.beginPath(); ctx.ellipse(110, H * 0.52, 80, 15, 0, 0, Math.PI * 2); ctx.fill();
    // Railing
    ctx.fillStyle = "#a0752e";
    ctx.fillRect(240, H * 0.48, 560, 8);
    for (let i = 0; i < 8; i++) ctx.fillRect(250 + i * 70, H * 0.48 + 8, 5, 30);
    // Tables
    drawTable(ctx, 340, 380, 120);
    drawTable(ctx, 550, 380, 120);
    // Diners
    drawPerson(ctx, 370, H * 0.88, { h: 110, gender: "m", color: "#7c3aed", pose: "sit" });
    drawPerson(ctx, 430, H * 0.88, { h: 105, gender: "f", color: "#ec4899", pose: "sit" });
    drawPerson(ctx, 580, H * 0.88, { h: 110, gender: "m", color: "#2563eb", pose: "sit" });
    drawPerson(ctx, 640, H * 0.88, { h: 105, gender: "f", color: "#059669", pose: "sit" });
  },
  lp1_015(ctx) { // Traveler at self-service kiosk
    drawWall(ctx, "#e8ecf4");
    drawIndoorFloor(ctx, "#c0c0c0");
    // Kiosks
    [[400, 220], [530, 220]].forEach(([kx, ky]) => {
      ctx.fillStyle = "#374151";
      roundRect(ctx, kx, ky, 70, 120, 5); ctx.fill();
      ctx.fillStyle = "#60a5fa";
      roundRect(ctx, kx + 6, ky + 6, 58, 70, 3); ctx.fill();
      ctx.fillStyle = "#9ca3af";
      roundRect(ctx, kx + 10, ky + 85, 50, 12, 2); ctx.fill();
    });
    // Departure board
    ctx.fillStyle = "#1f2937";
    roundRect(ctx, 100, 50, 250, 70, 5); ctx.fill();
    ctx.fillStyle = "#fbbf24"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "left";
    ctx.fillText("DEPARTURES", 115, 75);
    ctx.fillStyle = "#34d399"; ctx.font = "11px monospace";
    ctx.fillText("FL102  TOKYO    14:30  GATE 5", 115, 95);
    ctx.fillText("FL205  OSAKA    15:15  GATE 8", 115, 110);
    // Traveler with suitcase
    drawPerson(ctx, 420, H * 0.88, { h: 135, gender: "m", color: "#6366f1", pose: "stand" });
    ctx.fillStyle = "#ef4444";
    roundRect(ctx, 350, H * 0.88 - 50, 28, 45, 4); ctx.fill();
    ctx.fillStyle = darken("#ef4444", 20);
    ctx.fillRect(356, H * 0.88 - 52, 16, 5);
  },
  lp1_016(ctx) { // Woman browsing books
    drawWall(ctx, "#faf5ff");
    drawIndoorFloor(ctx, "#c4a882");
    drawBookshelf(ctx, 60, 100, 90, 200);
    drawBookshelf(ctx, 170, 100, 90, 200);
    drawBookshelf(ctx, 530, 100, 90, 200);
    drawBookshelf(ctx, 640, 100, 90, 200);
    drawPerson(ctx, 370, H * 0.88, { h: 140, gender: "f", color: "#ec4899", pose: "reach" });
  },
  lp1_017(ctx) { // Man lifting weights
    drawWall(ctx, "#fef2f2");
    drawIndoorFloor(ctx, "#6b7280");
    // Mirror
    ctx.fillStyle = "rgba(224,242,254,0.4)";
    roundRect(ctx, 120, 40, 280, 180, 5); ctx.fill();
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 3;
    roundRect(ctx, 120, 40, 280, 180, 5); ctx.stroke();
    // Weight rack
    ctx.fillStyle = "#4b5563";
    roundRect(ctx, 550, 150, 120, 150, 4); ctx.fill();
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = "#1f2937";
      ctx.beginPath(); ctx.ellipse(570 + i * 20, 220, 7, 40, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Barbell overhead
    ctx.fillStyle = "#4b5563";
    roundRect(ctx, 240, 310, 160, 5, 2); ctx.fill();
    ctx.fillStyle = "#1f2937";
    roundRect(ctx, 225, 295, 18, 30, 3); ctx.fill();
    roundRect(ctx, 397, 295, 18, 30, 3); ctx.fill();
    drawPerson(ctx, 320, H * 0.88, { h: 145, gender: "m", color: "#2563eb", pose: "stand" });
  },
  lp1_018(ctx) { // Cars parked in rows
    drawSky(ctx); drawCloud(ctx, 200, 60, 1.1);
    ctx.fillStyle = "#9ca3af";
    ctx.fillRect(0, H * 0.45, W, H * 0.55);
    // Parking lines
    ctx.fillStyle = "white";
    for (let i = 0; i < 9; i++) ctx.fillRect(45 + i * 95, H * 0.52, 3, 80);
    // Cars in front row
    drawCar(ctx, 55, H * 0.78, 80, "#3b82f6");
    drawCar(ctx, 150, H * 0.78, 80, "#ef4444");
    drawCar(ctx, 245, H * 0.78, 80, "#10b981");
    drawCar(ctx, 340, H * 0.78, 80, "#6366f1");
    drawCar(ctx, 435, H * 0.78, 80, "#f59e0b");
    drawCar(ctx, 530, H * 0.78, 80, "#ec4899");
    // Cars in back row (smaller/farther)
    drawCar(ctx, 80, H * 0.60, 65, "#6b7280");
    drawCar(ctx, 190, H * 0.60, 65, "#1f2937");
    drawCar(ctx, 350, H * 0.60, 65, "#dc2626");
    drawCar(ctx, 500, H * 0.60, 65, "#4b5563");
  },
  lp1_019(ctx) { // Forklift in warehouse
    drawWall(ctx, "#e2e8f0");
    drawIndoorFloor(ctx, "#9ca3af");
    // Shelving
    ctx.fillStyle = "#78716c";
    roundRect(ctx, 30, 80, 180, 240, 3); ctx.fill();
    for (let r = 0; r < 3; r++) {
      ctx.fillStyle = "#57534e";
      ctx.fillRect(35, 85 + r * 80 + 70, 170, 5);
      const bc = ["#d97706", "#92400e", "#b45309"];
      for (let c = 0; c < 3; c++) {
        ctx.fillStyle = bc[c];
        roundRect(ctx, 42 + c * 55, 85 + r * 80 + 35, 42, 35, 3); ctx.fill();
      }
    }
    // Forklift
    ctx.fillStyle = "#f59e0b";
    roundRect(ctx, 400, 340, 120, 70, 6); ctx.fill();
    ctx.fillStyle = "#d97706";
    ctx.fillRect(380, 310, 18, 110);
    ctx.fillStyle = "#92400e";
    roundRect(ctx, 365, 295, 48, 10, 2); ctx.fill();
    ctx.fillStyle = "#1f2937";
    ctx.beginPath(); ctx.arc(420, 415, 15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(500, 415, 15, 0, Math.PI * 2); ctx.fill();
    // Pallet on forklift
    ctx.fillStyle = "#d97706";
    roundRect(ctx, 370, 265, 50, 35, 3); ctx.fill();
    ctx.fillStyle = "#92400e";
    roundRect(ctx, 365, 250, 40, 30, 3); ctx.fill();
    drawPerson(ctx, 470, 380, { h: 80, gender: "m", color: "#1e40af", pose: "sit" });
  },
  lp1_020(ctx) { // Gardener trimming hedges
    drawSky(ctx); drawSun(ctx); drawCloud(ctx, 250, 60);
    ctx.fillStyle = "#7ec850";
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    // Walkway
    ctx.fillStyle = "#d4c5a9";
    ctx.fillRect(0, H * 0.68, W, H * 0.08);
    // Hedges
    ctx.fillStyle = "#166534";
    roundRect(ctx, 60, H * 0.55 - 10, 260, 60, 16); ctx.fill();
    ctx.fillStyle = "#15803d";
    roundRect(ctx, 480, H * 0.55 - 10, 260, 60, 16); ctx.fill();
    drawTree(ctx, 30, H * 0.55, 1.0);
    drawTree(ctx, 750, H * 0.55, 0.9);
    drawPerson(ctx, 380, H * 0.85, { h: 140, gender: "m", color: "#16a34a", pose: "stand" });
  },
  lp1_021(ctx) { // Visitors in lobby
    drawWall(ctx, "#f0ead6");
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    // Reception desk
    ctx.fillStyle = gradient(ctx, 450, 310, 450, 380, [[0, "#92400e"], [1, "#78350f"]]);
    roundRect(ctx, 450, 310, 250, 70, 6); ctx.fill();
    ctx.fillStyle = "#a0752e";
    roundRect(ctx, 455, 305, 240, 10, 3); ctx.fill();
    // Company sign
    ctx.fillStyle = "#1e40af";
    roundRect(ctx, 500, 100, 160, 45, 5); ctx.fill();
    ctx.fillStyle = "white"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("RECEPTION", 580, 128);
    // Waiting chairs
    drawChair(ctx, 100, 380, 50, 60);
    drawChair(ctx, 180, 380, 50, 60);
    // Visitors
    drawPerson(ctx, 125, H * 0.88, { h: 120, gender: "m", color: "#6366f1", pose: "sit" });
    drawPerson(ctx, 205, H * 0.88, { h: 115, gender: "f", color: "#ec4899", pose: "sit" });
    // Receptionist
    drawPerson(ctx, 570, H * 0.82, { h: 100, gender: "f", color: "#0ea5e9", pose: "stand" });
  },
  lp1_022(ctx) { // People stepping out of elevator
    drawWall(ctx, "#f0ead6");
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    // Elevator frame
    ctx.fillStyle = "#9ca3af";
    roundRect(ctx, 270, 60, 260, 290, 6); ctx.fill();
    // Doors (open)
    ctx.fillStyle = "#cbd5e1";
    roundRect(ctx, 275, 65, 100, 280, 3); ctx.fill();
    roundRect(ctx, 425, 65, 100, 280, 3); ctx.fill();
    // Inside elevator
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(375, 65, 50, 280);
    // Floor indicator
    ctx.fillStyle = "#1f2937";
    roundRect(ctx, 370, 30, 60, 25, 4); ctx.fill();
    ctx.fillStyle = "#34d399"; ctx.font = "bold 16px monospace"; ctx.textAlign = "center";
    ctx.fillText("1F", 400, 50);
    // People coming out
    drawPerson(ctx, 360, H * 0.88, { h: 125, gender: "m", color: "#3b82f6", pose: "walk" });
    drawPerson(ctx, 430, H * 0.88, { h: 120, gender: "f", color: "#ec4899", pose: "walk" });
    drawPerson(ctx, 500, H * 0.88, { h: 118, gender: "m", color: "#10b981", pose: "walk" });
  },
  lp1_023(ctx) { // Umbrellas on beach
    drawSky(ctx); drawSun(ctx, 680, 65); drawCloud(ctx, 200, 70);
    // Sea
    ctx.fillStyle = gradient(ctx, 0, H * 0.45, 0, H * 0.55, [[0, "#0ea5e9"], [1, "#22d3ee"]]);
    ctx.fillRect(0, H * 0.45, W, H * 0.12);
    // Wave
    ctx.fillStyle = "rgba(34,211,238,0.3)";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.55);
    for (let i = 0; i < W; i += 50) ctx.quadraticCurveTo(i + 25, H * 0.53, i + 50, H * 0.55);
    ctx.lineTo(W, H * 0.58); ctx.lineTo(0, H * 0.58); ctx.fill();
    // Sand
    ctx.fillStyle = gradient(ctx, 0, H * 0.55, 0, H, [[0, "#f5deb3"], [1, "#e8d5a0"]]);
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    // Umbrellas
    const uc = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981"];
    [130, 290, 460, 630].forEach((ux, i) => drawUmbrella(ctx, ux, H * 0.55 + 30, uc[i]));
    // Beach chairs
    ctx.fillStyle = "#1e40af";
    ctx.save(); ctx.translate(145, H * 0.75); ctx.rotate(-0.2);
    roundRect(ctx, 0, 0, 45, 15, 3); ctx.fill(); ctx.restore();
    ctx.fillStyle = "#dc2626";
    ctx.save(); ctx.translate(305, H * 0.75); ctx.rotate(-0.2);
    roundRect(ctx, 0, 0, 45, 15, 3); ctx.fill(); ctx.restore();
  },
  lp1_024(ctx) { // Library patron using computer
    drawWall(ctx, "#faf5ff");
    drawIndoorFloor(ctx, "#c4a882");
    drawBookshelf(ctx, 560, 80, 85, 200);
    drawBookshelf(ctx, 660, 80, 85, 200);
    drawDesk(ctx, 200, 350, 220, 60);
    drawLaptop(ctx, 300, 350, 55);
    // Desk lamp
    ctx.fillStyle = "#374151";
    ctx.fillRect(230, 310, 4, 40);
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(218, 310); ctx.quadraticCurveTo(232, 295, 246, 310); ctx.fill();
    drawPerson(ctx, 330, H * 0.88, { h: 130, gender: "m", color: "#7c3aed", pose: "type" });
  },
  lp1_025(ctx) { // Gym members stretching on mats
    drawWall(ctx, "#fef2f2");
    drawIndoorFloor(ctx, "#6b7280");
    // Mirror
    ctx.fillStyle = "rgba(224,242,254,0.4)";
    roundRect(ctx, 80, 30, 360, 170, 5); ctx.fill();
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 3;
    roundRect(ctx, 80, 30, 360, 170, 5); ctx.stroke();
    // Yoga mats
    const matColors = ["rgba(167,139,250,0.5)", "rgba(110,231,183,0.5)", "rgba(252,165,165,0.5)"];
    [140, 330, 520].forEach((mx, i) => {
      ctx.fillStyle = matColors[i];
      ctx.save(); ctx.translate(mx, H * 0.65);
      roundRect(ctx, 0, 0, 140, 55, 5); ctx.fill();
      ctx.restore();
    });
    drawPerson(ctx, 210, H * 0.78, { h: 110, gender: "f", color: "#7c3aed", pose: "stand" });
    drawPerson(ctx, 400, H * 0.78, { h: 115, gender: "m", color: "#059669", pose: "stand" });
    drawPerson(ctx, 590, H * 0.78, { h: 108, gender: "f", color: "#dc2626", pose: "stand" });
  },
};

async function main() {
  const data = JSON.parse(readFileSync(join(__dirname, "..", "src", "data", "listening", "part1.json"), "utf8"));
  console.log(`Generating ${data.questions.length} scene images...\n`);

  for (const q of data.questions) {
    const fn = scenes[q.id];
    if (!fn) { console.log(`SKIP ${q.id}`); continue; }

    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Anti-aliasing background
    ctx.imageSmoothingEnabled = true;

    fn(ctx);

    // Add subtle vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.7);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.08)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    const buf = canvas.toBuffer("image/png");
    writeFileSync(join(OUT, `${q.id}.png`), buf);
    console.log(`✓ ${q.id}.png (${(buf.length / 1024).toFixed(1)} KB)`);
  }
  console.log("\nDone!");
}

main();
