import { useEffect, useState } from "react";
import Article from "../components/GameComponents/Article";
import InputField from "../components/InputField";
import { useLoading } from "../store/LoadingContext";
import {
  mockStateStartGame,
  mockStateAfterWrongGuess1,
} from "../mocks/gameMocks";
import type { GameStateDto } from "../models/GameModels";
import AppButton from "../components/AppButton";

function Game() {
  const { isLoading, setIsLoading } = useLoading();
  const [gameState, setGameState] = useState<GameStateDto>();
  const [guess, setGuess] = useState<string>("");

  const submitGuess = async (e?: React.SubmitEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    // mock fetching data
    const timeout = setTimeout(() => {
      setGameState(mockStateAfterWrongGuess1);
      setGuess("");

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  };

  useEffect(() => {
    setIsLoading(true);
    // mock fetching data
    const timeout = setTimeout(() => {
      setGameState(mockStateStartGame);

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div>
      {!isLoading && gameState !== undefined && (
        <div className="flex flex-col justify-center items-center">
          <form onSubmit={submitGuess} className="flex flex-col items-center">
            <InputField
              placeholderText="Type in your guess..."
              userInput={guess}
              setUserInput={setGuess}
              width={1100}
              height={100}
            />
            <AppButton text="Submit guess" width={300} height={60} />
          </form>

          <Article gameState={gameState} />
        </div>
      )}
    </div>
  );
}
export default Game;
