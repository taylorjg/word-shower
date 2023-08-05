const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Initialising game
const game = document.getElementById(`game`);
const toggleButton = document.getElementById(`toggle-play`);
const input = document.getElementById(`game-input`);
const correctWords = document.getElementById(`correct-words`);
const score = document.getElementById(`points`);
const errorBox = document.getElementById(`error`);
const activeLetters = [];
let intervalId = false;
let cleanupTimeoutId = false;
let errorTimeoutId = false;
let speechRecognitionActive = false;

const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = "en-GB";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let foundWords = {};
const startingScore = Object.keys(foundWords)
  .reduce((runningScore, word) => runningScore + (word.length * foundWords[word]), 0) || 0

correctWords.innerHTML = Object.keys(foundWords)
  .reverse()
  .map(word => `<span>${word}</span>`)
  .join(``)
score.innerText = startingScore.toString()

if (typeof dictionary === `undefined`) {
  console.error(`Could not initialise dictionary`)
  errorBox.innerText = `Error! Could not load dictionary.`
  start.disabled = true
  stop.disabled = true
}

// constants
const alphabet = [`a`, `b`, `c`, `d`, `e`, `f`, `g`, `h`, `i`, `j`, `k`, `l`, `m`, `n`, `o`, `p`, `q`, `r`, `s`, `t`, `u`, `v`, `w`, `x`, `y`, `z`]
const weightedLetters = [`a`, `e`, `i`, `o`, `u`, `s`]
// TODO: might be nice to distribute letters like in Scrabble:
// 1 point: E ×12, A ×9, I ×9, O ×8, N ×6, R ×6, T ×6, L ×4, S ×4, U ×4
// 2 points: D ×4, G ×3
// 3 points: B ×2, C ×2, M ×2, P ×2
// 4 points: F ×2, H ×2, V ×2, W ×2, Y ×2
// 5 points: K ×1
// 8 points: J ×1, X ×1
// 10 points: Q ×1, Z ×1
const randomLetterList = [...alphabet, ...weightedLetters, ...weightedLetters]
const animationTime = 4000;

// Game Logic
const stopGame = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = false
    input.blur()
    recognition.stop();
    cleanupTimeoutId = setTimeout(() => {
      game.innerHTML = ``
      cleanupTimeoutId = false
    }, animationTime)
  }
  toggleButton.innerText = `Start`
}

const startGame = () => {
  if (cleanupTimeoutId) clearTimeout(cleanupTimeoutId)
  intervalId = setInterval(() => {
    const randomLetter = randomLetterList[Math.floor(Math.random() * randomLetterList.length)];
    const randomPosition = Math.floor(Math.random() * 270) / 10;
    game.insertAdjacentHTML(
      `afterbegin`,
      `<div class="falling-letter" style="left: ${randomPosition}rem">${randomLetter}</div>`
    )
    activeLetters.push(randomLetter)
    setTimeout(() => {
      activeLetters.shift()
    }, animationTime * 2)
  }, 400)
  toggleButton.innerText = `Pause`
  input.focus()
  recognition.start();
}

const toggleGame = () => {
  if (intervalId) stopGame()
  else startGame()
}

toggleButton.addEventListener(`click`, toggleGame)
document.addEventListener(`keydown`, (e) => {
  if (e.code === `Space`) {
    e.preventDefault()
    toggleGame()
  } else if (intervalId && e.code === `Escape`) {
    stopGame()
  }
})

const addWord = word => {
  const currentCount = foundWords[word] ?? 0;
  const newCount = currentCount + 1;
  foundWords = { ...foundWords, [word]: newCount };
  if (newCount > 1) {
    correctWords.insertAdjacentHTML(`afterbegin`, `<span>${word} (${newCount})</span>`);
  } else {
    correctWords.insertAdjacentHTML(`afterbegin`, `<span>${word}</span>`);
  }

  // TODO: might be nice to score letters like in Scrabble:
  // 1 point - A, E, I, O, U, L, N, S, T, R.
  // 2 points - D, G.
  // 3 points - B, C, M, P.
  // 4 points - F, H, V, W, Y.
  // 5 points - K.
  // 8 points - J, X.
  // 10 points - Q, Z.
  score.innerText = `${parseInt(score.innerText) + word.length}`
};

input.addEventListener(`keydown`, (e) => {
  if (e.key === `Enter`) {
    const attempt = input.value.trim().toLowerCase()
    if (attempt.length > 3 && dictionary.includes(attempt.toUpperCase())) {
      addWord(attempt);
      input.value = ``
    } else {
      // else do nothing
      e.preventDefault()
      console.log(attempt)
      if (attempt) {
        if (errorTimeoutId) clearTimeout(errorTimeoutId)
        if (attempt.length > 3) {
          errorBox.innerText = `${attempt} isn't in our dictionary`
        } else {
          errorBox.innerText = `must be at least 4 letters long`
        }
        errorTimeoutId = setTimeout(() => {
          errorBox.innerText = ``
          errorTimeoutId = false;
        }, 1500)
      }
    }
  } else if (e.code === `Space` || (e.metaKey === false && alphabet.includes(e.key) && !activeLetters.includes(e.key))) {
    e.preventDefault()
  }
})

recognition.onresult = function (event) {
  const result = event.results[event.resultIndex][0];
  console.log("result.transcript:", result.transcript);
  const words = result.transcript.trim().split(/\s/);
  if (words.length > 0) {
    const attempt = words[0].trim().toLowerCase();
    if (attempt.length > 3 && dictionary.includes(attempt.toUpperCase())) {
      const attemptChars = Array.from(attempt);
      // TODO: need fix re repeated letters
      // e.g. "kiss" will succeed even if there is only a single "s" in activeLetters
      // we should really check that there are 2 x "s" in activeLetters
      if (attemptChars.every(char => activeLetters.includes(char))) {
        addWord(attempt);
      }
    }
  }
}

recognition.onerror = (event) => {
  const formattedError = `error: ${event.error}; message: ${event.message}`;
  console.log("[onerror]", formattedError);
}

recognition.onnomatch = () => {
  console.log("[onnomatch]");
}

recognition.onstart = () => {
  console.log("[onstart]");
}

recognition.onend = () => {
  console.log("[onend]");
  if (intervalId) {
    recognition.start();
  }
}
