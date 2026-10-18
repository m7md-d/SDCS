function moveDrone() {
  if (state !== "PLAYING") return;

  drone.x -= (stick.x / STICK_MAX) * SPEED;
  drone.y -= (stick.y / STICK_MAX) * SPEED;
  path.push({ x: drone.x, y: drone.y });
}

function drawPath(ctx, zoom, shiftX, shiftY, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (const point of path) {
    ctx.lineTo(point.x * zoom + shiftX, point.y * zoom + shiftY);
  }
  ctx.stroke();
}

function fitInBox(boxWidth, boxHeight) {
  let left = path[0].x;
  let right = path[0].x;
  let top = path[0].y;
  let bottom = path[0].y;
  for (const point of path) {
    if (point.x < left) left = point.x;
    if (point.x > right) right = point.x;
    if (point.y < top) top = point.y;
    if (point.y > bottom) bottom = point.y;
  }

  const width = right - left;
  const height = bottom - top;
  const middleX = (left + right) / 2;
  const middleY = (top + bottom) / 2;

  const biggestSide = Math.max(width, height, 1);
  const smallestBoxSide = Math.min(boxWidth, boxHeight);
  const zoom = (smallestBoxSide * 0.8) / biggestSide;

  const shiftX = boxWidth / 2 - middleX * zoom;
  const shiftY = boxHeight / 2 - middleY * zoom;

  return { zoom, shiftX, shiftY };
}

function drawGrid(shiftX, shiftY) {
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = shiftX % GRID; x < canvas.width; x += GRID) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }
  for (let y = shiftY % GRID; y < canvas.height; y += GRID) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state === "DONE") {
    const fit = fitInBox(canvas.width, canvas.height);
    drawPath(ctx, fit.zoom, fit.shiftX, fit.shiftY, "white");
  } else {
    const shiftX = canvas.width / 2 - drone.x;
    const shiftY = canvas.height / 2 - drone.y;
    drawGrid(shiftX, shiftY);
    drawPath(ctx, 1, shiftX, shiftY, "white");

    ctx.fillStyle = "skyblue";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

function makePicture() {
  const pic = document.createElement("canvas");
  pic.width = 256;
  pic.height = 256;
  const pictureCtx = pic.getContext("2d");
  pictureCtx.fillStyle = "white";
  pictureCtx.fillRect(0, 0, 256, 256);

  const fit = fitInBox(256, 256);
  drawPath(pictureCtx, fit.zoom, fit.shiftX, fit.shiftY, "black");

  return pic.toDataURL("image/jpeg", 0.8).split(",")[1]; 
}