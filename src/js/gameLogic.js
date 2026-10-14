// js/gameLogic.js
// Game state machine for the drone drawing game.
// Pure logic: never touches the DOM. main.js subscribes to events and renders.
//
// States: START -> LEVEL_1 -> LEVEL_2 -> COMPLETED
//         LEVEL_x -> FAILED (countdown reached 0) -> startGame() -> LEVEL_1

export const STATES = Object.freeze({
  START: 'START',
  LEVEL_1: 'LEVEL_1',
  LEVEL_2: 'LEVEL_2',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});

export const CONFIG = {
  levels: {
    LEVEL_1: { seconds: 60, target: 'square', prompt: 'Level 1: draw a square' },
    LEVEL_2: { seconds: 90, target: 'triangle', prompt: 'Level 2: draw a triangle' },
  },
  messageMs: 3000, // main.js should auto-dismiss notifications after this
  messages: {
    notConnected: 'Drone not connected',
    failed: "Time's up! Press Try again to start from Level 1.",
    completed: 'Congratulations! You completed both levels!',
  },
};

class GameLogic {
  constructor(config = CONFIG) {
    this.config = config;
    this.handlers = {};
    this.isDroneConnected = false; // survives resetGame()
    this._tickId = null;
    this._initState();
  }

  _initState() {
    this.state = STATES.START;
    this.remaining = null; // seconds left in the current level
    this.results = { level1TimeLeft: null, level2TimeLeft: null };
  }

  // ---------- Events ----------
  // Events: stateChange, tick, message, clearCanvas, connection
  on(event, handler) {
    (this.handlers[event] ||= []).push(handler);
    return () => {
      this.handlers[event] = this.handlers[event].filter((h) => h !== handler);
    };
  }

  _emit(event, payload) {
    (this.handlers[event] || []).forEach((h) => h(payload));
  }

  _message(text, type = 'info') {
    this._emit('message', { text, type, duration: this.config.messageMs });
  }

  _emitState() {
    this._emit('stateChange', this.getSnapshot());
  }

  getSnapshot() {
    const level =
      this.state === STATES.LEVEL_1 || this.state === STATES.LEVEL_2 ? this.state : null;
    const levelCfg = this.config.levels[level];
    return {
      state: this.state,
      level, // LEVEL_1 / LEVEL_2 / null
      target: levelCfg ? levelCfg.target : null, // tell matcher.js what to check
      remaining: this.remaining,
      isDroneConnected: this.isDroneConnected,
      canStart:
        this.isDroneConnected &&
        (this.state === STATES.START || this.state === STATES.FAILED),
      results: { ...this.results }, // time left per level, for the success screen
    };
  }

  // ---------- Input from Arduino team ----------
  setDroneConnected(connected) {
    connected = Boolean(connected);
    if (connected === this.isDroneConnected) return;
    this.isDroneConnected = connected;
    this._emit('connection', { connected });
    this._emitState(); // also updates canStart on START / FAILED / COMPLETED
  }

  // ---------- Actions (UI buttons) ----------
  startGame() {
    if (this.state !== STATES.START && this.state !== STATES.FAILED) return false;
    if (!this.isDroneConnected) {
      this._message(this.config.messages.notConnected, 'error');
      return false;
    }
    this.results = { level1TimeLeft: null, level2TimeLeft: null };
    this._beginLevel(STATES.LEVEL_1);
    return true;
  }

  resetGame() {
    this._stopTimer();
    this._initState();
    this._emit('clearCanvas');
    this._emitState();
  }

  // ---------- Called by matcher.js ----------
  completeLevel1() {
    if (this.state !== STATES.LEVEL_1) return false;
    this._stopTimer();
    this.results.level1TimeLeft = this.remaining;
    this._beginLevel(STATES.LEVEL_2);
    return true;
  }

  completeLevel2() {
    if (this.state !== STATES.LEVEL_2) return false;
    this._stopTimer();
    this.results.level2TimeLeft = this.remaining;
    this.state = STATES.COMPLETED;
    this._message(this.config.messages.completed, 'success');
    this._emitState();
    return true;
  }

  // ---------- Internals ----------
  _beginLevel(levelKey) {
    const cfg = this.config.levels[levelKey];
    this.state = levelKey;
    this.remaining = cfg.seconds;
    this._emit('clearCanvas');
    this._message(cfg.prompt, 'info');
    this._emit('tick', { remaining: this.remaining });
    this._emitState();
    this._startTimer();
  }

  _startTimer() {
    this._stopTimer();
    this._tickId = setInterval(() => {
      this.remaining -= 1;
      this._emit('tick', { remaining: this.remaining });
      if (this.remaining <= 0) this._fail();
    }, 1000);
  }

  _stopTimer() {
    if (this._tickId !== null) {
      clearInterval(this._tickId);
      this._tickId = null;
    }
  }

  _fail() {
    this._stopTimer();
    this.remaining = 0;
    this.state = STATES.FAILED;
    this._message(this.config.messages.failed, 'error');
    this._emitState();
  }
}

export const game = new GameLogic();
export default game;