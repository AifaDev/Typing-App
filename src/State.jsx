import create from "zustand";
import axios from "axios";

const Space = [{ key: "\u00A0", state: "paragraph" }];
const Finish = [{ key: "\u00A0", code: "Finish", state: "paragraph" }];

const generatePragraph = async () => {
  const res = await axios.get(
    "http://api.quotable.io/random?minLength=200&maxLength=250"
  );
  return res.data.content;
};

const generateKeys = (paragraph) => {
  let p = paragraph.replaceAll(" — "," ")
  const keys = [];
  let currentKey = [];
  for (const c of p) {
    if (c === " ") {
      keys.push(currentKey);
      currentKey = [];
      keys.push(Space);
    } else {
      currentKey.push({ key: c, state: "paragraph" });
    }
  }
  keys.push(currentKey);
  keys.push(Finish);
  return keys;
};


export const useKeys = create((set) => {
  let letters = [];

  (async () => {
    const p = await generatePragraph();
    letters = generateKeys(p);
    set((state) => {
      state.letters = letters;
    });
  })();
  return ({
  keys: {},
  paragraph: letters,
  letters: letters,
  firstLetter: 0,
  lastLetter: 0,
  lettersCount: 0,
  typos: 0,
  speed: "N/A",
  accuracy: "N/A",
  streak: 0,
  best: 0,
  progressPercentage: 0,
  goal: 1500,
  progress: 0,
  size: [window.innerWidth, window.innerHeight],
  focused: false,

  generateKeys: (paragraph) =>
    set((state) => {
      state.letters = generateKeys(paragraph);
    }),

  addKey: (key) =>
    set((state) => {
      state.keys[key] = key;
    }),
  removeKey: (key) =>
    set((state) => {
      delete state.keys[key];
    }),

  setFocus: (bool) =>
    set((state) => {
      state.focused = bool;
    }),
  setLetter: (pos) =>
    set((state) => {
      state.letter = pos;
    }),
  updateSize: () =>
    set((state) => {
      state.focused = false;
      state.size = [window.innerWidth, window.innerHeight];
    }),
  setLetters: (l) =>
    set((state) => {
      state.letters = l;
    }),
  updateBrief: () =>
    set((state) => {
      const speed = localStorage.getItem("speed");
      const accuracy = localStorage.getItem("accuracy");
      const streak = localStorage.getItem("streak");
      const best = localStorage.getItem("best");
      const goal = localStorage.getItem("goal");
      const progress = localStorage.getItem("progress");

      if (speed) state.speed = speed + "wpm";
      if (accuracy) state.accuracy = accuracy + "%";
      if (streak) state.streak = streak;
      if (best) state.best = best;
      if (goal) state.goal = 1500;
      if (progress) state.progress = progress;
      state.progressPercentage = state.progress / state.goal;
    }),

  startSession: () =>
    set((state) => {
      state.firstLetter = 0;
      state.lastLetter = 0;
      state.lettersCount = 0;
      state.typos = 0;
      state.letters = structuredClone(letters);
    }),
  startCounter: () =>
    set((state) => {
      state.firstLetter = Date.now();
    }),
  countLetter: () =>
    set((state) => {
      state.lettersCount = state.lettersCount + 1;
    }),
  countTypo: () =>
    set((state) => {
      state.typos = state.typos + 1;
    }),
  endSession: () =>
    set((state) => {
      state.lastLetter = Date.now();
      const minutes = (state.lastLetter - state.firstLetter) / 60000;
      const words = state.lettersCount / 5;
      const speed = ~~(words / minutes);
      state.speed = speed + "wpm";
      localStorage.setItem("speed", speed);
      const accuracy = ~~(
        ((state.lettersCount - state.typos) * 100) /
        state.lettersCount
      );
      state.accuracy = accuracy + "%";
      localStorage.setItem("accuracy", accuracy);
      const progress = ~~localStorage.getItem("progress") + ~~words;
      state.progress = progress;
      const goal = localStorage.getItem("goal");
      if (!goal) {
        localStorage.setItem("goal", state.goal);
      }
      localStorage.setItem("progress", state.progress);
      state.progressPercentage = state.progress / state.goal;

      if (accuracy === 100) {
        state.streak += 1;
        localStorage.setItem("streak", state.streak);
      } else {
        state.streak = 0;
        localStorage.setItem("streak", state.streak);
      }
      const best = localStorage.getItem("best");
      if (state.streak > best || !best) {
        localStorage.setItem("best", state.streak);
        state.best = state.streak;
      }
      (async () => {
        const p = await generatePragraph();
        letters = generateKeys(p);
        set((state) => {
          state.letters = letters;
        });
      })();
    }),
})})
