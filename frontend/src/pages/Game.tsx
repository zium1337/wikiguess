import { useEffect, useState } from "react";
import Article from "../components/GameComponents/Article";
import InputField from "../components/InputField";
import { useLoading } from "../store/LoadingContext";
import type { GameStateDto } from "../models/GameModels";
import AppButton from "../components/AppButton";
import { getGameState, postGuess } from "../service/GameService";

function Game() {
  const { isLoading, setIsLoading } = useLoading();
  const [gameState, setGameState] = useState<GameStateDto>();
  const [guess, setGuess] = useState<string>("");

  const submitGuess = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newState = await postGuess({ guess });
      setGameState(newState);
      setGuess("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getGameState()
      .then(setGameState)
      .finally(() => setIsLoading(false));
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
