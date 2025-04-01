import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import express from "express";
import { AudioEnum, ccrLights, machine } from "./ccrArenaMachine.js";
import { AnyMachineSnapshot, createActor } from "xstate";
import { CCRSerialPort, getSerialPort } from "./ccrSerialPort.js";

let ccrSerialPort = await getSerialPort();

ccrSerialPort.port?.on("data", onSerialData);

function onSerialData(data: Buffer) {
  const _data = data.toString();
  console.log(_data);
  switch (_data) {
    case "1":
    case "2":
      actor.send({ type: "ccrHidden.ButtonPress" });
      break;
    default:
      break;
  }
}

function getNextTransitions(state: AnyMachineSnapshot) {
  //Patterns used to ignore some transitions
  const regIgnoreTimedTransitions = /^xstate\.after\..*$/;
  const regIgnoreMatchLengthTransition = /^matchLengthChange.*$/;
  const regIgnoreNoShow = /^ccrHidden\..*$/;

  return state._nodes
    .flatMap((node) =>
      [...node.transitions.values()].map((item) =>
        item.filter(
          (item) =>
            !(
              regIgnoreTimedTransitions.test(item.eventType) ||
              regIgnoreMatchLengthTransition.test(item.eventType) ||
              regIgnoreNoShow.test(item.eventType)
            )
        )
      )
    )
    .flat(1);
}

function ccrPlayAudio(sound: AudioEnum) {
  let soundType = "";
  switch (sound) {
    case AudioEnum.start:
      soundType = "ccrStart";
      break;
    case AudioEnum.countdown:
      soundType = "ccrCountdown";
      break;
    case AudioEnum.buzzer:
      soundType = "ccrBuzzer";
      break;
    case AudioEnum.ready:
      soundType = "ccrReady";
      break;
    default:
      //Don't do anything for other sounds
      return;
  }

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        `<div id="ccrAudio"><script>${soundType}.play()</script></div>`
      );
    }
  });
}

function ccrSetOverHeadLights(on: boolean) {
  on ?
    ccrSerialPort?.port?.write("L") :
    ccrSerialPort?.port?.write("l");
}

let lastLights = { color: "" };
function ccrSetLights(lights: ccrLights) {
  if (lastLights.color === lights.color) {
    return;
  }
  lastLights = lights;
  switch (lights.color) {
    case "idle":
      ccrSerialPort?.port?.write("S");
      break;
    case "green":
      ccrSerialPort?.port?.write("G");
      break;
    case "yellow":
      ccrSerialPort?.port?.write("Y");
      break;
    case "red":
      ccrSerialPort?.port?.write("R");
      break;
    default:
      //Don't do anything for other cases
      return;
  }
}

const PORT = 3000;

const app = express();
app.use(express.static("./src/static"));

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const actor = createActor(machine, {
  input: { playAudio: ccrPlayAudio, setLights: ccrSetLights, setOverHeadLights: ccrSetOverHeadLights },
});
let lastSnapshot = actor.getSnapshot();

wss.on("connection", function connection(ws) {
  console.log("Client Connected");
  ws.on("error", console.error);

  ws.on("message", (message) => {
    console.log("received: %s", message);
    const data = JSON.parse(message.toString());
    if (data.matchLength) {
      actor.send({
        type: "matchLengthChange",
        matchLength: Number(data.matchLength),
      });
    } else {
      actor.send({ type: data.message });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.send(initClientState(lastSnapshot));
});

actor.subscribe((state) => {
  const currentClientState = formatClientStateDiff(state);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(currentClientState);
    }
  });
  lastSnapshot = state;
});

function initClientState(state: AnyMachineSnapshot) {
  const ccrTimer = formatTimer(state);
  const ccrButtons = formatButtons(state);
  const ccrState = formatCurrentState(state);
  const ccrContext = formatCurrentContext(state);
  const _ccrSerialPort = formatSerialPort(ccrSerialPort);

  return [ccrTimer, ccrButtons, ccrState, _ccrSerialPort, ccrContext].join(
    "\n"
  );
}

function formatClientStateDiff(state: AnyMachineSnapshot) {
  const ccrTimer = formatTimer(state);
  let ccrButtons = "";
  let ccrState = "";
  const ccrContext = formatCurrentContext(state);

  if (JSON.stringify(state.value) !== JSON.stringify(lastSnapshot.value)) {
    ccrButtons = formatButtons(state);
    ccrState = formatCurrentState(state);
  }

  return [ccrTimer, ccrButtons, ccrState, ccrContext].join("\n");
}

function formatSerialPort(serialPort: CCRSerialPort) {
  const serialPortText = serialPort.port?.isOpen ? "open" : "closed";
  return `<div id="ccrSerialPort">Serial port is ${serialPortText}</div>`;
}

function formatTimer(state: AnyMachineSnapshot) {
  let minutes = "00";
  let seconds = "00";
  let timerString = "";
  const timerSeconds = state.context.timerSeconds;

  const _fight =
    typeof state.value !== "string" && state.value["Fight"]["Running"]
      ? state.value["Fight"]["Running"]
      : "";
  switch (_fight) {
    case "3":
    case "2":
    case "1":
      seconds = `0${_fight}`;
      break;
    default:
      minutes = Math.floor(timerSeconds / 60)
        .toString()
        .padStart(2, "0");
      seconds = (timerSeconds % 60).toString().padStart(2, "0");
  }

  timerString = `${minutes}:${seconds}`;

  return `<div id=ccrTimer style="color:${state.context.lights.color};">${timerString}</div>`;
}

function formatButtons(state: AnyMachineSnapshot) {
  return `<div id=ccrButtons>
${getNextTransitions(state)
      .map((t) => {
        return `<button name=message value="${t.eventType}" ws-send>${t.eventType}</button>`;
      })
      .join("")}
</div>`;
}

function formatCurrentState(state: AnyMachineSnapshot) {
  return `<div id=ccrState>
${JSON.stringify(state.value)}
</div>`;
}

function formatCurrentContext(state: AnyMachineSnapshot) {
  return `<div id=ccrContext>
<pre>${JSON.stringify(state.context, null, "  ")}</pre>
</div>`;
}

wss.on("listening", () => {
  console.log(`WebSocket server started on port ${PORT}`);
  actor.start();
});

server.listen(PORT);
