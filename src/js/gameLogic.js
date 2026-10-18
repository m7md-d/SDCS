const PASS_SCORE = 80; 
const GAME_SECONDS = 10;
const SPEED = 10;
const STICK_MAX = 400; 
const GRID = 100; 

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const mainBtn = document.getElementById("mainBtn");
const shapeSelect = document.getElementById("shapeSelect");
const timerBox = document.getElementById("timer");
const scoreBox = document.getElementById("score");
const scoreText = document.getElementById("scoreText");
const resultText = document.getElementById("resultText");
const feedbackText = document.getElementById("feedbackText");
const statusBar = document.getElementById("status");

let state = "SETUP"; 
let stick = { x: 0, y: 0 }; 
let drone = { x: 0, y: 0 }; 
let path = []; 

function fitCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", fitCanvas);
fitCanvas();


mainBtn.onclick = () => {
  if (state === "SETUP") connectController();
  else if (state === "READY" || state === "DONE") startGame();
};


function startGame() {
  state = "PLAYING";
  drone = { x: 0, y: 0 };
  path = [{ x: 0, y: 0 }];
  let timeLeft = GAME_SECONDS;

  shapeSelect.disabled = true;
  mainBtn.classList.add("hidden");
  scoreBox.classList.add("hidden");
  timerBox.classList.remove("hidden");
  statusBar.innerText = "Draw a " + shapeSelect.value + "!";

  const timer = setInterval(() => {
    timeLeft -= 0.1;
    timerBox.innerText = timeLeft.toFixed(1);
    if (timeLeft <= 0) {
      clearInterval(timer);
      finishGame();
    }
  }, 100);
}

async function finishGame() {
  state = "CHECKING";
  timerBox.classList.add("hidden");
  statusBar.innerText = "Analyzing your drawing...";
  feedbackText.innerText = "";

  try {
    const result = await matchShape(shapeSelect.value, makePicture());
    const passed = result.score >= PASS_SCORE;
    scoreText.innerText = result.score + "%";
    resultText.innerText = passed ? "SUCCESS" : "FAILED";
    resultText.className = passed
      ? "text-emerald-400 mt-1"
      : "text-rose-400 mt-1";
    feedbackText.innerText = result.feedback;
  } catch (error) {
    console.log(error);
  }

  if (typeof saveDrawingToHistory === "function") saveDrawingToHistory(JSON.parse(JSON.stringify(path)));

  state = "DONE";
  scoreBox.classList.remove("hidden");
  mainBtn.classList.remove("hidden");
  mainBtn.innerText = "Play Again";
  shapeSelect.disabled = false;
  statusBar.innerText = "Here is your drawing";
}