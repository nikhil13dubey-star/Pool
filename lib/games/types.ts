export interface EmojiCard {
  id: string;
  answer: string;
  emoji: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface TabooCard {
  id: string;
  target: string;
  banned: string[];
}

export interface TabooDeck {
  key: string;
  name: string;
  cards: TabooCard[];
}

export type GameId = "emoji" | "taboo";

export interface Team {
  name: string;
  score: number;
}

export interface GameSettings {
  timer: number; // seconds per round
  mode: "rounds" | "target";
  rounds: number; // per team (rounds mode)
  target: number; // target mode
  skips: number; // skips allowed per round
  penalty: boolean; // taboo: -1 on buzz
  honour: boolean; // taboo: no enforcer
}

export const DEFAULT_SETTINGS: GameSettings = {
  timer: 60,
  mode: "rounds",
  rounds: 4,
  target: 20,
  skips: 3,
  penalty: false,
  honour: false,
};
