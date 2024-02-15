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
      lights: ccrLights;
      matchLength: number;
      timerSeconds: number;
    },
    input: {} as {
      playAudio: (sound: AudioEnum) => void | null;
      setLights: (lights: ccrLights) => void | null;
    },
  },
  actions: {
    init: ({ context }) => {
      context.lights = { color: "idle" };
      if (context.setLights) {
        context.setLights(context.lights);
      }
      context.timerSeconds = context.matchLength;
    },
    TICK: assign({
      timerSeconds: ({ context }) => context.timerSeconds - 1,
    }),
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
  /** @xstate-layout N4IgpgJg5mDOIC5QGNkCcCCawDsCGAsnsgBYCWOYAxAEpxgAuA2gAwC6ioADgPaxkMyPHJxAAPRAFoAnCwB0AZgBMANgUqWAdgAsLAKwKFmzQBoQAT0TSlADjkrtKm3r3alL6QEZPAXx9nUTGx8IlIKagBbPAZSABlcKAYSAGESPBwYVg4kEF5+QWFRCQQHO09pBV13Q08jBTNLBE89L0UFT21tdWk9Gy1tPwD0LFxCYnJKOQBJCAAbagAFbC48bAACADEeNDWAOTAxBjWiGJIs0TyBIREc4trtexY1GwVpG1lpTobET1tpe28Xm0NhUBl+0kGIECIxC43Ccg2ZCgJAYVAAojgIMdoqRzjlLgUbqA7jZbHJtC1nEp1NpPCx3N8SnpNOTNH0bJparU9L5-FDhsExmFJojkQw5As8ABXWCQWhwKURMDY0547h8K6FW6IZz2TSglReTQsIxPTyMzTtclKJSaaTWLpKNwKSHQwWhCZgBFIlFyGhSnA4ChQKiSmXKk649gXDWEopWJQAlieNmqLrOTw2RluRMsT42GzlF6G5yugWjD3w0W+-2B4NyTxUMSwBjRL14ABmDDAaAAFHSWCwAJRUN0VuEin3i2tBjINtW5WPXeNNdSeewKPROQxeEGcxnMxPaY2k6luTROvRloLj4Ve6vTgOzqByJRNlttuSd7t9gfD0flrCd7emKfpPvWSgLgSy7ak09Lrk8trWCohpOsojIaHYKhpraryGKWfJjkBnogTW4Fzgo76tt2X5dj2-aDv+RFCiRD5gXWFFQUuWrEogTjyMC9rJp8KHlPUFh8SwWE4ZaFQKARQw3sRVZTuxz5yAAKmQSo7DOwYAWgAASZAQBAuByAAQlKDAMMISxwLAXH5DBvFNLIdi9EoJqOMCxbZjy5KdIJmgGMe1LXjCLEqaBelzlpOlrLFIZOZqRLiD8KEslUSiyJ5jjSKYEkIMYDx9A4IU7gWjgRe6E73qpSWadpPaJeRyWeNk6rOTx6VNBS-w8luKFvChKhshaLyKJmvSZmyji2jVt6sQ1bVNQlSVUZ+370X+I7MZWk4xat8UtUlKVxrBzRPK+7iyHSnwsF0KjZoOcgclJ9q6Chg4qItymTJGJBrAAIsI1DNtR7Z0b+jFMYBUUAziQOg5Q50ub1SiZg8ngqLU0igjoKbOBhvSshyehSZmNqcn9CNesDaBkAAbj2sCJWAeAQOY+kAMqtmgRyA2jPXFK4iaboWKYpjavxKIydIOG9mb6DyCj6L8mi0wd9OMyzaBs3QnPcxkBnGaZ5lWTZdnYLAjnRvi3FpcUnJ2FJktebjVR6PLOOJthhpsqrdq9H4fI4DwZnwDk+11TG3VO1IOPrjyDhbiahYS89RW1HYsiYy0ONSeoBha3V0xzGAcepSukjeAocgpxSGjydyILy+odi6OTj0pjoWil8BD5Vxdrn-MoRjeBTeYZ5mjI2ioN0U7JPS9M4v2EfD2ukeKYayhAw-o6LLLj5yV3T7UctFVu9dsrjoJ4TLA-LUdHFQAfIuILS64oWrIU6L-vxGTtHrq4O0BYXjeX0OvRSkUt5sUap4d+CcmgdHkOyZwLsXjlAPMaN6fQCpdDVtoEaT9opkVfq+JBK4+jyGpC0FCjgtw9HNFfSaHJZCGByn0HkAwN5KTptvNS9YFBUNgv1ewagtDMi6FoQBV9cEFjzEJWWOVNZ8NgWXeBx1mq6TaqI1yzR1ASOIXaamtRsIYQ6A3Nwg4Qq9AcIaUhiNTggzBvo3q5Q2RyH6JjQsToUyGAwl5OQlpOFoWNC7JxOtmas3ZkbYM7jRb0jkPjdQTwLxOE5KoeWqg9BvVBCmWkeZQQclDj4IAA */
  context: ({ input }) => ({
    playAudio: input.playAudio || null,
    setLights: input.setLights || null,
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
              entry: [
                {
                  type: "setLightsRed",
                },
                "playCountdown",
              ],

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
                  actions: [
                    {
                      type: "setLightsGreen",
                    },
                    "playStart",
                  ],
                  meta: {},
                  reenter: true,
                },
              },
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
            },
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
