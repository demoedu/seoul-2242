
export enum GameState {
  START_SCREEN,
  IN_GAME,
  GAME_OVER,
  ERROR,
}

export interface Choice {
  id: number;
  text: string;
}

export interface Scene {
  description: string;
  choices: string[];
}
