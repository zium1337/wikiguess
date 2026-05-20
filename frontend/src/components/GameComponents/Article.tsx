import { type ReactNode } from "react";
import type { GameStateDto } from "../../models/GameModels";
import { CensorIcon } from "../../assets/CensorIcon";

interface ArticleProps {
  gameState: GameStateDto;
}

const NUM_GUESSES = 5;

function Article({ gameState }: ArticleProps) {
  const MARKED_AS_CENSORED = "_censoredWord_";
  const isGameOver = gameState.gameStatus !== "IN_PROGRESS";

  const renderSentence = (sentence: string): ReactNode => {
    if (isGameOver && gameState.articleTitle) {
      return sentence.replaceAll(MARKED_AS_CENSORED, gameState.articleTitle);
    }

    const parts = sentence.split(MARKED_AS_CENSORED);
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 && (
          <CensorIcon className="inline-block w-10 h-10 align-middle mx-1" />
        )}
      </span>
    ));
  };

  return (
    <div className="flex flex-col items-center mt-10">
      {gameState.gameStatus === "IN_PROGRESS" && (
        <div className="flex mb-20 text-8xl">
          <CensorIcon className="w-25 h-25 inline-block" />
          <span></span>
        </div>
      )}

      {gameState.gameStatus !== "IN_PROGRESS" && (
        <div className="mb-20 text-8xl">{gameState.articleTitle}</div>
      )}

      {gameState.gameStatus === "IN_PROGRESS" && (
        <div className="text-4xl mb-15">
          Revealed {gameState.revealedSentences.length} / {NUM_GUESSES}{" "}
          sentences
        </div>
      )}

      {gameState.gameStatus === "LOST" && (
        <div className="text-4xl mb-15 bg-rose-50 p-5 rounded-xl">
          Oh no! You lost...
        </div>
      )}

      {gameState.gameStatus === "WON" && (
        <div className="flex flex-col items-center text-4xl mb-15 gap-5 bg-lime-100 p-5 rounded-xl">
          <span>Congratulations, you WIN!!!</span>
          <span>
            It took you {NUM_GUESSES - 1 - gameState.guessesLeftNum} guesses to
            get it right :&#x29;
          </span>
        </div>
      )}

      <div className="max-w-6xl text-justify text-2xl/15">
        {gameState.revealedSentences.map((sentence) => (
          <div className="mb-10">{renderSentence(sentence.text)}</div>
        ))}
      </div>
    </div>
  );
}
export default Article;
