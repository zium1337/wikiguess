import { useState } from "react";
import Article from "../components/GameComponents/Article";
import InputField from "../components/InputField";

function Game() {
  const [guess, setGuess] = useState<string>("");
  return (
    <div className="flex flex-col justify-center items-center">
      <InputField
        placeholderText="Type in your guess..."
        userInput={guess}
        setUserInput={setGuess}
        width={1100}
        height={100}
      />
      <Article />
    </div>
  );
}
export default Game;
