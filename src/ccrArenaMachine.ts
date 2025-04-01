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
      context.lights = { color: "idle" };
      if (context.setLights) {
        context.setLights(context.lights);
      }
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
  /** @xstate-layout N4IgpgJg5mDOIC5QGNkCcCCawDsCGAsnsgBYCWOYAxAEpxgAuA2gAwC6ioADgPaxkMyPHJxAAPRAFoAnCwB0AZgBMANgUqWAdgAsLAKwKFmzQBoQAT0TSlADjkrtKm3r3alL6QEZPAXx9nUTGx8IlIKagBbPAZSABlcKAYSAGESPBwYVg4kEF5+QWFRCQQHO09pBV13Q08jBTNLBE89L0UFT21tdWk9Gy1tPwD0LFxCYnJKOQBJCAAbagAFbC48bAACADEeNDWAOTAxBjWiGJIs0TyBIREc4trtexY1GwVpG1lpTobET1tpe28Xm0NhUBl+0kGIECIxC43C0zm1ECAAkyBAILg5AAhACuDAYwiWcFg5xylwKN1Ad1siherlcNmMXX03yaCj0nkUgOaKls7iUCkh0OCYzCkw2ZCgJAYVAAojgIMdoqRSdw+FdCrcfjYadoWs4BQ5PCx3KzQZo5NpNH1GbVahyhcMRaEJmA5BKpQw5As8DjYJBaHAcREwErTqrcuqKUVEM57JpQSovJoWEYnp5WZp2palEpNNJrF0lG5Bf4oU7Ri74R7pXIaDicDgKFAqD6-aGTir2Bco9cYwhrACWJ5raous5PDZWW4lHIWJ8bDZyi8k85HUFK3DxZLa-XG825J4qGJYAxom68AAzBhgNAACmNLBYAEoqMLN2K3TWvXumxlDxG5J9lqbIqJyah6E4hheCCmgZhYiB6Jos5WiwOoCm4yF6uuMKiq67o7j+DZ-lAchKMep7nnIV43vej4vm+Fawp+BGenWxEHkogG9pqVI-CanJPHm1gqEmxbKGaaH2GOeavIYa5lu+zH4d+7H7v+CgUWeN7Udet4Pk+DFKXh1aEWpJGKNx+TAXxJR9Ja7yyOUjhgRUkl2LyDiyRUCgKUMG7KaZbG-geAAqZAhjsIUZIxaCouimK4vihLYLAJLdmSPGUuIPyyHYvRKKmjjAiu04cpanTAtImgGFaAo4c6W5fmZ0WkeFkVrK1VBWRq2V3KJFpVEosgFY41WZjoch9A4NXQYujgNR+KktRx-7tbenWrS2TCeNkarWbxOVNHq-wcpBolvKJKjWpmLxcs4S6MjYjh5otgXbsFW1yOtUVbVpVE0fp9GvsZVYfbuX0-Zt6lQD10Ygc0Txke4TnzroXQqNOT5TSmjm6KJT4qG9JmTJ2JBrAAIsI1AntpF56XRhlGUxJNumTlPU3DNlHUok4PJ4YGvOa2gjs4Zq9Ja1o1Whk65nBxNg26FNoGQABut6wJ1YB4BA5jNlQADKZ5oEcZNc4dxSuLO7JLiOI65r8SissaDhTZO+gcgo+i-JoCtNXIytqxrWs63rMUomiGI4NieIEjgRJpebfWIHBdhobbhVgVUejOwLs6edVE5GD0Nh+GWOA8Bi8A5KDTU9gdycIJIAuchyDiQamS425jCFsnY1VofmvktLIRh+yxMzzPXvX9s3tRyG3eoaL59ogs76h2LojJ6CwItMlo4-LZ60-w7Z-zKEY3g7-OXeTqyuYqGRuMgvoPR5rUh9BbWbb+hAJ-c5bC0F84KIxvrUJ2vdIIKDkNaMCoI5IO0-uDIiMN-4W0QCLcCagtBIWZHBCBjR2jQKQmhawWYvbPFLP5XCitWIQxhoeNBjdvC6CmunJCk4XjlFZCQqafRqpdC9toS6SDmqfQYUoJh-Y+jyAFC0USjhII9Hgo0Xo0DGSj2UG8b2AxFIs1oapVqigpEgROvYbBNUdBe3wTwlMfD5wFmHLmYavs9EBVZnQlBFkoatRMbZZo6hzHCPzHLWovIzQdAXm4J8NVegOCTKIuQ7MqaUD8Udco1o5w6F5kuYsI5DBmkKjAwwyhxIplTokwO6s0CazoKHZsaTLYmjkNINQGhrqqFtKoZ2qg9BTVBCOEW85QSMjLj4IAA */
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
                  }, "playStart", "overheadLightsOn"],
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
