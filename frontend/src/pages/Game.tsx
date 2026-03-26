import { useEffect, useState } from "react";
import Article from "../components/GameComponents/Article";
import InputField from "../components/InputField";
import { useLoading } from "../store/LoadingContext";
import { mockStateAfterWrongGuess1 } from "../mocks/gameMocks";
import type { GameStateDto } from "../models/GameModels";

function Game() {
  const { isLoading, setIsLoading } = useLoading();
  const [gameState, setGameState] = useState<GameStateDto>();
  const [guess, setGuess] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);
    // mock fetching data
    const timeout = setTimeout(() => {
      setGameState(mockStateAfterWrongGuess1);

      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div>
      {!isLoading && gameState !== undefined && (
        <div className="flex flex-col justify-center items-center">
          <InputField
            placeholderText="Type in your guess..."
            userInput={guess}
            setUserInput={setGuess}
            width={1100}
            height={100}
          />
          <Article gameState={gameState} />
        </div>
      )}
    </div>
  );
}
export default Game;
