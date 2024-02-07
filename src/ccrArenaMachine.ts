import { createMachine, assign } from "xstate";

export const machine = createMachine(
  {
    context: {
      lights: {
        color: "idle",
        state: "idle",
      },
      matchLength: 5,
      timerSeconds: 10,
    },
    id: "ccrArenaMachine",
    initial: "Idle",
    states: {
      Idle: {
        entry: {
          type: "init",
        },
        on: {
          "Prepare For Next Match": {
            target: "Match Prep",
          },
        },
      },
      "Match Prep": {
        entry: {
          type: "setLightsYellow",
        },
        initial: "Drivers Readying",
        states: {
          "Drivers Readying": {
            on: {
              "Drivers Ready": {
                target: "Wait to Start Match",
              },
            },
          },
          "Wait to Start Match": {
            on: {
              "Start Match": {
                target: "#ccrArenaMachine.Fight",
              },
            },
          },
        },
      },
      Fight: {
        initial: "3",
        states: {
          "1": {
            entry: {
              type: "setLightsYellow",
            },
            after: {
              "1000": {
                target: "#ccrArenaMachine.Fight.Timer Running",
                actions: [
                  {
                    type: "setLightsGreen",
                  },
                ],
                meta: {},
                reenter: true,
              },
            },
          },
          "2": {
            after: {
              "1000": {
                target: "#ccrArenaMachine.Fight.1",
                actions: [],
                meta: {},
              },
            },
          },
          "3": {
            entry: {
              type: "setLightsRed",
            },
            after: {
              "1000": {
                target: "#ccrArenaMachine.Fight.2",
                actions: [],
                meta: {},
              },
            },
          },
          "Timer Running": {
            after: {
              "1000": {
                target: "#ccrArenaMachine.Fight.Timer Running",
                actions: [
                  {
                    type: "TICK",
                  },
                ],
                meta: {},
                reenter: true,
              },
            },
            always: {
              target: "#ccrArenaMachine.Match Done",
              guard: "isTimerDone",
            },
            on: {
              "Tap Out": {
                target: "#ccrArenaMachine.Match Done",
              },
            },
          },
          paused: {
            entry: {
              type: "setLightsYellow",
            },
            on: {
              "Resume Match": {
                target: "3",
              },
            },
          },
        },
        on: {
          "Pause Match": {
            target: ".paused",
          },
          "End Match": {
            target: "Match Done",
          },
        },
      },
      "Match Done": {
        after: {
          "10000": {
            target: "#ccrArenaMachine.Idle",
            actions: [],
            meta: {},
          },
        },
      },
    },
    on: {
      Reset: {
        target: ".Idle",
      },
      matchLengthChange: {
        actions: assign({
          matchLength: ({ context, event }) =>
            event.matchLength ? event.matchLength : context.matchLength,
          timerSeconds: ({ context, event }) =>
            event.matchLength ? event.matchLength : context.timerSeconds,
        }),
      },
    },
    types: {
      events: {} as
        | { type: "Reset" }
        | { type: "Tap Out" }
        | { type: "End Match" }
        | { type: "Pause Match" }
        | { type: "Start Match" }
        | { type: "Resume Match" }
        | { type: "Drivers Ready" }
        | { type: "Prepare For Next Match" }
        | { type: "matchLengthChange"; matchLength: number },
      context: {} as {
        lights: { color: string; state: string };
        matchLength: number;
        timerSeconds: number;
      },
    },
  },
  {
    actions: {
      init: assign({
        timerSeconds: ({ context }) => context.matchLength,
        lights: { color: "idle", state: "idle" },
      }),
      TICK: assign({
        timerSeconds: ({ context }) => context.timerSeconds - 1,
      }),
      setLightsRed: assign({
        lights: { color: "red", state: "solid" },
      }),
      setLightsYellow: assign({
        lights: { color: "yellow", state: "solid" },
      }),
      setLightsGreen: assign({
        lights: { color: "green", state: "solid" },
      }),
    },
    actors: {},
    guards: {
      isTimerDone: function ({ context }) {
        return context.timerSeconds <= 0;
      },
    },
    delays: {},
  }
);
