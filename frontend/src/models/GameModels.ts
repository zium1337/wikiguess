export interface SentenceDto {
  index: number;
  text: string;
}

export type GameStatus = "IN_PROGRESS" | "WON" | "LOST";

export interface GameStateDto {
  totalSentencesNum: number;
  guessesLeftNum: number;
  revealedSentences: SentenceDto[];
  gameStatus: GameStatus;
  articleTitle?: string;
  articleUrl?: string;
}

export interface GuessDto {
  guess: string;
}
