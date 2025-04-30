import { Card } from "./card";
import { Deck } from "./deck";
import { ICard, IDeck } from "./types";
import { STORAGE_KEYS } from "../lib/constants";

export class StorageManager {
  static readonly DEFAULT_DECK_ID = "default_deck";

  static async initialize(): Promise<void> {
    const { decks } = await this.getState();

    if (decks.length === 0) {
      const defaultDeck = new Deck("Default Deck", "Your default collection of flashcards", this.DEFAULT_DECK_ID);
      await this.saveDeck(defaultDeck);
    }
  }

  static async saveCard(card: Card, deckId: string = this.DEFAULT_DECK_ID): Promise<void> {
    const { cards, decks } = await this.getState();
    const deckIndex = this.findDeckIndex(decks, deckId);

    if (deckIndex === -1) {
      throw new Error(`Deck with ID ${deckId} not found`);
    }

    this.updateOrAddCard(cards, card);
    decks[deckIndex].cardIds.push(card.id);
    await this.setState({ cards, decks });
  }

  static async deleteCard(cardId: string): Promise<void> {
    const { cards, decks } = await this.getState();
    this.removeCard(cards, cardId);
    decks.forEach((deck) => {
      deck.cardIds = deck.cardIds.filter((id) => id !== cardId);
    });
    await this.setState({ cards, decks });
  }

  static async saveDeck(deck: Deck): Promise<void> {
    const { decks, cards } = await this.getState();
    this.updateOrAddDeck(decks, deck);
    deck.getAllCards().forEach((card) => this.updateOrAddCard(cards, card));
    await this.setState({ cards, decks });
  }

  static async deleteDeck(deckId: string, deleteCards: boolean = false): Promise<void> {
    if (deckId === this.DEFAULT_DECK_ID) {
      throw new Error("Cannot delete the default deck");
    }

    const { decks, cards } = await this.getState();
    const deckIndex = this.findDeckIndex(decks, deckId);

    if (deckIndex === -1) {
      return;
    }

    if (deleteCards) {
      this.removeCardsByIds(cards, decks[deckIndex].cardIds);
    }

    decks.splice(deckIndex, 1);
    await this.setState({ cards, decks });
  }

  static async getCardsByDeck(deckId: string): Promise<Card[]> {
    const { cards, decks } = await this.getState();

    const deck = decks.find((d) => d.id === deckId);
    if (!deck) {
      throw new Error(`Deck with ID ${deckId} not found`);
    }

    return cards.filter((card) => deck.cardIds.includes(card.id)).map((cardData) => Card.fromJSON(cardData));
  }

  static async getDueCards(deckId: string): Promise<Card[]> {
    const cards = await this.getCardsByDeck(deckId);
    const now = Date.now();
    return cards.filter((card) => card.dueDate <= now);
  }

  static async updateCardReview(cardId: string, difficulty: string): Promise<void> {
    const { cards, decks } = await this.getState();

    const cardIndex = cards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error(`Card with ID ${cardId} not found`);
    }

    const card = Card.fromJSON(cards[cardIndex]);
    card.review(difficulty as any);
    cards[cardIndex] = card.toJSON();

    await this.setState({ cards, decks });
  }

  static async getAllDecks(): Promise<IDeck[]> {
    const { decks } = await this.getState();
    return decks;
  }

  static async getAllCards(): Promise<Card[]> {
    const { cards } = await this.getState();
    return cards.map((cardData) => Card.fromJSON(cardData));
  }

  static async getCardById(cardId: string): Promise<Card | null> {
    const { cards } = await this.getState();
    const cardData = cards.find((c) => c.id === cardId);
    return cardData ? Card.fromJSON(cardData) : null;
  }

  private static findDeckIndex(decks: IDeck[], deckId: string): number {
    return decks.findIndex((d) => d.id === deckId);
  }

  private static updateOrAddCard(cards: ICard[], card: Card): void {
    const index = cards.findIndex((c) => c.id === card.id);
    if (index !== -1) {
      cards[index] = card.toJSON();
    } else {
      cards.push(card.toJSON());
    }
  }

  private static updateOrAddDeck(decks: IDeck[], deck: Deck): void {
    const index = decks.findIndex((d) => d.id === deck.id);
    if (index !== -1) {
      decks[index] = deck.toJSON();
    } else {
      decks.push(deck.toJSON());
    }
  }

  private static removeCardsByIds(cards: ICard[], cardIds: string[]): void {
    for (let i = cards.length - 1; i >= 0; i--) {
      if (cardIds.includes(cards[i].id)) {
        cards.splice(i, 1);
      }
    }
  }

  private static removeCard(cards: ICard[], cardId: string): void {
    const index = cards.findIndex((c) => c.id === cardId);
    if (index !== -1) {
      cards.splice(index, 1);
    }
  }

  private static async getState(): Promise<{ cards: ICard[]; decks: IDeck[] }> {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.CARDS_KEY, STORAGE_KEYS.DECKS_KEY], (result) => {
        resolve({
          cards: result[STORAGE_KEYS.CARDS_KEY] || [],
          decks: result[STORAGE_KEYS.DECKS_KEY] || [],
        });
      });
    });
  }

  private static async setState(state: { cards: ICard[]; decks: IDeck[] }): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(
        {
          [STORAGE_KEYS.CARDS_KEY]: state.cards,
          [STORAGE_KEYS.DECKS_KEY]: state.decks,
        },
        resolve
      );
    });
  }
}
