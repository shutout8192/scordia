import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "images", "listening");
mkdirSync(OUT, { recursive: true });

const W = 600, H = 400;

// Color palettes per scene type
const PALETTES = {
  office:     { bg1: "#e8f4fd", bg2: "#b8dff7", floor: "#d4c5a9", wall: "#f0ead6", accent: "#4a90d9" },
  outdoor:    { bg1: "#d4edda", bg2: "#a8d5ba", floor: "#8fbc8f", wall: "#87ceeb", accent: "#2e8b57" },
  airport:    { bg1: "#e0e7ff", bg2: "#b8c7f7", floor: "#c0c0c0", wall: "#e8ecf4", accent: "#6366f1" },
  restaurant: { bg1: "#fef3c7", bg2: "#fcd34d", floor: "#d4a574", wall: "#fff8e7", accent: "#d97706" },
  park:       { bg1: "#d1fae5", bg2: "#6ee7b7", floor: "#7ec850", wall: "#87ceeb", accent: "#059669" },
  shop:       { bg1: "#fff7ed", bg2: "#fed7aa", floor: "#e0d5c5", wall: "#fef9f0", accent: "#ea580c" },
  hospital:   { bg1: "#ede9fe", bg2: "#c4b5fd", floor: "#e0e0e0", wall: "#f5f0ff", accent: "#7c3aed" },
  factory:    { bg1: "#f1f5f9", bg2: "#94a3b8", floor: "#9ca3af", wall: "#e2e8f0", accent: "#475569" },
  library:    { bg1: "#fdf4ff", bg2: "#e9d5ff", floor: "#c4a882", wall: "#faf5ff", accent: "#9333ea" },
  gym:        { bg1: "#fef2f2", bg2: "#fca5a5", floor: "#6b7280", wall: "#fef2f2", accent: "#dc2626" },
  beach:      { bg1: "#ecfeff", bg2: "#67e8f9", floor: "#f5deb3", wall: "#87ceeb", accent: "#0891b2" },
};

// Helper: person silhouette
function person(x, y, h = 70, color = "#4b5563", hair = false, hatColor = null) {
  const headR = h * 0.14;
  const bodyW = h * 0.28;
  const bodyH = h * 0.35;
  const legH = h * 0.3;
  let svg = "";
  // Legs
  svg += `<rect x="${x - bodyW * 0.3}" y="${y - legH}" width="${bodyW * 0.25}" height="${legH}" rx="3" fill="${color}" opacity="0.8"/>`;
  svg += `<rect x="${x + bodyW * 0.05}" y="${y - legH}" width="${bodyW * 0.25}" height="${legH}" rx="3" fill="${color}" opacity="0.8"/>`;
  // Body
  svg += `<rect x="${x - bodyW / 2}" y="${y - legH - bodyH}" width="${bodyW}" height="${bodyH}" rx="4" fill="${color}"/>`;
  // Head
  svg += `<circle cx="${x}" cy="${y - legH - bodyH - headR - 2}" r="${headR}" fill="#f5d0a9"/>`;
  // Hair
  if (hair) {
    svg += `<path d="M${x - headR} ${y - legH - bodyH - headR - 2} Q${x} ${y - legH - bodyH - headR * 2.5 - 2} ${x + headR} ${y - legH - bodyH - headR - 2}" fill="#3b2f1e" opacity="0.8"/>`;
  }
  // Hard hat
  if (hatColor) {
    svg += `<rect x="${x - headR - 2}" y="${y - legH - bodyH - headR * 2 - 4}" width="${headR * 2 + 4}" height="${headR * 0.8}" rx="2" fill="${hatColor}"/>`;
    svg += `<rect x="${x - headR - 5}" y="${y - legH - bodyH - headR * 1.3 - 4}" width="${headR * 2 + 10}" height="3" rx="1" fill="${hatColor}" opacity="0.8"/>`;
  }
  return svg;
}

