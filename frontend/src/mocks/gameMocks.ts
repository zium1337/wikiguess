import type { GameStateDto } from "../models/GameModels";

export const mockStateStartGame: GameStateDto = {
  totalSentencesNum: 4,
  guessesLeftNum: 4,
  revealedSentences: [
    {
      index: 0,
      text: "_censoredWord_ is a 2001 American animated fantasy comedy film directed by Andrew Adamson and Vicky Jenson.",
    },
  ],
  gameStatus: "IN_PROGRESS",
};

export const mockStateAfterWrongGuess1: GameStateDto = {
  totalSentencesNum: 4,
  guessesLeftNum: 3,
  revealedSentences: [
    {
      index: 0,
      text: "_censoredWord_ is a 2001 American animated fantasy comedy film directed by Andrew Adamson and Vicky Jenson.",
    },
    {
      index: 1,
      text: "It is the first in the _censoredWord_ film series, and stars Mike Myers, Eddie Murphy, Cameron Diaz and John Lithgow.",
    },
  ],
  gameStatus: "IN_PROGRESS",
};

export const mockStateAfterWrongGuess2: GameStateDto = {
  totalSentencesNum: 4,
  guessesLeftNum: 2,
  revealedSentences: [
    {
      index: 0,
      text: "_censoredWord_ is a 2001 American animated fantasy comedy film directed by Andrew Adamson and Vicky Jenson.",
    },
    {
      index: 1,
      text: "It is the first in the _censoredWord_ film series, and stars Mike Myers, Eddie Murphy, Cameron Diaz and John Lithgow.",
    },
    {
      index: 2,
      text: "In the film, an embittered ogre named _censoredWord_ finds his home in the swamp overrun by fairy tale creatures.",
    },
  ],
  gameStatus: "IN_PROGRESS",
};

export const mocStateWinGame: GameStateDto = {
  totalSentencesNum: 4,
  guessesLeftNum: 1,
  revealedSentences: [
    {
      index: 0,
      text: "Shrek is a 2001 American animated fantasy comedy film directed by Andrew Adamson and Vicky Jenson.",
    },
    {
      index: 1,
      text: "It is the first in the Shrek film series, and stars Mike Myers, Eddie Murphy, Cameron Diaz and John Lithgow.",
    },
    {
      index: 2,
      text: "In the film, an embittered ogre named Shrek finds his home in the swamp overrun by fairy tale creatures.",
    },
    {
      index: 3,
      text: "With the help of Donkey, Shrek makes a pact with Lord Farquaad to rescue Princess Fiona.",
    },
  ],
  gameStatus: "WON",
  articleTitle: "Shrek",
  articleUrl: "https://en.wikipedia.org/wiki/Shrek",
};

export const mockStateLostGame: GameStateDto = {
  totalSentencesNum: 4,
  guessesLeftNum: 0,
  revealedSentences: [
    {
      index: 0,
      text: "Shrek is a 2001 American animated fantasy comedy film directed by Andrew Adamson and Vicky Jenson.",
    },
    {
      index: 1,
      text: "It is the first in the Shrek film series, and stars Mike Myers, Eddie Murphy, Cameron Diaz and John Lithgow.",
    },
    {
      index: 2,
      text: "In the film, an embittered ogre named Shrek finds his home in the swamp overrun by fairy tale creatures.",
    },
    {
      index: 3,
      text: "With the help of Donkey, Shrek makes a pact with Lord Farquaad to rescue Princess Fiona.",
    },
  ],
  gameStatus: "LOST",
  articleTitle: "Shrek",
  articleUrl: "https://en.wikipedia.org/wiki/Shrek",
};
