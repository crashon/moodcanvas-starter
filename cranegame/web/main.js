import * as THREE from "https://esm.sh/three@0.160.0";
import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "https://esm.sh/cannon-es@0.20.0";

const app = document.getElementById("app");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const highEl = document.getElementById("high");
const fpsEl = document.getElementById("fps");
const coinsEl = document.getElementById("coins");
const btnInsert = document.getElementById("btn-insert");
const btnStart = document.getElementById("btn-start");
const overlay = document.getElementById("overlay");
const difficultySel = document.getElementById("difficulty");
const btnUp = document.getElementById("btn-up");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnGrab = document.getElementById("btn-grab");
const muteCheckbox = document.getElementById("mute");
const btnPause = document.getElementById("btn-pause");
const btnCam = document.getElementById("btn-cam");
const btnHelp = document.getElementById("btn-help");
const instructions = document.getElementById("instructions");
const closeInstructions = document.getElementById("close-instructions");
const btnResetHigh = document.getElementById("btn-reset-high");
const btnRecord = document.getElementById("btn-record");
const btnPlay = document.getElementById("btn-play");
const btnSaveReplay = document.getElementById("btn-save-replay");
const btnLoadReplay = document.getElementById("btn-load-replay");
const replaySpeedSel = document.getElementById("replay-speed");
const optShadows = document.getElementById("opt-shadows");
const optParticles = document.getElementById("opt-particles");
const optMiniGrid = document.getElementById("opt-minigrid");

// Simple WebAudio beeps
let audioCtx = null;
let mute = false;
const settings = {
  shadows: true,
  particles: true,
  miniGrid: false,
};
function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
}
function beep(freq = 440, dur = 0.1, volume = 0.2, type = "sine") {
  if (!audioCtx || mute) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  osc.start(now);
  osc.stop(now + dur);
}

// Achievement notification system
function showAchievement(text) {
  const div = document.createElement("div");
  div.textContent = text;
  div.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 2000;
    background: linear-gradient(135deg, #ffd166, #ff6b6b);
    color: #000; padding: 12px 20px; border-radius: 8px;
    font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transform: translateX(100%); transition: transform 0.3s ease;
  `;
  document.body.appendChild(div);
  
  // Animate in
  setTimeout(() => div.style.transform = "translateX(0)", 10);
  
  // Auto remove
  setTimeout(() => {
    div.style.transform = "translateX(100%)";
    setTimeout(() => div.remove(), 300);
  }, 2000);
}

// Input visualization for replay
function showInputViz(key, isDown) {
  if (inputViz) inputViz.remove();
  
  const keyNames = {
    'w': 'W', 'ArrowUp': '↑',
    's': 'S', 'ArrowDown': '↓', 
    'a': 'A', 'ArrowLeft': '←',
    'd': 'D', 'ArrowRight': '→',
    ' ': 'SPACE'
  };
  
  const keyName = keyNames[key] || key.toUpperCase();
  inputViz = document.createElement("div");
  inputViz.textContent = `${keyName} ${isDown ? '↓' : '↑'}`;
  inputViz.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8); color: #ffd166; padding: 8px 16px;
    border-radius: 6px; font-weight: bold; font-size: 18px;
    z-index: 1500; pointer-events: none;
  `;
  document.body.appendChild(inputViz);
  
  setTimeout(() => {
    if (inputViz) {
      inputViz.style.opacity = '0';
      inputViz.style.transition = 'opacity 0.3s ease';
      setTimeout(() => inputViz.remove(), 300);
    }
  }, 200);
}

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
app.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;

// Scene & Camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f14);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(6, 6, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Minimap camera
const miniCamSize = 10;
const miniCam = new THREE.OrthographicCamera(-miniCamSize, miniCamSize, miniCamSize, -miniCamSize, 0.1, 100);
miniCam.position.set(0, 20, 0.001);
miniCam.up.set(0, 0, -1);
miniCam.lookAt(0, 0, 0);
// Enable extra overlay layer for minimap
const MINI_LAYER = 1;
miniCam.layers.enable(MINI_LAYER);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 0.9);
dir.position.set(5, 10, 7);
dir.castShadow = true;
scene.add(dir);

// Physics world
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
// narrowphase improvements
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;