// Helper: desk
function desk(x, y, w = 80, h = 30) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h * 0.3}" rx="2" fill="#b8860b" opacity="0.9"/>
    <rect x="${x + 5}" y="${y + h * 0.3}" width="5" height="${h * 0.7}" fill="#a0752e"/>
    <rect x="${x + w - 10}" y="${y + h * 0.3}" width="5" height="${h * 0.7}" fill="#a0752e"/>`;
}

// Helper: laptop/monitor on desk
function laptop(x, y, w = 30) {
  return `<rect x="${x}" y="${y - w * 0.7}" width="${w}" height="${w * 0.6}" rx="2" fill="#2d3748"/>
    <rect x="${x + 2}" y="${y - w * 0.65}" width="${w - 4}" height="${w * 0.45}" fill="#63b3ed"/>
    <rect x="${x - 3}" y="${y}" width="${w + 6}" height="3" rx="1" fill="#4a5568"/>`;
}

// Helper: window
function windowShape(x, y, w = 50, h = 60) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#87ceeb" opacity="0.6"/>
    <line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="white" stroke-width="2"/>
    <line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="white" stroke-width="2"/>`;
}

// Helper: tree
function tree(x, y, size = 50) {
  return `<rect x="${x - 4}" y="${y - size * 0.4}" width="8" height="${size * 0.4}" fill="#8B6914"/>
    <ellipse cx="${x}" cy="${y - size * 0.65}" rx="${size * 0.3}" ry="${size * 0.35}" fill="#228B22"/>
    <ellipse cx="${x - size * 0.15}" cy="${y - size * 0.55}" rx="${size * 0.22}" ry="${size * 0.28}" fill="#2d8f2d"/>`;
}

// Helper: car
function car(x, y, w = 80, color = "#3b82f6") {
  return `<rect x="${x}" y="${y - 20}" width="${w}" height="20" rx="4" fill="${color}"/>
    <rect x="${x + 10}" y="${y - 32}" width="${w * 0.5}" height="14" rx="6" fill="${color}" opacity="0.9"/>
    <rect x="${x + 13}" y="${y - 30}" width="${w * 0.2}" height="10" rx="2" fill="#bfdbfe"/>
    <rect x="${x + 13 + w * 0.22}" y="${y - 30}" width="${w * 0.2}" height="10" rx="2" fill="#bfdbfe"/>
    <circle cx="${x + 15}" cy="${y}" r="7" fill="#1f2937"/>
    <circle cx="${x + 15}" cy="${y}" r="3" fill="#6b7280"/>
    <circle cx="${x + w - 15}" cy="${y}" r="7" fill="#1f2937"/>
    <circle cx="${x + w - 15}" cy="${y}" r="3" fill="#6b7280"/>`;
}

// Helper: airplane
function airplane(x, y, scale = 1) {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <ellipse cx="0" cy="0" rx="60" ry="12" fill="#e2e8f0"/>
    <polygon points="-20,-12 -20,-40 0,-12" fill="#94a3b8"/>
    <polygon points="10,-6 40,-25 40,-5" fill="#94a3b8"/>
    <polygon points="10,6 40,25 40,5" fill="#94a3b8"/>
    <circle cx="-35" cy="0" r="4" fill="#60a5fa"/>
    <circle cx="-25" cy="0" r="4" fill="#60a5fa"/>
    <circle cx="-15" cy="0" r="4" fill="#60a5fa"/>
    <ellipse cx="55" cy="0" rx="6" ry="4" fill="#cbd5e1"/>
  </g>`;
}

// Helper: box/crate
function box(x, y, w = 25, h = 20, color = "#d97706") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${color}"/>
    <line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="${color}" stroke-width="1.5" opacity="0.5"/>
    <line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="${color}" stroke-width="1.5" opacity="0.5"/>`;
}

// Helper: bookshelf
function bookshelf(x, y, w = 60, h = 100) {
  let svg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#8B6914" rx="2"/>`;
  const cols = ["#dc2626", "#2563eb", "#16a34a", "#eab308", "#9333ea", "#ea580c"];
  for (let row = 0; row < 3; row++) {
    const shelfY = y + 5 + row * (h / 3);
    svg += `<rect x="${x + 2}" y="${shelfY + h / 3 - 5}" width="${w - 4}" height="3" fill="#a0752e"/>`;
    for (let i = 0; i < 5; i++) {
      const bw = 7 + Math.random() * 3;
      const bh = h / 3 - 12 + Math.random() * 5;
      svg += `<rect x="${x + 4 + i * 11}" y="${shelfY + h / 3 - 5 - bh}" width="${bw}" height="${bh}" rx="1" fill="${cols[(row * 5 + i) % cols.length]}" opacity="0.8"/>`;
    }
  }
  return svg;
}

