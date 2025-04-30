/**
 * API Client for backend communication
 *
 * Handles communication with the server for cloud storage of cards and decks.
 * Falls back to local storage if server is unavailable.
 */
import { Card } from "../lib/card";
import { StorageManager } from "../lib/storageManager";
export class ApiClient {
    baseUrl;
    useLocalFallback;
    /**
     * Creates an API client
     *
     * @param baseUrl The base URL for the API server
     * @param useLocalFallback Whether to fall back to local storage if server is unreachable
     */
    constructor(baseUrl = "http://localhost:3000/api", useLocalFallback = true) {
        this.baseUrl = baseUrl;
        this.useLocalFallback = useLocalFallback;
    }
    /**
     * Sets the base URL for the API
     */
    setBaseUrl(url) {
        this.baseUrl = url;
    }
    /**
     * Saves a card to the server
     *
     * @param card The card to save
     * @param deckId ID of the deck to add the card to
     * @returns True if successful
     */
    async saveCard(card, deckId) {
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
        }
        catch (error) {
            console.error("API saveCard error:", error);
            // Fall back to local storage
            if (this.useLocalFallback) {
                await StorageManager.saveCard(card, deckId);
                return true;
            }
            return false;
        }
    }
    /**
     * Gets all cards for a deck from the server
     *
     * @param deckId ID of the deck
     * @returns Array of cards
     */
    async getCards(deckId) {
        try {
            const response = await fetch(`${this.baseUrl}/decks/${deckId}/cards`);
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            const data = await response.json();
            return data.cards.map((cardData) => Card.fromJSON(cardData));
        }
        catch (error) {
            console.error("API getCards error:", error);
            // Fall back to local storage
            if (this.useLocalFallback) {
                return await StorageManager.getCardsByDeck(deckId);
            }
            return [];
        }
    }
    /**
     * Gets due cards for a deck from the server
     *
     * @param deckId ID of the deck
     * @returns Array of due cards
     */
    async getDueCards(deckId) {
        try {
            const response = await fetch(`${this.baseUrl}/decks/${deckId}/due-cards`);
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            const data = await response.json();
            return data.cards.map((cardData) => Card.fromJSON(cardData));
        }
        catch (error) {
            console.error("API getDueCards error:", error);
            // Fall back to local storage
            if (this.useLocalFallback) {
                return await StorageManager.getDueCards(deckId);
            }
            return [];
        }
    }
    /**
     * Updates a card's review status on the server
     *
     * @param cardId ID of the card
     * @param difficulty The reported difficulty
     * @returns True if successful
     */
    async updateCardReview(cardId, difficulty) {
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
        }
        catch (error) {
            console.error("API updateCardReview error:", error);
            // Fall back to local storage
            if (this.useLocalFallback) {
                await StorageManager.updateCardReview(cardId, difficulty);
                return true;
            }
            return false;
        }
    }
    /**
     * Gets all decks from the server
     *
     * @returns Array of decks
     */
    async getAllDecks() {
        try {
            const response = await fetch(`${this.baseUrl}/decks`);
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            const data = await response.json();
            return data.decks;
        }
        catch (error) {
            console.error("API getAllDecks error:", error);
            // Fall back to local storage
            if (this.useLocalFallback) {
                return await StorageManager.getAllDecks();
            }
            return [];
        }
    }
    /**
     * Creates a new deck on the server
     *
     * @param deck The deck to create
     * @returns True if successful
     */
    async createDeck(deck) {
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
        }
        catch (error) {
            console.error("API createDeck error:", error);
            // Fall back to local storage
            if (this.useLocalFallback) {
                await StorageManager.saveDeck(deck);
                return true;
            }
            return false;
        }
    }
    /**
     * Checks if the server is reachable
     *
     * @returns True if the server is reachable
     */
    async isServerAvailable() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: "GET",
                // Short timeout
                signal: AbortSignal.timeout(2000),
            });
            return response.ok;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Synchronizes local data with the server
     * This helps ensure offline changes are pushed when reconnected
     *
     * @returns True if sync was successful
     */
    async syncWithServer() {
        // Check if server is available
        const isAvailable = await this.isServerAvailable();
        if (!isAvailable) {
            return false;
        }
        try {
            // Get local data
            const decks = await StorageManager.getAllDecks();
            let allCards = [];
            // Collect all cards for each deck
            for (const deck of decks) {
                const cards = await StorageManager.getCardsByDeck(deck.id);
                allCards = [...allCards, ...cards.map((card) => card.toJSON())];
            }
            // Send to server
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
        }
        catch (error) {
            console.error("Sync error:", error);
            return false;
        }
    }
}
// Export a default instance
export default new ApiClient();