// Materials
const defaultMat = new CANNON.Material("default");
const fingerMat = new CANNON.Material("finger");
const plushMat = new CANNON.Material("plush");
const caseMat = new CANNON.Material("case");
const defaultContact = new CANNON.ContactMaterial(defaultMat, defaultMat, { friction: 0.6, restitution: 0.05 });
const fingerContact = new CANNON.ContactMaterial(fingerMat, defaultMat, { friction: 0.95, restitution: 0.02 });
const fingerPlushContact = new CANNON.ContactMaterial(fingerMat, plushMat, { friction: 1.0, restitution: 0.02 });
const fingerCaseContact = new CANNON.ContactMaterial(fingerMat, caseMat, { friction: 0.75, restitution: 0.02 });
const groundPlushContact = new CANNON.ContactMaterial(defaultMat, plushMat, { friction: 0.7, restitution: 0.05 });
const groundCaseContact = new CANNON.ContactMaterial(defaultMat, caseMat, { friction: 0.5, restitution: 0.03 });
world.addContactMaterial(defaultContact);
world.addContactMaterial(fingerContact);
world.addContactMaterial(fingerPlushContact);
world.addContactMaterial(fingerCaseContact);
world.addContactMaterial(groundPlushContact);
world.addContactMaterial(groundCaseContact);
world.defaultContactMaterial = defaultContact;

// Helpers
function createRigidBox({ size, position, mass = 0, color = 0x8899aa }) {
  const [sx, sy, sz] = size;
  const geometry = new THREE.BoxGeometry(sx, sy, sz);
  const material = new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.6 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(...position);
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(sx / 2, sy / 2, sz / 2));
  const body = new CANNON.Body({ mass, shape, material: defaultMat });
  body.position.set(...position);
  world.addBody(body);
  return { mesh, body };
}

