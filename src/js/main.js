// js/main.js
// Connects the game logic to the page. Replaces the old script.js.
// gameLogic.js decides WHAT happens; this file only renders it and forwards input.
import game, { STATES } from './gameLogic.js';

const DEV_KEYS = true; // press 1 / 2 to fake the matcher. Set to false (or delete) when matcher.js is wired in.

const $ = (id) => document.getElementById(id);
const dot = $('status-dot');
const statusText = $('status-text');
const startBtn = $('start-btn');
const changeBtn = $('change-btn');
const levelLabel = $('level-label');
const timerEl = $('timer');
const toast = $('toast');
const results = $('results');
const canvas = $('game');
const ctx = canvas.getContext('2d');

const LEVEL_NAMES = { LEVEL_1: 'Level 1 · Square', LEVEL_2: 'Level 2 · Triangle' };

// ---------- Canvas ----------
// The drawing team will own the canvas later. For now we only clear it and show the idle text.
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function drawIdleText() {
  ctx.fillStyle = '#94a3b8';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('press start to play', canvas.width / 2, canvas.height / 2);
}

// ---------- Main button ----------
// One button changes its label and action with the game state:
// Start -> (playing) -> Resume / Try again / Start again
let buttonAction = null;
let resumeRemaining = 0;

function setButton(label, enabled, action) {
  startBtn.textContent = label;
  startBtn.disabled = !enabled;
  buttonAction = action;
}

startBtn.addEventListener('click', () => {
  if (buttonAction) buttonAction();
});

// ---------- Render ----------
function render(s) {
  // Connection indicator
  dot.classList.toggle('connected', s.isDroneConnected);
  statusText.textContent = s.isDroneConnected ? 'Controller Connected' : 'Controller Not Connected';

  // Level label and countdown
  const levelName = s.level ? LEVEL_NAMES[s.level] : '';
  levelLabel.textContent = s.state === STATES.PAUSED ? `${levelName} (paused)` : levelName;
  timerEl.textContent = s.remaining == null ? '' : `${s.remaining}s`;

  // Main button
  switch (s.state) {
    case STATES.START:
      setButton('Start', s.canStart, () => game.startGame());
      break;
    case STATES.LEVEL_1:
    case STATES.LEVEL_2:
      setButton('Playing...', false, null);
      break;
    case STATES.PAUSED:
      if (s.resumeStatus === 'ready') setButton('Resume', true, () => game.resume());
      else if (s.resumeStatus === 'counting') setButton(`Resuming in ${resumeRemaining}...`, false, null);
      else setButton('Controller disconnected', false, null);
      break;
    case STATES.FAILED:
      setButton('Try again', s.canStart, () => game.startGame());
      break;
    case STATES.COMPLETED:
      setButton('Start again', true, () => game.resetGame());
      break;
  }

  // Change mode: only on start and success screens, and only with a controller
  const modeAllowed = s.state === STATES.START || s.state === STATES.COMPLETED;
  changeBtn.disabled = !(s.isDroneConnected && modeAllowed);

  // Success summary
  if (s.state === STATES.COMPLETED) {
    results.textContent =
      `Level 1: ${s.results.level1TimeLeft}s left · Level 2: ${s.results.level2TimeLeft}s left`;
    results.hidden = false;
  } else {
    results.hidden = true;
  }

  // Idle text on the start screen
  if (s.state === STATES.START) drawIdleText();
}

// ---------- Game events ----------
game.on('stateChange', render);
game.on('tick', ({ remaining }) => { timerEl.textContent = `${remaining}s`; });
game.on('resumeTick', ({ remaining }) => {
  resumeRemaining = remaining;
  startBtn.textContent = `Resuming in ${remaining}...`;
});
game.on('clearCanvas', clearCanvas);
game.on('modeChange', () => {
  // Change mode is not designed yet.
});

let toastTimer;
game.on('message', ({ text, type, duration }) => {
  toast.textContent = text;
  toast.className = `toast ${type}`;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, duration);
});

changeBtn.addEventListener('click', () => game.openChangeMode());

// ---------- Controller (Gamepad API) ----------
// Replace these with the arduino.js hook once the Arduino team's API is settled.
window.addEventListener('gamepadconnected', (e) => {
  console.log('Gamepad connected:', e.gamepad.id);
  game.setDroneConnected(true);
});
window.addEventListener('gamepaddisconnected', (e) => {
  console.log('Gamepad disconnected:', e.gamepad.id);
  game.setDroneConnected(false);
});
if ([...navigator.getGamepads()].some(Boolean)) game.setDroneConnected(true);

// ---------- Matcher placeholder ----------
// Real version, once matcher.js exists:
//   matcher.onMatch((shape) => {
//     if (shape === 'square') game.completeLevel1();
//     if (shape === 'triangle') game.completeLevel2();
//   });
if (DEV_KEYS) {
  window.addEventListener('keydown', (e) => {
    if (e.key === '1') game.completeLevel1();
    if (e.key === '2') game.completeLevel2();
  });
  window.game = game; // handy in the browser console while developing
}

// ---------- Initial render ----------
render(game.getSnapshot());