// Helper: table with legs
function table(x, y, w = 100, h = 8) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#92400e"/>
    <rect x="${x + 5}" y="${y + h}" width="4" height="30" fill="#78350f"/>
    <rect x="${x + w - 9}" y="${y + h}" width="4" height="30" fill="#78350f"/>`;
}

// Scene generators
const scenes = {
  lp1_001(p) { // Woman near copy machine in office
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="220" fill="${p.wall}"/>`;
    s += `<rect x="0" y="220" width="${W}" height="180" fill="${p.floor}"/>`;
    s += windowShape(50, 40) + windowShape(150, 40);
    // Copy machine
    s += `<rect x="350" y="160" width="60" height="80" rx="4" fill="#6b7280"/>`;
    s += `<rect x="355" y="165" width="50" height="20" rx="2" fill="#a0aec0"/>`;
    s += `<rect x="360" y="200" width="40" height="5" fill="#e2e8f0"/>`;
    s += `<rect x="355" y="215" width="50" height="15" rx="2" fill="#4a5568"/>`;
    // Woman
    s += person(310, 310, 80, "#ec4899", true);
    return s;
  },
  lp1_002(p) { // Two men shaking hands in conference room
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="200" fill="${p.wall}"/>`;
    s += `<rect x="0" y="200" width="${W}" height="200" fill="${p.floor}"/>`;
    s += windowShape(240, 30, 120, 80);
    s += table(200, 240, 200);
    // Two men
    s += person(260, 320, 80, "#1e40af");
    s += person(340, 320, 80, "#374151");
    // Handshake indicator
    s += `<ellipse cx="300" cy="270" rx="15" ry="8" fill="#f5d0a9" opacity="0.7"/>`;
    return s;
  },
  lp1_003(p) { // Boxes being loaded onto truck
    let s = "";
    // Sky
    s += `<rect x="0" y="0" width="${W}" height="250" fill="#87ceeb"/>`;
    s += `<ellipse cx="100" cy="60" rx="50" ry="20" fill="white" opacity="0.8"/>`;
    s += `<ellipse cx="450" cy="80" rx="60" ry="22" fill="white" opacity="0.7"/>`;
    // Ground
    s += `<rect x="0" y="250" width="${W}" height="150" fill="#808080"/>`;
    // Truck
    s += `<rect x="300" y="180" width="180" height="90" rx="4" fill="#f59e0b"/>`;
    s += `<rect x="480" y="210" width="70" height="60" rx="4" fill="#f59e0b"/>`;
    s += `<rect x="490" y="220" width="30" height="25" rx="2" fill="#bfdbfe"/>`;
    s += `<circle cx="340" cy="275" r="14" fill="#1f2937"/>`;
    s += `<circle cx="440" cy="275" r="14" fill="#1f2937"/>`;
    s += `<circle cx="510" cy="275" r="14" fill="#1f2937"/>`;
    // Boxes
    s += box(100, 210, 30, 25, "#d97706");
    s += box(140, 215, 28, 22, "#92400e");
    s += box(320, 195, 28, 22, "#b45309");
    s += box(355, 190, 32, 25, "#d97706");
    // Worker
    s += person(200, 310, 75, "#4b5563");
    return s;
  },
  lp1_004(p) { // Woman typing on laptop
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="220" fill="${p.wall}"/>`;
    s += `<rect x="0" y="220" width="${W}" height="180" fill="${p.floor}"/>`;
    s += windowShape(400, 30, 60, 80);
    s += desk(220, 240, 160, 50);
    s += laptop(280, 240, 40);
    s += person(300, 320, 75, "#ec4899", true);
    return s;
  },
  lp1_005(p) { // Passengers boarding airplane
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="220" fill="#c7d2fe"/>`;
    s += `<rect x="0" y="220" width="${W}" height="180" fill="#9ca3af"/>`;
    s += airplane(420, 140, 1.2);
    // Jetway
    s += `<rect x="200" y="160" width="170" height="30" rx="4" fill="#e2e8f0"/>`;
    s += `<rect x="180" y="150" width="30" height="50" rx="4" fill="#cbd5e1"/>`;
    // Passengers
    s += person(160, 310, 65, "#3b82f6");
    s += person(195, 310, 65, "#ef4444");
    s += person(225, 310, 65, "#10b981");
    s += person(255, 310, 65, "#8b5cf6");
    return s;
  },
  lp1_006(p) { // Waiter pouring water
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="220" fill="${p.wall}"/>`;
    s += `<rect x="0" y="220" width="${W}" height="180" fill="${p.floor}"/>`;
    s += table(180, 250, 140);
    // Glass
    s += `<rect x="260" y="230" width="12" height="20" rx="2" fill="#bfdbfe" opacity="0.6"/>`;
    s += `<rect x="258" y="228" width="16" height="3" rx="1" fill="#e2e8f0"/>`;
    // Plate
    s += `<ellipse cx="230" cy="248" rx="18" ry="5" fill="#f5f5f5"/>`;
    // Waiter
    s += person(330, 320, 80, "#1f2937");
    // Water stream
    s += `<line x1="315" y1="250" x2="268" y2="232" stroke="#60a5fa" stroke-width="2" opacity="0.6"/>`;
    // Customer
    s += person(210, 330, 70, "#6366f1");
    return s;
  },
  lp1_007(p) { // Luggage on conveyor belt
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="200" fill="${p.wall}"/>`;
    s += `<rect x="0" y="200" width="${W}" height="200" fill="${p.floor}"/>`;
    // Conveyor belt
    s += `<rect x="50" y="260" width="500" height="15" rx="7" fill="#4b5563"/>`;
    s += `<rect x="50" y="260" width="500" height="8" rx="4" fill="#6b7280"/>`;
    // Luggage items
    s += `<rect x="100" y="235" width="35" height="25" rx="4" fill="#ef4444"/>`;
    s += `<rect x="200" y="232" width="30" height="28" rx="4" fill="#3b82f6"/>`;
    s += `<rect x="310" y="230" width="40" height="30" rx="4" fill="#10b981"/>`;
    s += `<rect x="420" y="234" width="32" height="26" rx="4" fill="#f59e0b"/>`;
    // People waiting
    s += person(150, 340, 70, "#7c3aed");
    s += person(350, 340, 70, "#dc2626");
    return s;
  },
  lp1_008(p) { // Construction worker with hard hat
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="230" fill="#87ceeb"/>`;
    s += `<ellipse cx="500" cy="50" rx="40" ry="40" fill="#fbbf24" opacity="0.8"/>`;
    s += `<rect x="0" y="230" width="${W}" height="170" fill="#a0866c"/>`;
    // Building frame
    s += `<rect x="350" y="100" width="150" height="170" fill="#9ca3af" opacity="0.5"/>`;
    s += `<rect x="360" y="110" width="30" height="40" fill="#64748b" opacity="0.3"/>`;
    s += `<rect x="400" y="110" width="30" height="40" fill="#64748b" opacity="0.3"/>`;
    s += `<rect x="440" y="110" width="30" height="40" fill="#64748b" opacity="0.3"/>`;
    // Crane arm
    s += `<rect x="340" y="50" width="8" height="220" fill="#f59e0b"/>`;
    s += `<rect x="340" y="50" width="120" height="8" fill="#f59e0b"/>`;
    // Worker with hard hat
    s += person(200, 320, 85, "#d97706", false, "#f59e0b");
    return s;
  },
  lp1_009(p) { // People jogging in park
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="220" fill="#87ceeb"/>`;
    s += `<ellipse cx="150" cy="50" rx="60" ry="25" fill="white" opacity="0.7"/>`;
    s += `<rect x="0" y="220" width="${W}" height="180" fill="#7ec850"/>`;
    // Path
    s += `<rect x="0" y="280" width="${W}" height="25" rx="3" fill="#d4c5a9"/>`;
    // Trees
    s += tree(80, 220, 55);
    s += tree(450, 220, 60);
    s += tree(530, 220, 45);
    // Joggers
    s += person(180, 290, 55, "#ef4444");
    s += person(240, 290, 55, "#3b82f6");
    s += person(300, 290, 55, "#10b981");
    return s;
  },
  lp1_010(p) { // Cashier scanning items
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="200" fill="${p.wall}"/>`;
    s += `<rect x="0" y="200" width="${W}" height="200" fill="${p.floor}"/>`;
    // Counter
    s += `<rect x="230" y="220" width="150" height="50" rx="4" fill="#94a3b8"/>`;
    s += `<rect x="235" y="215" width="60" height="10" rx="2" fill="#1f2937"/>`;
    // Register
    s += `<rect x="340" y="200" width="30" height="25" rx="2" fill="#2d3748"/>`;
    s += `<rect x="343" y="203" width="24" height="15" rx="1" fill="#60a5fa"/>`;
    // Items on belt
    s += `<rect x="240" y="210" width="15" height="12" rx="2" fill="#ef4444"/>`;
    s += `<rect x="260" y="212" width="12" height="10" rx="2" fill="#fbbf24"/>`;
    s += `<rect x="278" y="209" width="14" height="13" rx="2" fill="#10b981"/>`;
    // Cashier
    s += person(380, 320, 75, "#1e40af");
    // Customer
    s += person(200, 325, 70, "#ec4899", true);
    return s;
  },
  lp1_011(p) { // Nurse adjusting equipment
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="200" fill="${p.wall}"/>`;
    s += `<rect x="0" y="200" width="${W}" height="200" fill="#e5e7eb"/>`;
    // Bed
    s += `<rect x="120" y="250" width="180" height="15" rx="3" fill="white"/>`;
    s += `<rect x="120" y="265" width="8" height="40" fill="#9ca3af"/>`;
    s += `<rect x="292" y="265" width="8" height="40" fill="#9ca3af"/>`;
    s += `<rect x="130" y="235" width="50" height="18" rx="3" fill="#e0e7ff"/>`;
    // Patient in bed
    s += `<circle cx="160" cy="230" r="10" fill="#f5d0a9"/>`;
    s += `<rect x="140" y="245" width="120" height="8" rx="2" fill="#93c5fd"/>`;
    // Medical equipment
    s += `<rect x="330" y="160" width="30" height="100" rx="2" fill="#6b7280"/>`;
    s += `<rect x="325" y="155" width="40" height="25" rx="3" fill="#1f2937"/>`;
    s += `<rect x="328" y="158" width="34" height="18" rx="2" fill="#34d399"/>`;
    s += `<rect x="340" y="260" width="10" height="40" fill="#6b7280"/>`;
    // Nurse
    s += person(370, 320, 78, "#dbeafe", true);
    return s;
  },
  lp1_012(p) { // Workers directing traffic near construction
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="230" fill="#87ceeb"/>`;
    s += `<rect x="0" y="230" width="${W}" height="170" fill="#6b7280"/>`;
    // Road markings
    for (let i = 0; i < 6; i++) {
      s += `<rect x="${50 + i * 100}" y="310" width="40" height="5" rx="2" fill="#fbbf24"/>`;
    }
    // Cones
    s += `<polygon points="250,280 258,260 242,260" fill="#f97316"/>`;
    s += `<polygon points="200,280 208,260 192,260" fill="#f97316"/>`;
    // Construction barrier
    s += `<rect x="300" y="250" width="100" height="8" rx="2" fill="#f97316"/>`;
    s += `<rect x="305" y="258" width="5" height="25" fill="#1f2937"/>`;
    s += `<rect x="390" y="258" width="5" height="25" fill="#1f2937"/>`;
    // Workers in vests
    s += person(150, 320, 75, "#22c55e", false, null);
    s += person(420, 320, 75, "#22c55e", false, null);
    return s;
  },
  lp1_013(p) { // Products assembled on factory floor
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="180" fill="${p.wall}"/>`;
    s += `<rect x="0" y="180" width="${W}" height="220" fill="${p.floor}"/>`;
    // Conveyor/assembly line
    s += `<rect x="50" y="230" width="500" height="12" rx="3" fill="#4b5563"/>`;
    s += `<rect x="40" y="242" width="10" height="50" fill="#374151"/>`;
    s += `<rect x="250" y="242" width="10" height="50" fill="#374151"/>`;
    s += `<rect x="540" y="242" width="10" height="50" fill="#374151"/>`;
    // Products
    s += `<rect x="100" y="210" width="25" height="20" rx="2" fill="#60a5fa"/>`;
    s += `<rect x="200" y="212" width="22" height="18" rx="2" fill="#60a5fa"/>`;
    s += `<rect x="320" y="208" width="28" height="22" rx="2" fill="#60a5fa"/>`;
    s += `<rect x="430" y="211" width="24" height="19" rx="2" fill="#60a5fa"/>`;
    // Robotic arm
    s += `<rect x="370" y="100" width="15" height="120" rx="2" fill="#fbbf24"/>`;
    s += `<rect x="350" y="95" width="55" height="12" rx="3" fill="#f59e0b"/>`;
    // Workers
    s += person(160, 320, 70, "#1e40af");
    s += person(450, 320, 70, "#1e40af");
    return s;
  },
  lp1_014(p) { // Diners at tables overlooking garden terrace
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="200" fill="#87ceeb"/>`;
    s += `<rect x="0" y="200" width="${W}" height="200" fill="${p.floor}"/>`;
    // Garden in background
    s += tree(50, 200, 45);
    s += tree(130, 200, 50);
    s += `<ellipse cx="90" cy="205" rx="70" ry="12" fill="#22c55e" opacity="0.5"/>`;
    // Terrace railing
    s += `<rect x="200" y="190" width="400" height="6" rx="2" fill="#a0752e"/>`;
    for (let i = 0; i < 6; i++) {
      s += `<rect x="${215 + i * 65}" y="196" width="4" height="25" fill="#a0752e"/>`;
    }
    // Tables
    s += table(280, 260, 80);
    s += table(420, 260, 80);
    // Diners
    s += person(300, 340, 65, "#7c3aed");
    s += person(340, 340, 65, "#ec4899", true);
    s += person(440, 340, 65, "#2563eb");
    s += person(480, 340, 65, "#059669");
    return s;
  },
  lp1_015(p) { // Traveler at self-service kiosk
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="200" fill="${p.wall}"/>`;
    s += `<rect x="0" y="200" width="${W}" height="200" fill="${p.floor}"/>`;
    // Kiosks
    s += `<rect x="300" y="150" width="50" height="90" rx="4" fill="#374151"/>`;
    s += `<rect x="305" y="155" width="40" height="55" rx="2" fill="#60a5fa"/>`;
    s += `<rect x="310" y="215" width="30" height="8" rx="1" fill="#9ca3af"/>`;
    s += `<rect x="400" y="150" width="50" height="90" rx="4" fill="#374151"/>`;
    s += `<rect x="405" y="155" width="40" height="55" rx="2" fill="#60a5fa"/>`;
    // Departure board
    s += `<rect x="100" y="40" width="180" height="50" rx="4" fill="#1f2937"/>`;
    s += `<rect x="105" y="45" width="170" height="12" fill="#fbbf24"/>`;
    s += `<rect x="105" y="60" width="170" height="8" fill="#34d399"/>`;
    s += `<rect x="105" y="72" width="170" height="8" fill="#fbbf24"/>`;
    // Traveler with luggage
    s += person(320, 330, 80, "#6366f1");
    s += `<rect x="260" y="290" width="20" height="30" rx="3" fill="#ef4444"/>`;
    return s;
  },
  lp1_016(p) { // Woman browsing books in library
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="200" fill="${p.wall}"/>`;
    s += `<rect x="0" y="200" width="${W}" height="200" fill="${p.floor}"/>`;
    s += bookshelf(50, 80, 70, 130);
    s += bookshelf(140, 80, 70, 130);
    s += bookshelf(400, 80, 70, 130);
    s += bookshelf(490, 80, 70, 130);
    // Woman browsing
    s += person(260, 320, 80, "#ec4899", true);
    return s;
  },
  lp1_017(p) { // Man lifting weights in gym
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="180" fill="${p.wall}"/>`;
    s += `<rect x="0" y="180" width="${W}" height="220" fill="${p.floor}"/>`;
    // Mirror
    s += `<rect x="100" y="30" width="200" height="120" rx="4" fill="#e0f2fe" opacity="0.5"/>`;
    // Weight rack
    s += `<rect x="420" y="100" width="80" height="100" fill="#6b7280"/>`;
    for (let i = 0; i < 4; i++) {
      s += `<ellipse cx="${440 + i * 15}" cy="150" rx="5" ry="30" fill="#374151"/>`;
    }
    // Barbell
    s += `<rect x="180" y="230" width="120" height="4" rx="2" fill="#4b5563"/>`;
    s += `<rect x="170" y="220" width="12" height="24" rx="2" fill="#1f2937"/>`;
    s += `<rect x="298" y="220" width="12" height="24" rx="2" fill="#1f2937"/>`;
    // Man
    s += person(240, 310, 85, "#2563eb");
    return s;
  },
  lp1_018(p) { // Cars parked in rows
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="200" fill="#87ceeb"/>`;
    s += `<rect x="0" y="200" width="${W}" height="200" fill="#9ca3af"/>`;
    // Parking lines
    for (let i = 0; i < 7; i++) {
      s += `<rect x="${60 + i * 80}" y="220" width="3" height="60" fill="white"/>`;
    }
    // Cars
    s += car(80, 275, 60, "#3b82f6");
    s += car(160, 275, 60, "#ef4444");
    s += car(240, 275, 60, "#10b981");
    s += car(320, 275, 60, "#6366f1");
    s += car(400, 275, 60, "#f59e0b");
    // More cars in back row
    s += car(100, 225, 50, "#6b7280");
    s += car(200, 225, 50, "#1f2937");
    s += car(350, 225, 50, "#dc2626");
    return s;
  },
  lp1_019(p) { // Pallets moved by forklift in warehouse
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="180" fill="${p.wall}"/>`;
    s += `<rect x="0" y="180" width="${W}" height="220" fill="${p.floor}"/>`;
    // Shelving units
    s += `<rect x="30" y="60" width="120" height="150" fill="#78716c" opacity="0.5"/>`;
    for (let i = 0; i < 3; i++) {
      s += `<rect x="35" y="${70 + i * 50}" width="110" height="5" fill="#57534e"/>`;
      s += box(45, 50 + i * 50, 25, 20, "#d97706");
      s += box(80, 48 + i * 50, 28, 22, "#92400e");
      s += box(115, 50 + i * 50, 22, 20, "#b45309");
    }
    // Forklift
    s += `<rect x="300" y="250" width="80" height="50" rx="4" fill="#f59e0b"/>`;
    s += `<rect x="280" y="230" width="15" height="80" fill="#d97706"/>`;
    s += `<rect x="270" y="220" width="30" height="8" rx="2" fill="#92400e"/>`;
    s += `<circle cx="310" cy="305" r="10" fill="#1f2937"/>`;
    s += `<circle cx="370" cy="305" r="10" fill="#1f2937"/>`;
    // Pallet
    s += box(275, 200, 35, 25, "#d97706");
    s += box(265, 195, 28, 20, "#92400e");
    // Operator
    s += person(350, 280, 50, "#1e40af", false, "#f59e0b");
    return s;
  },
  lp1_020(p) { // Gardener trimming hedges
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="220" fill="#87ceeb"/>`;
    s += `<rect x="0" y="220" width="${W}" height="180" fill="#7ec850"/>`;
    // Walkway
    s += `<rect x="0" y="280" width="${W}" height="30" rx="2" fill="#d4c5a9"/>`;
    // Hedges
    s += `<rect x="50" y="235" width="200" height="40" rx="12" fill="#166534"/>`;
    s += `<rect x="350" y="235" width="200" height="40" rx="12" fill="#166534"/>`;
    // Trees
    s += tree(30, 220, 50);
    s += tree(560, 220, 50);
    // Gardener
    s += person(290, 310, 80, "#16a34a");
    return s;
  },
  lp1_021(p) { // Visitors waiting in lobby
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="200" fill="${p.wall}"/>`;
    s += `<rect x="0" y="200" width="${W}" height="200" fill="#e5e7eb"/>`;
    // Reception desk
    s += `<rect x="350" y="200" width="180" height="50" rx="4" fill="#92400e"/>`;
    s += `<rect x="355" y="195" width="170" height="8" rx="2" fill="#a0752e"/>`;
    // Company sign
    s += `<rect x="380" y="80" width="120" height="30" rx="4" fill="#1e40af"/>`;
    s += `<rect x="390" y="86" width="100" height="18" rx="2" fill="#3b82f6"/>`;
    // Waiting chairs
    s += `<rect x="80" y="260" width="120" height="10" rx="3" fill="#4b5563"/>`;
    s += `<rect x="80" y="270" width="10" height="25" fill="#374151"/>`;
    s += `<rect x="190" y="270" width="10" height="25" fill="#374151"/>`;
    // Visitors
    s += person(110, 310, 65, "#6366f1");
    s += person(160, 310, 65, "#ec4899", true);
    // Receptionist
    s += person(430, 300, 60, "#0ea5e9", true);
    return s;
  },
  lp1_022(p) { // People stepping out of elevator
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="200" fill="${p.wall}"/>`;
    s += `<rect x="0" y="200" width="${W}" height="200" fill="#e5e7eb"/>`;
    // Elevator doors
    s += `<rect x="220" y="60" width="160" height="200" rx="4" fill="#9ca3af"/>`;
    s += `<rect x="225" y="65" width="75" height="190" rx="2" fill="#cbd5e1"/>`;
    s += `<rect x="305" y="65" width="75" height="190" rx="2" fill="#cbd5e1"/>`;
    // Floor indicator
    s += `<rect x="275" y="45" width="50" height="15" rx="3" fill="#1f2937"/>`;
    s += `<text x="300" y="56" font-size="10" fill="#34d399" text-anchor="middle" font-family="monospace">1F</text>`;
    // People coming out
    s += person(280, 330, 70, "#3b82f6");
    s += person(320, 330, 70, "#ec4899", true);
    s += person(360, 335, 65, "#10b981");
    return s;
  },
  lp1_023(p) { // Umbrellas on beach
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="200" fill="#87ceeb"/>`;
    s += `<ellipse cx="500" cy="60" rx="40" ry="40" fill="#fbbf24" opacity="0.8"/>`;
    s += `<rect x="0" y="200" width="${W}" height="30" fill="#0ea5e9" opacity="0.4"/>`;
    s += `<rect x="0" y="230" width="${W}" height="170" fill="#f5deb3"/>`;
    // Waves
    s += `<path d="M0,200 Q75,190 150,200 Q225,210 300,200 Q375,190 450,200 Q525,210 600,200 L600,230 L0,230 Z" fill="#22d3ee" opacity="0.3"/>`;
    // Beach umbrellas
    const umbrellaColors = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981"];
    for (let i = 0; i < 4; i++) {
      const x = 100 + i * 120;
      s += `<rect x="${x - 2}" y="250" width="4" height="60" fill="#92400e"/>`;
      s += `<path d="M${x - 35} ${250} Q${x} ${215} ${x + 35} ${250}" fill="${umbrellaColors[i]}"/>`;
    }
    // Beach chairs
    s += `<rect x="80" y="290" width="30" height="12" rx="2" fill="#1e40af" transform="rotate(-15, 95, 296)"/>`;
    s += `<rect x="200" y="290" width="30" height="12" rx="2" fill="#dc2626" transform="rotate(-15, 215, 296)"/>`;
    return s;
  },
  lp1_024(p) { // Library patron using computer
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="200" fill="${p.wall}"/>`;
    s += `<rect x="0" y="200" width="${W}" height="200" fill="${p.floor}"/>`;
    s += bookshelf(430, 60, 70, 140);
    s += bookshelf(510, 60, 70, 140);
    // Study desk
    s += desk(150, 240, 180, 50);
    s += laptop(230, 240, 40);
    // Desk lamp
    s += `<rect x="180" y="210" width="3" height="30" fill="#374151"/>`;
    s += `<path d="M170 210 Q183 200 196 210" fill="#fbbf24"/>`;
    // Person at desk
    s += person(250, 320, 75, "#7c3aed");
    return s;
  },
  lp1_025(p) { // Gym members stretching on mats
    let s = "";
    s += `<rect x="0" y="0" width="${W}" height="180" fill="${p.wall}"/>`;
    s += `<rect x="0" y="180" width="${W}" height="220" fill="${p.floor}"/>`;
    // Mirror
    s += `<rect x="50" y="20" width="250" height="130" rx="4" fill="#e0f2fe" opacity="0.5"/>`;
    // Yoga mats
    s += `<rect x="80" y="280" width="100" height="40" rx="4" fill="#a78bfa" opacity="0.6" transform="skewX(-5)"/>`;
    s += `<rect x="220" y="280" width="100" height="40" rx="4" fill="#6ee7b7" opacity="0.6" transform="skewX(-5)"/>`;
    s += `<rect x="360" y="280" width="100" height="40" rx="4" fill="#fca5a5" opacity="0.6" transform="skewX(-5)"/>`;
    // People stretching
    s += person(130, 310, 65, "#7c3aed", true);
    s += person(270, 310, 65, "#059669");
    s += person(410, 310, 65, "#dc2626", true);
    return s;
  },
};

async function generate() {
  const data = JSON.parse(readFileSync(join(__dirname, "..", "src", "data", "listening", "part1.json"), "utf8"));

  for (const q of data.questions) {
    const bgKey = q.sceneBg || "office";
    const p = PALETTES[bgKey] || PALETTES.office;
    const fn = scenes[q.id];
    if (!fn) {
      console.log(`SKIP ${q.id} — no scene generator`);
      continue;
    }

    const inner = fn(p);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="${p.bg1}"/>
      <stop offset="100%" stop-color="${p.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgGrad)" rx="16"/>
  ${inner}
  <rect x="0" y="0" width="${W}" height="${H}" rx="16" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.3"/>
</svg>`;

    const outPath = join(OUT, `${q.id}.png`);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    console.log(`✓ ${q.id}.png`);
  }
  console.log("Done!");
}

generate().catch(console.error);
