import { api } from "./AppService";
import type { GameStateDto, GuessDto } from "../models/GameModels";

export const getGameState = async (): Promise<GameStateDto> => {
  const response = await api.get<GameStateDto>("/game/state");
  return response.data;
};

export const postGuess = async (body: GuessDto): Promise<GameStateDto> => {
  const response = await api.post<GameStateDto>("/game/guess", body);
  return response.data;
};
