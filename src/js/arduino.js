async function connectController() {
  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    state = "READY";
    statusBar.innerText = "Controller connected";
    mainBtn.innerText = "Start";
    document.getElementById("mode2Panel").classList.remove("hidden");
    readController(port);
  } catch (err) {
    alert("error to connect the controller.");
  }
}

async function readController(port) {
  const decoder = new TextDecoderStream();
  port.readable.pipeTo(decoder.writable);
  const reader = decoder.readable.getReader();
  let text = "";

  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    text += chunk.value;

    const lines = text.split("\n");
    text = lines.pop(); 

    for (const line of lines) {
      try {
        stick = JSON.parse(line).right;
        document.getElementById("joyText").innerText = `${stick.x}, ${stick.y}`;
      } catch {}
    }
  }
}