function createRigidSphere({ radius, position, mass = 1, color = 0xff7777 }) {
  const geometry = new THREE.SphereGeometry(radius, 24, 16);
  const material = new THREE.MeshStandardMaterial({ color, metalness: 0.05, roughness: 0.7 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(...position);
  scene.add(mesh);

  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({ mass, shape, material: defaultMat });
  body.position.set(...position);
  world.addBody(body);
  return { mesh, body };
}

// Ground (tray)
const ground = createRigidBox({ size: [12, 0.5, 12], position: [0, -0.25, 0], mass: 0, color: 0x22313f });

// Walls to keep items inside
const wallThickness = 0.3;
const wallHeight = 2.2;
createRigidBox({ size: [12, wallHeight, wallThickness], position: [0, wallHeight / 2 - 0.25, -6 + wallThickness / 2], mass: 0, color: 0x1b2631 });
createRigidBox({ size: [12, wallHeight, wallThickness], position: [0, wallHeight / 2 - 0.25, 6 - wallThickness / 2], mass: 0, color: 0x1b2631 });
createRigidBox({ size: [wallThickness, wallHeight, 12], position: [-6 + wallThickness / 2, wallHeight / 2 - 0.25, 0], mass: 0, color: 0x1b2631 });
createRigidBox({ size: [wallThickness, wallHeight, 12], position: [6 - wallThickness / 2, wallHeight / 2 - 0.25, 0], mass: 0, color: 0x1b2631 });

// Goal chute (opening along +X side)
createRigidBox({ size: [wallThickness, 1.0, 3.5], position: [6 - wallThickness / 2, 0.25, -3.25], mass: 0, color: 0x1b2631 });
createRigidBox({ size: [wallThickness, 1.0, 3.5], position: [6 - wallThickness / 2, 0.25, 3.25], mass: 0, color: 0x1b2631 });
// Ramp/funnel inside chute
createRigidBox({ size: [2.0, 0.2, 3.6], position: [5.0, 0.2, 0], mass: 0, color: 0x2c3e50 });

// Win detection zone (sensor) just beyond the side wall
const goalSensorShape = new CANNON.Box(new CANNON.Vec3(0.25, 0.75, 1.8));
const goalSensor = new CANNON.Body({ mass: 0, type: CANNON.BODY_TYPES.KINEMATIC });
goalSensor.addShape(goalSensorShape);
goalSensor.collisionResponse = 0; // sensor; no physical response
goalSensor.position.set(6.6, 0.75, 0);
world.addBody(goalSensor);

// Gantry rails (visual)
createRigidBox({ size: [12, 0.2, 0.2], position: [0, 4.5, -3.5], mass: 0, color: 0x6c7a89 });
createRigidBox({ size: [12, 0.2, 0.2], position: [0, 4.5, 3.5], mass: 0, color: 0x6c7a89 });
createRigidBox({ size: [0.2, 0.2, 7], position: [0, 4.7, 0], mass: 0, color: 0x6c7a89 });

// Carriage that moves X/Z
const carriage = createRigidBox({ size: [1.2, 0.3, 1.2], position: [0, 4.3, 0], mass: 0.1, color: 0xaab0b6 });
carriage.body.type = CANNON.BODY_TYPES.KINEMATIC;
carriage.body.updateMassProperties();

// Hook body hanging below carriage
const hook = createRigidSphere({ radius: 0.25, position: [0, 3.3, 0], mass: 0.3, color: 0xf1c40f });
const rope = new CANNON.DistanceConstraint(carriage.body, hook.body, 1.0);
world.addConstraint(rope);

// Rope visualization
const ropePoints = [new THREE.Vector3(), new THREE.Vector3()];
const ropeGeom = new THREE.BufferGeometry().setFromPoints(ropePoints);
const ropeMat = new THREE.LineBasicMaterial({ color: 0xe6edf3, linewidth: 2 });
const ropeLine = new THREE.Line(ropeGeom, ropeMat);
scene.add(ropeLine);

// Simple particles for scoring
const particles = [];
function spawnParticles(origin) {
  if (!settings.particles) return;
  const count = 12;
  for (let i = 0; i < count; i++) {
    const geom = new THREE.SphereGeometry(0.05, 8, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
    const m = new THREE.Mesh(geom, mat);
    m.position.set(origin.x, origin.y, origin.z);
    scene.add(m);
    const v = new THREE.Vector3((Math.random()-0.5)*2, Math.random()*2, (Math.random()-0.5)*2);
    particles.push({ mesh: m, velocity: v, life: 0.6 });
  }
}

// Minimap overlays: arena boundary and goal icon
(function addMiniMapOverlays() {
  const y = 0.03;
  // Boundary rectangle (matches inner wall extents ~ +/-6)
  const boundaryGeom = new THREE.BufferGeometry();
  const bx = 6 - (typeof wallThickness !== 'undefined' ? wallThickness / 2 : 0.15);
  const bz = 6 - (typeof wallThickness !== 'undefined' ? wallThickness / 2 : 0.15);
  const boundaryVerts = new Float32Array([
    -bx, y, -bz,
     bx, y, -bz,
     bx, y,  bz,
    -bx, y,  bz,
  ]);
  boundaryGeom.setAttribute('position', new THREE.BufferAttribute(boundaryVerts, 3));
  const boundaryMat = new THREE.LineBasicMaterial({ color: 0x00d1ff });
  const boundary = new THREE.LineLoop(boundaryGeom, boundaryMat);
  boundary.layers.set(MINI_LAYER);
  scene.add(boundary);

  // Goal icon (triangle) positioned from goalSensor
  const triSize = 0.9;
  const t = triSize;
  const triGeom = new THREE.BufferGeometry();
  const triVerts = new Float32Array([
    0, y, -t * 0.8,
    t, y, 0,
    0, y, t * 0.8,
  ]);
  triGeom.setAttribute('position', new THREE.BufferAttribute(triVerts, 3));
  const triMat = new THREE.LineBasicMaterial({ color: 0xffd166 });
  const goalIcon = new THREE.LineLoop(triGeom, triMat);
  goalIcon.layers.set(MINI_LAYER);
  scene.add(goalIcon);
  scene.userData.goalIcon = goalIcon;
  // Optional grid for minimap
  const grid = new THREE.GridHelper(12, 12, 0x335566, 0x223344);
  grid.rotation.x = Math.PI / 2; // lay flat in XZ
  grid.position.y = y;
  grid.layers.set(MINI_LAYER);
  grid.visible = settings.miniGrid;
  scene.add(grid);
  // store for toggling
  scene.userData.miniGrid = grid;
})();

// 3-finger claw using hinge joints
function createFinger(angleRad) {
  const radius = 0.45;
  const height = 0.6;
  const thickness = 0.12;
  const px = hook.body.position.x + Math.cos(angleRad) * radius;
  const pz = hook.body.position.z + Math.sin(angleRad) * radius;
  const py = hook.body.position.y - 0.15;

  // visual + body
  const geometry = new THREE.BoxGeometry(thickness, height, thickness * 1.2);
  const material = new THREE.MeshStandardMaterial({ color: 0xbac3ce, metalness: 0.2, roughness: 0.5 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(px, py, pz);
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(thickness / 2, height / 2, (thickness * 1.2) / 2));
  const body = new CANNON.Body({ mass: 0.15, shape, material: fingerMat });
  body.position.set(px, py, pz);
  world.addBody(body);

  // rotate mesh/body to face inward (around Y axis)
  mesh.rotation.y = angleRad + Math.PI / 2;
  body.quaternion.setFromEuler(0, angleRad + Math.PI / 2, 0, "XYZ");

  // Hinge joint between hook and finger
  const dir = new CANNON.Vec3(Math.cos(angleRad), 0, Math.sin(angleRad));
  // hinge axis is Y (so finger swings inward/outward in XZ plane)
  const axis = new CANNON.Vec3(0, 1, 0);
  const pivotOnHook = new CANNON.Vec3(dir.x * 0.25, -0.05, dir.z * 0.25);
  const pivotOnFinger = new CANNON.Vec3(0, height / 2 - 0.05, 0);
  const hinge = new CANNON.HingeConstraint(hook.body, body, {
    pivotA: pivotOnHook,
    axisA: axis,
    pivotB: pivotOnFinger,
    axisB: axis,
    collideConnected: false,
  });
  world.addConstraint(hinge);
  hinge.enableMotor();
  // modest force; can be tuned
  hinge.motorEquation.maxForce = 8;
  // add angle limits (open/close bounds)
  if (typeof hinge.enableLimit === "function") {
    hinge.enableLimit();
    // allow wide open to slightly closed range; tune as needed
    hinge.setLimits(-0.2, 1.0);
  }

  return { mesh, body, hinge };
}

const fingerAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
const fingers = fingerAngles.map((a) => createFinger(a));

// Mixed items: plushy spheres and phone-case-like boxes
const items = [];
const totalItems = 12;
for (let i = 0; i < totalItems; i++) {
  const x = (Math.random() - 0.5) * 6;
  const z = (Math.random() - 0.5) * 6;
  if (i % 2 === 0) {
    const radius = 0.28 + Math.random() * 0.14;
    const mass = 0.5 + Math.random() * 0.3;
    const item = createRigidSphere({ radius, position: [x, 0.6, z], mass, color: 0x7ed6df });
    item.body.material = plushMat;
    items.push(item);
  } else {
    const sx = 0.7 + Math.random() * 0.15; // phone case length
    const sy = 0.12 + Math.random() * 0.04; // thin
    const sz = 0.38 + Math.random() * 0.12; // width
    const mass = 0.35 + Math.random() * 0.25;
    const color = 0x9aa7b2;
    const box = createRigidBox({ size: [sx, sy, sz], position: [x, 0.7, z], mass, color });
    // give slight random tilt
    box.body.quaternion.setFromEuler(0, Math.random() * Math.PI * 2, 0);
    box.body.material = caseMat;
    items.push(box);
  }
}

// Score / Timer state
let score = 0;
let timeLeft = 60; // seconds
let gameOver = false;
let gameRunning = true;
let coins = 0;
let difficulty = "normal";
const difficultyConfigs = {
  easy: { timer: 90, closeForce: 14, openForce: 6, closeSpeed: -2.2, openSpeed: 1.6 },
  normal: { timer: 60, closeForce: 12, openForce: 6, closeSpeed: -2.0, openSpeed: 1.8 },
  hard: { timer: 45, closeForce: 10, openForce: 6, closeSpeed: -1.7, openSpeed: 2.0 },
};
let highScore = Number(localStorage.getItem("cranegame_high") || 0);
let combo = 0;
let lastScoreTime = 0;

// Replay system
let isRecording = false;
let isPlaying = false;
let recordedActions = [];
let playIndex = 0;
let recordStartTime = 0;
let replaySpeed = 1.0;
let inputViz = null;
function setScore(v) {
  score = v;
  if (scoreEl) scoreEl.textContent = String(score);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("cranegame_high", String(highScore));
    if (highEl) highEl.textContent = String(highScore);
  }
}
function setTime(v) { timeLeft = v; if (timeEl) timeEl.textContent = String(Math.max(0, Math.ceil(timeLeft))); }
function setCoins(v) { coins = v; if (coinsEl) coinsEl.textContent = String(coins); }
function setOverlay(visible) { if (overlay) overlay.style.display = visible ? "flex" : "none"; }
setScore(0);
setTime(60);
setCoins(0);
if (highEl) highEl.textContent = String(highScore);

// Timer tick
let lastTimeUpdate = performance.now();

// Input State
const input = { forward: 0, right: 0, lower: false };

function setInputFromKey(key, isDown) {
  const v = isDown ? 1 : 0;
  if (key === "w" || key === "ArrowUp") input.forward = v;
  if (key === "s" || key === "ArrowDown") input.forward = -v;
  if (key === "d" || key === "ArrowRight") input.right = v;
  if (key === "a" || key === "ArrowLeft") input.right = -v;
  if (key === " ") input.lower = isDown;
  
  // Record action if recording
  if (isRecording && gameRunning) {
    const timestamp = performance.now() - recordStartTime;
    recordedActions.push({ type: 'key', key, isDown, timestamp });
  }
}

window.addEventListener("keydown", (e) => { 
  ensureAudio(); 
  if (e.key === "Escape" && instructions && instructions.style.display === "flex") {
    instructions.style.display = "none";
    return;
  }
  if (!gameOver && gameRunning) setInputFromKey(e.key, true); 
});
window.addEventListener("keyup", (e) => { if (!gameOver && gameRunning) setInputFromKey(e.key, false); });

// Coin / Start buttons
if (btnInsert) btnInsert.addEventListener("click", () => { ensureAudio(); setCoins(coins + 1); });
if (btnStart) btnStart.addEventListener("click", () => {
  ensureAudio();
  if (gameRunning) return;
  if (coins <= 0) { setOverlay(true); return; }
  setCoins(coins - 1);
  gameOver = false;
  gameRunning = true;
  setTime(difficultyConfigs[difficulty].timer);
  setScore(0);
  setOverlay(false);
});
if (btnPause) btnPause.addEventListener("click", () => {
  gameRunning = !gameRunning;
  btnPause.textContent = gameRunning ? "일시정지" : "재개";
});
let topView = false;
if (btnCam) btnCam.addEventListener("click", () => {
  topView = !topView;
  if (topView) {
    camera.position.set(0, 16, 0.001);
    camera.lookAt(0, 0, 0);
    controls.enabled = false;
  } else {
    camera.position.set(6, 6, 10);
    controls.enabled = true;
  }
});
if (btnHelp) btnHelp.addEventListener("click", () => {
  if (instructions) instructions.style.display = "flex";
});
if (closeInstructions) closeInstructions.addEventListener("click", () => {
  if (instructions) instructions.style.display = "none";
});
if (btnResetHigh) btnResetHigh.addEventListener("click", () => {
  if (confirm("최고점을 초기화할까요?")) {
    highScore = 0;
    localStorage.removeItem("cranegame_high");
    if (highEl) highEl.textContent = "0";
  }
});

// Replay system handlers
if (btnRecord) btnRecord.addEventListener("click", () => {
  if (isRecording) {
    // Stop recording
    isRecording = false;
    btnRecord.textContent = "녹화";
    btnRecord.style.background = "";
  } else {
    // Start recording
    isRecording = true;
    recordedActions = [];
    recordStartTime = performance.now();
    btnRecord.textContent = "녹화중";
    btnRecord.style.background = "#ff6b6b";
  }
});

if (btnPlay) btnPlay.addEventListener("click", () => {
  if (isPlaying) {
    // Stop playback
    isPlaying = false;
    playIndex = 0;
    btnPlay.textContent = "재생";
    btnPlay.style.background = "";
  } else if (recordedActions.length > 0) {
    // Start playback
    isPlaying = true;
    playIndex = 0;
    btnPlay.textContent = "재생중";
    btnPlay.style.background = "#5ad878";
    // Reset game state for replay
    setScore(0);
    setTime(difficultyConfigs[difficulty].timer);
    gameOver = false;
    gameRunning = true;
    combo = 0;
  }
});

// Replay save/load handlers
if (btnSaveReplay) btnSaveReplay.addEventListener("click", () => {
  if (recordedActions.length > 0) {
    const replayData = {
      actions: recordedActions,
      timestamp: Date.now(),
      score: score,
      difficulty: difficulty
    };
    localStorage.setItem("cranegame_replay", JSON.stringify(replayData));
    showAchievement("리플레이 저장됨!");
  }
});

if (btnLoadReplay) btnLoadReplay.addEventListener("click", () => {
  const saved = localStorage.getItem("cranegame_replay");
  if (saved) {
    try {
      const replayData = JSON.parse(saved);
      recordedActions = replayData.actions;
      showAchievement("리플레이 불러옴!");
    } catch (e) {
      showAchievement("리플레이 로드 실패");
    }
  }
});

if (replaySpeedSel) replaySpeedSel.addEventListener("change", (e) => {
  replaySpeed = parseFloat(e.target.value);
});

if (muteCheckbox) muteCheckbox.addEventListener("change", (e) => { mute = e.target.checked; });
if (difficultySel) difficultySel.addEventListener("change", (e) => {
  difficulty = e.target.value;
});

// Touch controls
function bindHold(btn, onStart, onEnd) {
  if (!btn) return;
  const start = (e) => { e.preventDefault(); onStart(); };
  const end = (e) => { e.preventDefault(); onEnd(); };
  btn.addEventListener("pointerdown", start);
  btn.addEventListener("pointerup", end);
  btn.addEventListener("pointerleave", end);
  btn.addEventListener("pointercancel", end);
}
bindHold(btnUp, () => { if (!gameOver && gameRunning) input.forward = 1; }, () => { if (!gameOver && gameRunning) input.forward = 0; });
bindHold(btnLeft, () => { if (!gameOver && gameRunning) input.right = -1; }, () => { if (!gameOver && gameRunning) input.right = 0; });
bindHold(btnRight, () => { if (!gameOver && gameRunning) input.right = 1; }, () => { if (!gameOver && gameRunning) input.right = 0; });
bindHold(btnGrab, () => { if (!gameOver && gameRunning) { ensureAudio(); input.lower = true; } }, () => { if (!gameOver && gameRunning) input.lower = false; });

// Options handlers with persistence
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem("cranegame_settings") || "{}");
    settings.shadows = s.shadows ?? settings.shadows;
    settings.particles = s.particles ?? settings.particles;
    settings.miniGrid = s.miniGrid ?? settings.miniGrid;
  } catch {}
}
function saveSettings() {
  localStorage.setItem("cranegame_settings", JSON.stringify(settings));
}
function applySettings() {
  renderer.shadowMap.enabled = !!settings.shadows;
  dir.castShadow = !!settings.shadows;
  const grid = scene.userData.miniGrid;
  if (grid) grid.visible = !!settings.miniGrid;
}
loadSettings();
applySettings();
if (optShadows) { optShadows.checked = settings.shadows; optShadows.addEventListener("change", () => { settings.shadows = optShadows.checked; applySettings(); saveSettings(); }); }
if (optParticles) { optParticles.checked = settings.particles; optParticles.addEventListener("change", () => { settings.particles = optParticles.checked; saveSettings(); }); }
if (optMiniGrid) { optMiniGrid.checked = settings.miniGrid; optMiniGrid.addEventListener("change", () => { settings.miniGrid = optMiniGrid.checked; applySettings(); saveSettings(); }); }

