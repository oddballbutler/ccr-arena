import { setup, assign } from "xstate";

export const enum AudioEnum {
  "start",
  "countdown",
  "buzzer",
  "ready",
}

export interface ccrLights {
  color: "idle" | "green" | "yellow" | "red";
}

export const machine = setup({
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
      | { type: "ccrHidden.ButtonPress" }
      | { type: "matchLengthChange"; matchLength: number },
    context: {} as {
      playAudio: (sound: AudioEnum) => void | null;
      setLights: (lights: ccrLights) => void | null;
      setOverHeadLights: (on: boolean) => void | null;
      lights: ccrLights;
      matchLength: number;
      timerSeconds: number;
    },
    input: {} as {
      playAudio: (sound: AudioEnum) => void | null;
      setLights: (lights: ccrLights) => void | null;
      setOverHeadLights: (on: boolean) => void | null;
    },
  },
  actions: {
    init: ({ context }) => {
      context.lights = { color: "idle" }
      context?.setLights(context.lights)
      context?.setOverHeadLights(true)
      context.timerSeconds = context.matchLength;
    },
    TICK: assign({
      timerSeconds: ({ context }) => context.timerSeconds - 1,
    }),
    overheadLightsOn: ({ context }) => context?.setOverHeadLights(true),
    overheadLightsOff: ({ context }) => context?.setOverHeadLights(false),
    setLightsRed: ({ context }) => {
      context.lights = { color: "red" };
      if (context.setLights) {
        context.setLights(context.lights);
      }
    },
    setLightsYellow: ({ context }) => {
      context.lights = { color: "yellow" };
      if (context.setLights) {
        context.setLights(context.lights);
      }
    },
    setLightsGreen: ({ context }) => {
      context.lights = { color: "green" };
      if (context.setLights) {
        context.setLights(context.lights);
      }
    },
    playCountdown: async ({ context }) => {
      if (context.playAudio) {
        context.playAudio(AudioEnum.countdown);
      }
    },
    playBuzzer: async ({ context }) => {
      if (context.playAudio) {
        context.playAudio(AudioEnum.buzzer);
      }
    },
    playStart: async ({ context }) => {
      if (context.playAudio) {
        context.playAudio(AudioEnum.start);
      }
    },
    playReady: async ({ context }) => {
      if (context.playAudio) {
        context.playAudio(AudioEnum.ready);
      }
    },
  },
  actors: {},
  guards: {
    isTimerDone: function ({ context }) {
      return context.timerSeconds <= 0;
    },
    isLast10: function ({ context }) {
      return context.timerSeconds <= 10 && context.timerSeconds > 0;
    },
  },
  delays: {},
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGNkCcCCawDsCGAsnsgBYCWOYAxAEpxgAuA2gAwC6ioADgPaxkMyPHJxAAPRAFoAnCwB0AZgBMANgUqWAdgAsLAKwKFmzQBoQAT0TSlADjkrtKm3r3alL6QEZPAXx9nUTGx8IlIKagBbPAZSABlcKAYSAGESPBwYVg4kEF5+QWFRCQQHO09pBV13Q08jBTNLBE89L0UFT21tdWk9Gy1tPwD0LFxCYnJKOQBJCAAbagAFbC48bAACADEeNDWAOTAxBjWiGJIs0TyBIREc4trtexY1GwVpG1lpTobET1tpe28Xm0NhUBl+0kGIECIxC43C0zm1ECAAkyBAILg5AAhACuDAYwiWcFg5xylwKN1Ad1siherlcNmMXX03yaCj0nkUgOaKls7iUCkh0OCYzCkw2ZCgJAYVAAojgIMdoqRSdw+FdCrcfjYadoWs4BQ5PCx3KzQZo5NpNH1GbVahyhcMRaEJmA5BKpQw5As8DjYJBaHAcREwErTqrcuqKUVEM57JpQSovJoWEYnp5WZp2palEpNNJrF0lG5Bf4oU7Ri74R7pXIaDicDgKFAqD6-aGTir2Bco9cYwhrACWJ5raous5PDZWW4lHIWJ8bDZyi8k85HUFK3DxZLa-XG825J4qGJYAxom68AAzBhgNAACj0LBYAEoqMLN2K3TWvXumxlDxG5J9lqTTFpyah6E4hheCCmgZhYiApioh59NIDh5mhoJ6OuMKiq67o7j+DZ-lAh7Hqe55yFeN73saT6vu+sKfgRnp1sRB6eIBvaalSPzqOB7JQa8k4qHBrJ6Jos5WiwOoCm4kl6jhzpbl+hFsfu-5KORZ43lR163nedEvm+FZMfh37qSRchKFx+TAbxTQmpyTwYaoSbFsoZoyfYY55q8hhrmWjF4dWam-geCjaZR1EGUZDGmSF26seF-4KLZGqUuIiBOPIwIFsOnwqCo5T1AhJTeby6FZhUCiBUMG5maFyXsf+AAqZAhjsKUtiiaIYjg2J4gSOBErAJLdmS3GZXcsh2L0Sipo4wIrtOHKWp0eWaAYVoCkpH7mWFLWke1nVrN1VDpdGIGeEVFpVEosjzY40imGVTJyH0DhbdBi6OHtjVJbuR1yCdt5nUdF2eNkap2TxWVNHq-wcpBRVvEVolTm9Lxcs4S6MjYjh5v9iWqc1GnHR1YPnSeOkXvptFPsZwVVoDRHkyDlNdUdl32fDzRPNZ7iyManwsF0KjTk+H0pu8otFU+KjEyzbqdiQawACLCNQNPRfThmM0zCXK3Iqsa1rPNw8USiTg8N21GhEnaCOzhmr0lrWltMmTrmcFKypcjq2gZAAG63rAZ1gHgEDmM2VAAMpnmgRyqxb02IK4s7skuI4jrmvxKKyxoOB9k76ByCj6L8mh+8xgch2HEdRzHGQmWgqLopiuL4oS2Bjan-ZwXYMnZwtxVVHohc3bOlUvRORg9DYfhljgPAYvAOTMypPaw2nCCSHbcgcg4kGpkuWcS2VtR2C9MleMJzi1dhQVG-7MzzNvGX9vvtSHzdeoaLVe0IJC7qDsLoRkj4nZMi0DXA6noP5XQcv8ZQRhvCPnnGfScrJczITzMPVw1geg6EVs-BqJMWK1jbP6CACDebFAkooAUcF+YYNqAXMqkEFByGtMVUE-k86wKakDcmtDLaICduBNQWhHYVzguwxo7QuESXnPoCuBDq6kNwsbCy3VDyiN3t4XQH18GDxeOUcSKYPqoR0IYMWaNBGs0sgeJQ+j+x9HkAKFoRVHCQR6PBRovQuGMlkIYB6fQOQDE0cpZiOjgYKFcSBRG9gpFbRsVoX4Fj5CLnnPlfOD0NH1S0f7WJ7NQZcxEZNHe-ZmjqGSdoF61g8y1F5GaDoh83BPi2r0BwSYHEq2VGrTWlAEkOXKNaOcOhrZLjAlmUqjReTyFmcoDyKZB59IDkHUOaBw50Cbs2EZ8NHyzjQuoJ4kknByIvo0X4oIPqghHE7ecoJGRLx8EAA */
  context: ({ input }) => ({
    playAudio: input.playAudio || null,
    setLights: input.setLights || null,
    setOverHeadLights: input.setOverHeadLights || null,
    lights: {
      color: "idle",
      state: "idle",
    },
    matchLength: 180,
    timerSeconds: 180,
  }),
  id: "ccrArenaMachine",
  initial: "Idle",
  states: {
    Idle: {
      entry: {
        type: "init",
      },

      on: {
        "Prepare For Next Match": {
          target: "Drivers Readying",
        },
        "ccrHidden.ButtonPress": {
          target: "Drivers Readying",
          actions: {
            "type": "playReady"
          }
        },
      },
    },

    Fight: {
      initial: "Paused",
      states: {
        Paused: {
          on: {
            "Resume Match": {
              target: "Running",
            },
          },

          entry: "setLightsYellow",
        },
        Running: {
          initial: "3",

          states: {
            "3": {
              entry: [{
                type: "setLightsRed",
              }, "playCountdown", "overheadLightsOff"],

              after: {
                "1000": {
                  target: "2",
                  actions: [],
                  meta: {},
                },
              },
            },

            "2": {
              after: {
                "1000": {
                  target: "1",
                  actions: [],
                  meta: {},
                },
              },

              entry: "playCountdown",
            },

            "1": {
              entry: [
                {
                  type: "setLightsYellow",
                },
                "playCountdown",
              ],

              after: {
                "1000": {
                  target: "Timer Running",
                  actions: [{
                    type: "setLightsGreen",
                  }, "playStart"],
                  meta: {},
                  reenter: true,
                },

                "500": {
                  target: "1",
                  actions: "overheadLightsOn"
                }
              }
            },

            "Timer Running": {
              always: [
                {
                  target: "#ccrArenaMachine.Match Done",
                  guard: "isTimerDone",
                },
                {
                  guard: "isLast10",
                  actions: ["playCountdown", "setLightsYellow"],
                },
              ],

              after: {
                "1000": {
                  target: "Timer Running",

                  actions: [
                    {
                      type: "TICK",
                    },
                  ],

                  reenter: true,
                },
              },

              on: {
                "ccrHidden.ButtonPress": {
                  target: "#ccrArenaMachine.Match Done",
                  description: `Driver has Tapped Out`,
                },
              },
            }
          },

          on: {
            "Pause Match": {
              target: "Paused",
            },
          },
        },
      },
      on: {
        "End Match": {
          target: "Match Done",
        },
      },
    },

    "Match Done": {
      entry: [
        {
          type: "setLightsRed",
        },
        "playBuzzer",
      ],
      after: {
        "10000": {
          target: "#ccrArenaMachine.Idle",
          actions: [],
          meta: {},
        },
      },
    },

    "Drivers Readying": {
      on: {
        "Start Match": {
          target: "Fight.Running",
        },

        "ccrHidden.ButtonPress": {
          target: "Drivers Readying",
          actions: "playReady",
        },
      },

      entry: "setLightsYellow",
    },
  },
  on: {
    Reset: ".Idle",
    matchLengthChange: {
      actions: assign({
        matchLength: ({ context, event }) =>
          event.matchLength || context.matchLength,
        timerSeconds: ({ context, event }) =>
          event.matchLength || context.timerSeconds,
      }),
    },
  },
});
