async function connectController() {
  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    state = "READY";
    statusBar.innerText = "Controller connected";
    mainBtn.innerText = "Start";
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
}