// Show instructions on first visit
if (!localStorage.getItem("cranegame_visited")) {
  if (instructions) instructions.style.display = "flex";
  localStorage.setItem("cranegame_visited", "true");
}

// Remove old fake grab; rely on physical claw

// Reset button
document.getElementById("reset").addEventListener("click", () => {
  carriage.body.position.set(0, 4.3, 0);
  hook.body.position.set(0, 3.3, 0);
  hook.body.velocity.set(0, 0, 0);
  fingers.forEach((f) => {
    const angle = Math.atan2(f.body.position.z - hook.body.position.z, f.body.position.x - hook.body.position.x);
    const radius = 0.45;
    const px = hook.body.position.x + Math.cos(angle) * radius;
    const pz = hook.body.position.z + Math.sin(angle) * radius;
    const py = hook.body.position.y - 0.15;
    f.body.position.set(px, py, pz);
    f.body.velocity.set(0, 0, 0);
    f.body.angularVelocity.set(0, 0, 0);
  });
  items.forEach((it) => {
    const x = (Math.random() - 0.5) * 6;
    const z = (Math.random() - 0.5) * 6;
    it.body.position.set(x, 0.8, z);
    it.body.velocity.set(0, 0, 0);
    it.body.angularVelocity.set(0, 0, 0);
  });
  if (!gameRunning) setOverlay(true);
});

