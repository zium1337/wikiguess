import { useEffect, useState, type ReactNode } from "react";
import type { GameStateDto } from "../../models/GameModels";
import { mockStateAfterWrongGuess2 } from "../../mocks/gameMocks";
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
      setGameState(mockStateAfterWrongGuess2);

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
          <div className="text-4xl mb-15">
            Revealed {gameState?.revealedSentences.length} /{" "}
            {gameState?.totalSentencesNum} sentences
          </div>

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
