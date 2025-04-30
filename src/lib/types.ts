export interface ICard {
  id: string;
  front: string;
  back: string;
  createdAt: number;
  lastReviewedAt: number | null;
  reviewCount: number;
  difficulty: CardDifficulty;
  dueDate: number;
  source: string;
  bucket?: number;
}

export enum CardDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export interface IDeck {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  cardIds: string[];
}

export enum HandGesture {
  THUMBS_UP = "thumbs_up",
  FLAT_HAND = "flat_hand",
  THUMBS_DOWN = "thumbs_down",
  NO_HAND = "no_hand",
}

export const GestureToDifficulty: Record<HandGesture, CardDifficulty | null> = {
  [HandGesture.THUMBS_UP]: CardDifficulty.EASY,
  [HandGesture.FLAT_HAND]: CardDifficulty.MEDIUM,
  [HandGesture.THUMBS_DOWN]: CardDifficulty.HARD,
  [HandGesture.NO_HAND]: null,
};

export interface ExtensionMessage {
  type: "CREATE_CARD" | "REVIEW_CARD" | "GET_CARDS" | "DELETE_CARD";
  payload: any;
}
