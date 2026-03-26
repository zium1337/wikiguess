import { useEffect, useState, type ReactNode } from "react";
import type { GameStateDto } from "../../models/GameModels";
import { mockStateAfterWrongGuess1 } from "../../mocks/gameMocks";
import { CensorIcon } from "../../assets/CensorIcon";
import { useLoading } from "../../store/LoadingContext";

function Article() {
  const MAREKD_AS_CENSORED = "_censoredWord_";
  const { isLoading, setIsLoading } = useLoading();
  const [gameState, setGameState] = useState<GameStateDto>();

  useEffect(() => {
    setIsLoading(true);
    // mock fetching data
    const timeout = setTimeout(() => {
      setGameState(mockStateAfterWrongGuess1);

      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const censorSentence = (sentence: string): ReactNode => {
    const wordsInSentence = sentence.split(" ");

    return wordsInSentence.map((word, index) => {
      const shouldBeCensored = word === MAREKD_AS_CENSORED;

      return (
        <span key={index}>
          {shouldBeCensored ? (
            <CensorIcon className="inline-block w-10 h-10 align-middle mx-1" />
          ) : (
            word
          )}
          {index < wordsInSentence.length - 1 && " "}
        </span>
      );
    });
  };

  return (
    <div>
      {!isLoading && (
        <div className="flex flex-col items-center">
          {gameState?.gameStatus === "IN_PROGRESS" && (
            <div className="flex mb-20 text-8xl">
              <CensorIcon className="w-25 h-25 inline-block" />
              <span>?</span>
            </div>
          )}

          {gameState?.gameStatus !== "IN_PROGRESS" && (
            <div className="mb-20 text-8xl">{gameState?.articleTitle}</div>
          )}

          {gameState?.gameStatus === "IN_PROGRESS" && (
            <div className="text-4xl mb-15">
              Revealed {gameState?.revealedSentences.length} /{" "}
              {gameState?.totalSentencesNum} sentences
            </div>
          )}

          {gameState?.gameStatus === "LOST" && (
            <div className="text-4xl mb-15 bg-rose-50 p-5 rounded-xl">
              Oh no! You lost...
            </div>
          )}

          {gameState?.gameStatus === "WON" && (
            <div className="flex flex-col items-center text-4xl mb-15 gap-5 bg-lime-100 p-5 rounded-xl">
              <span>Congratulations, you WIN!!!</span>
              <span>
                It took you{" "}
                {gameState?.totalSentencesNum - gameState?.guessesLeftNum}{" "}
                guesses to get it right :&#x29;
              </span>
            </div>
          )}

          <div className="max-w-6xl text-justify text-2xl/15">
            {gameState?.revealedSentences.map((sentence) => (
              <div className="mb-10">{censorSentence(sentence.text)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default Article;
