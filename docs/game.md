## Game Logic (`gameLogic.js`)

Controls the full game flow using a simple state machine:

| State      | Meaning                                                    |
| ---------- | ---------------------------------------------------------- |
| `SETUP`    | Waiting for the user to connect the controller.            |
| `READY`    | Controller connected, waiting to start.                    |
| `PLAYING`  | The 15-second timer is running and the drone is drawing.   |
| `CHECKING` | The drawing is being analyzed.                             |
| `DONE`     | The score and feedback are shown, and the user can replay. |

### Settings

| Constant       | Value | Description                                  |
| -------------- | ----- | -------------------------------------------- |
| `PASS_SCORE`   | `80`  | Minimum score (%) needed to pass.            |
| `GAME_SECONDS` | `15`  | Length of each round in seconds.             |
| `SPEED`        | `10`  | Drone movement speed.                        |
| `STICK_MAX`    | `400` | Maximum value read from the controller stick.|
| `GRID`         | `100` | Size of one grid cell on the canvas.         |

## How It Works

```
USB controller --stick values--> arduino.js --> drone moves --> drawing.js (canvas)
                                                                     |
                      score + feedback  <--  match_logic.js  <-- gameLogic.js
```

1. Click **Connect USB Controller** to connect the controller.
2. Choose a level: Rectangle, Circle, or Triangle.
3. Click start, then move the drone with the right stick to draw the shape before the 15-second timer ends.
4. The drawing is checked against the selected shape.
5. The game shows a score, **SUCCESS** or **FAILED**, and feedback. Click **Play Again** to retry.

### Run

No installation needed:

1. Download or clone the repo.
2. Open `index.html` in your browser.
3. Connect your USB controller and click **Connect USB Controller**.
