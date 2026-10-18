const historySelect = document.getElementById("historySelect");
const replayBtn = document.getElementById("replayBtn");

let drawHistory = [];
let replayInterval = null;

function saveDrawingToHistory(completedPath) {
    if (!completedPath || completedPath.length === 0) return;

    const drawName = `Draw ${drawHistory.length + 1}`;
    drawHistory.push({ name: drawName, data: completedPath });

    if (drawHistory.length === 1) {
        historySelect.innerHTML = ""; 
        replayBtn.disabled = false;
    }

    const option = document.createElement("option");
    option.value = drawHistory.length - 1;
    option.text = drawName;
    historySelect.appendChild(option);
}

// function sendCoordinatesToArduino(x, y) {}

replayBtn.onclick = () => {
    if (drawHistory.length === 0 || state === "PLAYING" || state === "CHECKING") return;
    
    const selectedIdx = historySelect.value;
    const targetPath = drawHistory[selectedIdx].data;
    if (!targetPath || targetPath.length === 0) return;

    state = "REPLAYING"; 
    drone = { x: 0, y: 0 };
    path = [];
    statusBar.innerText = `Replaying ${drawHistory[selectedIdx].name}...`;

    let step = 0;
    clearInterval(replayInterval);

    replayInterval = setInterval(() => {
        if (step >= targetPath.length) {
            clearInterval(replayInterval);
            state = "DONE";
            statusBar.innerText = "Replay finished";
            return;
        }

        const point = targetPath[step];
        drone.x = point.x;
        drone.y = point.y;
        path.push({ x: drone.x, y: drone.y });

        sendCoordinatesToArduino(drone.x, drone.y);

        step++;
    }, 16); 
};