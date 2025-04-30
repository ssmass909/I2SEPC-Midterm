import { Card } from "../lib/card";
import { Deck } from "../lib/deck";
import { CardDifficulty, ICard, IDeck } from "../lib/types";
import { StorageManager } from "../lib/storageManager";

export class ApiClient {
  private baseUrl: string;
  private useLocalFallback: boolean;

  constructor(baseUrl: string = "http://localhost:3000/api", useLocalFallback: boolean = true) {
    this.baseUrl = baseUrl;
    this.useLocalFallback = useLocalFallback;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  async saveCard(card: Card, deckId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card: card.toJSON(),
          deckId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return true;
    } catch (error) {
      if (this.useLocalFallback) {
        await StorageManager.saveCard(card, deckId);
        return true;
      }

      return false;
    }
  }

  async getCards(deckId: string): Promise<Card[]> {
    try {
      const response = await fetch(`${this.baseUrl}/decks/${deckId}/cards`);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return data.cards.map((cardData: ICard) => Card.fromJSON(cardData));
    } catch (error) {
      if (this.useLocalFallback) {
        return await StorageManager.getCardsByDeck(deckId);
      }

      return [];
    }
  }

  async getDueCards(deckId: string): Promise<Card[]> {
    try {
      const response = await fetch(`${this.baseUrl}/decks/${deckId}/due-cards`);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return data.cards.map((cardData: ICard) => Card.fromJSON(cardData));
    } catch (error) {
      if (this.useLocalFallback) {
        return await StorageManager.getDueCards(deckId);
      }

      return [];
    }
  }

  async updateCardReview(cardId: string, difficulty: CardDifficulty): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/cards/${cardId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ difficulty }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return true;
    } catch (error) {
      if (this.useLocalFallback) {
        await StorageManager.updateCardReview(cardId, difficulty);
        return true;
      }

      return false;
    }
  }

  async getAllDecks(): Promise<IDeck[]> {
    try {
      const response = await fetch(`${this.baseUrl}/decks`);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return data.decks;
    } catch (error) {
      if (this.useLocalFallback) {
        return await StorageManager.getAllDecks();
      }

      return [];
    }
  }

  async createDeck(deck: Deck): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/decks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deck.toJSON()),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return true;
    } catch (error) {
      if (this.useLocalFallback) {
        await StorageManager.saveDeck(deck);
        return true;
      }

      return false;
    }
  }

  async isServerAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async syncWithServer(): Promise<boolean> {
    const isAvailable = await this.isServerAvailable();
    if (!isAvailable) {
      return false;
    }

    try {
      const decks = await StorageManager.getAllDecks();
      let allCards: ICard[] = [];

      for (const deck of decks) {
        const cards = await StorageManager.getCardsByDeck(deck.id);
        allCards = [...allCards, ...cards.map((card) => card.toJSON())];
      }

      const response = await fetch(`${this.baseUrl}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decks,
          cards: allCards,
        }),
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new ApiClient();
