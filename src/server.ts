import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import express from "express";
import { machine } from "./ccrArenaMachine.js";
// import { createBrowserInspector } from "@statelyai/inspect";
import { AnyMachineSnapshot, createActor } from "xstate";

// const { inspect } = createBrowserInspector({
//   // Comment out the line below to start the inspector
//   // autoStart: true,
// });

const actor = createActor(machine);

function getNextTransitions(state: AnyMachineSnapshot) {
  //Patterns used to ignore some transitions
  const regIgnoreTimedTransitions = /^xstate\.after\..*$/;
  const regIgnoreMatchLengthTransition = /^matchLengthChange.*$/;

  return state._nodes
    .flatMap((node) =>
      [...node.transitions.values()].map((item) =>
        item.filter(
          (item) =>
            !(
              regIgnoreTimedTransitions.test(item.eventType) ||
              regIgnoreMatchLengthTransition.test(item.eventType)
            )
        )
      )
    )
    .flat(1);
}

const PORT = 3000;

const app = express();
app.use(express.static("./src/static"));

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

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

  ws.send(formatClientState(actor.getSnapshot()));
});

actor.subscribe((state) => {
  // console.group("State update");
  // console.log("%cState value:", "background-color: #056dff", state.value);
  // console.log("%cState:", "background-color: #056dff", state);
  // console.groupCollapsed("%cNext events:", "background-color: #056dff");
  // console.log(
  //   getNextTransitions(state)
  //     .map((t) => {
  //       return `feedbackActor.send({ type: '${t.eventType}' })`;
  //     })
  //     .join("\n\n")
  // );
  // console.groupEnd();
  // console.groupEnd();
  const currentClientState = formatClientState(state);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(currentClientState);
    }
  });
});

function formatClientState(state: AnyMachineSnapshot) {
  const ccrTimer = formatTimer(state);
  const ccrButtons = formatButtons(state);
  const ccrState = formatCurrentState(state);
  const ccrContext = formatCurrentContext(state);
  return [ccrTimer, ccrButtons, ccrState, ccrContext].join("\n");
}

function formatTimer(state: AnyMachineSnapshot) {
  let minutes = "00";
  let seconds = "00";
  let timerString = "";
  const timerSeconds = state.context.timerSeconds;

  const _fight =
    typeof state.value !== "string" && state.value["Fight"]
      ? state.value["Fight"]
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

  return `<div id=ccrTimer>${timerString}</div>`;
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
