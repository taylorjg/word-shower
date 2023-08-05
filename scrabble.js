const lettersToCounts = new Map([
  ["a", 9],
  ["b", 2],
  ["c", 2],
  ["d", 4],
  ["e", 12],
  ["f", 2],
  ["g", 3],
  ["h", 2],
  ["i", 9],
  ["j", 1],
  ["k", 1],
  ["l", 4],
  ["m", 2],
  ["n", 6],
  ["o", 8],
  ["p", 2],
  ["q", 1],
  ["r", 6],
  ["s", 4],
  ["t", 6],
  ["u", 4],
  ["v", 2],
  ["w", 2],
  ["x", 1],
  ["y", 2],
  ["z", 1],
]);

const valuesToLetters = new Map([
  [1, "aeioulnstr"],
  [2, "dg"],
  [3, "bcmp"],
  [4, "fhvwy"],
  [5, "k"],
  [8, "jx"],
  [10, "qz"],
]);

const lettersToValues = new Map(
  Array.from(valuesToLetters.entries())
    .flatMap(([count, lettersString]) =>
      Array.from(lettersString).map((letter) => [letter, count])
    )
);

const getFullSetOfScrabbleLetters = () => {
  return Array.from(lettersToCounts.entries())
    .flatMap(([letter, count]) => Array(count).fill(letter));
};

const getScrabbleScore = (word) => {
  return Array.from(word)
    .reduce(
      (acc, letter) => acc + lettersToValues.get(letter) ?? 0,
      0
    );
};
