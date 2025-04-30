import { IDeck, ICard, CardDifficulty } from "./types";
import { Card } from "./card";

export class Deck implements IDeck {
  readonly id: string;
  name: string;
  description: string;
  createdAt: number;
  cardIds: string[];
  private cards: Map<string, Card>;

  constructor(
    name: string,
    description: string = "",
    id?: string,
    createdAt?: number,
    cardIds: string[] = [],
    cards: Card[] = []
  ) {
    this.id = id || this.generateId();
    this.name = name;
    this.description = description;
    this.createdAt = createdAt || Date.now();
    this.cardIds = [...cardIds];

    this.cards = new Map();
    cards.forEach((card) => {
      this.cards.set(card.id, card);
      if (!this.cardIds.includes(card.id)) {
        this.cardIds.push(card.id);
      }
    });

    this.checkRep();
  }

  addCard(card: Card): Card {
    if (this.cards.has(card.id)) {
      throw new Error(`Card with ID ${card.id} already exists in deck`);
    }

    this.cards.set(card.id, card);
    this.cardIds.push(card.id);

    this.checkRep();
    return card;
  }

  removeCard(cardId: string): boolean {
    if (!this.cards.has(cardId)) {
      return false;
    }

    this.cards.delete(cardId);
    this.cardIds = this.cardIds.filter((id) => id !== cardId);

    this.checkRep();
    return true;
  }

  getCard(cardId: string): Card | undefined {
    return this.cards.get(cardId);
  }

  getAllCards(): Card[] {
    return Array.from(this.cards.values());
  }

  getDueCards(now: number = Date.now()): Card[] {
    return this.getAllCards().filter((card) => card.dueDate <= now);
  }

  reviewCard(cardId: string, difficulty: CardDifficulty): Card | undefined {
    const card = this.getCard(cardId);
    if (!card) {
      return undefined;
    }

    card.review(difficulty);
    return card;
  }

  private generateId(): string {
    return "deck_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
  }

  static fromJSON(data: IDeck, cardData: ICard[]): Deck {
    const cards = cardData.filter((card) => data.cardIds.includes(card.id)).map((card) => Card.fromJSON(card));

    return new Deck(data.name, data.description, data.id, data.createdAt, data.cardIds, cards);
  }

  toJSON(): IDeck {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      cardIds: [...this.cardIds],
    };
  }

  serialize(): { deck: IDeck; cards: ICard[] } {
    return {
      deck: this.toJSON(),
      cards: this.getAllCards().map((card) => card.toJSON()),
    };
  }

  private checkRep(): void {
    if (!this.id || this.id.trim() === "") {
      throw new Error("Deck ID cannot be empty");
    }

    if (!this.name || this.name.trim() === "") {
      throw new Error("Deck name cannot be empty");
    }

    if (this.createdAt > Date.now()) {
      throw new Error("Deck creation date cannot be in the future");
    }

    if (this.cardIds.length !== this.cards.size) {
      throw new Error("Card IDs list and cards map size mismatch");
    }

    for (const cardId of this.cardIds) {
      if (!this.cards.has(cardId)) {
        throw new Error(`Card ID ${cardId} in cardIds but not in cards map`);
      }
    }

    const uniqueIds = new Set(this.cardIds);
    if (uniqueIds.size !== this.cardIds.length) {
      throw new Error("Duplicate card IDs detected");
    }
  }
}