// Game loop
const clock = new THREE.Clock();
let prevClosing = false;
let fpsAccum = 0;
let fpsFrames = 0;
let fpsLast = performance.now();
function tick() {
  const dtRaw = clock.getDelta();
  const dt = Math.min(dtRaw, 1 / 30);

  // Replay playback
  if (isPlaying && recordedActions.length > 0) {
    const currentTime = (performance.now() - recordStartTime) * replaySpeed;
    while (playIndex < recordedActions.length && recordedActions[playIndex].timestamp <= currentTime) {
      const action = recordedActions[playIndex];
      if (action.type === 'key') {
        setInputFromKey(action.key, action.isDown);
        // Show input visualization
        showInputViz(action.key, action.isDown);
      }
      playIndex++;
    }
    if (playIndex >= recordedActions.length) {
      // Replay finished
      isPlaying = false;
      playIndex = 0;
      if (btnPlay) {
        btnPlay.textContent = "재생";
        btnPlay.style.background = "";
      }
      if (inputViz) inputViz.remove();
    }
  }

  // Carriage kinematics
  const speed = 2.5;
  const vx = (input.right) * speed;
  const vz = (-input.forward) * speed;
  const nextX = carriage.body.position.x + vx * dt;
  const nextZ = carriage.body.position.z + vz * dt;
  carriage.body.position.x = THREE.MathUtils.clamp(nextX, -5.2, 5.2);
  carriage.body.position.z = THREE.MathUtils.clamp(nextZ, -5.2, 5.2);

  // Lower / raise hook
  const baseLen = 1.0;
  const minLen = 0.4;
  const maxLen = 3.0;
  const change = (input.lower ? 1 : -1) * 1.8 * dt;
  rope.distance = THREE.MathUtils.clamp(rope.distance + change, minLen, maxLen);

  // Claw motor control: close while lowering, open otherwise
  const closing = input.lower && rope.distance > maxLen * 0.6;
  fingers.forEach((f) => {
    if (closing) {
      f.hinge.setMotorSpeed(difficultyConfigs[difficulty].closeSpeed);
      f.hinge.motorEquation.maxForce = difficultyConfigs[difficulty].closeForce;
    } else {
      f.hinge.setMotorSpeed(difficultyConfigs[difficulty].openSpeed);
      f.hinge.motorEquation.maxForce = difficultyConfigs[difficulty].openForce;
    }
  });
  if (closing && !prevClosing) {
    beep(320, 0.07, 0.15, "square");
  }
  prevClosing = closing;

  // Pause physics when not running
  if (gameRunning) {
    world.step(1 / 60, dt, 3);
  }

  // Win detection: item center enters sensor box (AABB check against goalSensor)
  const gp = goalSensor.position;
  const half = { x: 0.25, y: 0.75, z: 1.8 };
  items.forEach((it) => {
    const p = it.body.position;
    if (
      p.x > gp.x - half.x && p.x < gp.x + half.x &&
      p.y > gp.y - half.y && p.y < gp.y + half.y &&
      p.z > gp.z - half.z && p.z < gp.z + half.z
    ) {
      // Combo system
      const now = performance.now();
      if (now - lastScoreTime < 3000) { // 3 seconds
        combo += 1;
      } else {
        combo = 1;
      }
      lastScoreTime = now;
      
      // Score and respawn outside
      setScore(score + 1);
      
      // Achievement check
      if (combo >= 3) {
        showAchievement(`콤보 ${combo}회!`);
      }
      if (score === 1) {
        showAchievement("첫 득점!");
      }
      if (score === 5) {
        showAchievement("5점 달성!");
      }
      if (score === 10) {
        showAchievement("10점 달성!");
      }
      
      // Pulse effect
      if (scoreEl) {
        scoreEl.style.transition = "transform 0.15s ease, color 0.15s ease";
        scoreEl.style.transform = "scale(1.2)";
        scoreEl.style.color = combo >= 3 ? "#ff6b6b" : "#ffd166";
        setTimeout(() => { if (scoreEl) { scoreEl.style.transform = "scale(1)"; scoreEl.style.color = ""; } }, 160);
      }
      
      // SFX with combo pitch
      const pitch = 880 + (combo * 50);
      beep(pitch, 0.08, 0.2, "sine");
      setTimeout(() => beep(pitch + 440, 0.08, 0.18, "sine"), 60);
      
      // Particles at sensor position
      spawnParticles(gp);
      const x = (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 6;
      it.body.position.set(x, 0.9, z);
      it.body.velocity.set(0, 0, 0);
      it.body.angularVelocity.set(0, 0, 0);
    }
  });

  // Timer update
  const now = performance.now();
  if (gameRunning) timeLeft -= (now - lastTimeUpdate) / 1000;
  lastTimeUpdate = now;
  if (!gameOver) setTime(timeLeft);
  if (!gameOver && timeLeft <= 0) {
    gameOver = true;
    gameRunning = false;
    setOverlay(true);
  }

  // Sync visuals
  ground.mesh.position.copy(ground.body.position);
  ground.mesh.quaternion.copy(ground.body.quaternion);
  carriage.mesh.position.copy(carriage.body.position);
  carriage.mesh.quaternion.copy(carriage.body.quaternion);
  hook.mesh.position.copy(hook.body.position);
  hook.mesh.quaternion.copy(hook.body.quaternion);
  // update rope line
  ropePoints[0].set(carriage.body.position.x, carriage.body.position.y, carriage.body.position.z);
  ropePoints[1].set(hook.body.position.x, hook.body.position.y, hook.body.position.z);
  ropeLine.geometry.setFromPoints(ropePoints);

  // Small score flash effect on HUD
  if (scoreEl) {
    const s = 1 + Math.min(0.25, Math.max(0, (score % 1))); // no-op, placeholder for future animation timeline
    scoreEl.style.transform = `scale(1)`;
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.velocity.y -= 5 * dt; // gravity
    p.mesh.position.addScaledVector(p.velocity, dt);
    p.life -= dt;
    p.mesh.material.opacity = Math.max(0, p.life / 0.6);
    p.mesh.material.transparent = true;
    if (p.life <= 0) {
      scene.remove(p.mesh);
      particles.splice(i, 1);
    }
  }
  fingers.forEach((f) => {
    f.mesh.position.copy(f.body.position);
    f.mesh.quaternion.copy(f.body.quaternion);
  });
  for (const it of items) {
    it.mesh.position.copy(it.body.position);
    it.mesh.quaternion.copy(it.body.quaternion);
  }

  controls.update();
  // Main view
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissorTest(false);
  renderer.render(scene, camera);

  // Minimap view (top-right)
  const miniW = Math.min(280, Math.floor(window.innerWidth * 0.22));
  const miniH = Math.min(180, Math.floor(window.innerHeight * 0.22));
  renderer.setViewport(window.innerWidth - miniW - 8, window.innerHeight - miniH - 8, miniW, miniH);
  renderer.setScissor(window.innerWidth - miniW - 8, window.innerHeight - miniH - 8, miniW, miniH);
  renderer.setScissorTest(true);
  miniCam.position.set(carriage.body.position.x, 20, carriage.body.position.z + 0.001);
  miniCam.lookAt(carriage.body.position.x, 0, carriage.body.position.z);
  renderer.render(scene, miniCam);
  renderer.setScissorTest(false);

  // FPS
  fpsFrames += 1;
  fpsAccum += dtRaw;
  const nowPerf = performance.now();
  if (nowPerf - fpsLast >= 500) {
    const fps = Math.round((fpsFrames / fpsAccum));
    if (fpsEl) {
      fpsEl.textContent = String(fps);
      fpsEl.style.color = fps >= 50 ? "#5ad878" : fps >= 30 ? "#ffd166" : "#ff6b6b";
    }
    fpsFrames = 0; fpsAccum = 0; fpsLast = nowPerf;
  }
  // Update minimap goal icon to goalSensor position
  const gi = scene.userData.goalIcon;
  if (gi) {
    gi.position.set(goalSensor.position.x, 0.03, goalSensor.position.z);
    const angle = Math.atan2(goalSensor.position.z, goalSensor.position.x);
    gi.rotation.y = angle;
  }
  requestAnimationFrame(tick);
}

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Auto-pause on visibility change / blur
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    gameRunning = false;
    if (btnPause) btnPause.textContent = "재개";
  }
});
window.addEventListener("blur", () => {
  gameRunning = false;
  if (btnPause) btnPause.textContent = "재개";
});

tick();


