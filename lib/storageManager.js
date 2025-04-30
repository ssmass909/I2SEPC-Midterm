/**
 * Storage Manager
 *
 * Handles persistence of cards and decks using Chrome's storage API.
 */
import { Card } from "./card";
import { Deck } from "./deck";
export class StorageManager {
    static DECKS_KEY = "flashcards_decks";
    static CARDS_KEY = "flashcards_cards";
    static DEFAULT_DECK_ID = "default_deck";
    /**
     * Initializes storage with a default deck if none exists
     */
    static async initialize() {
        const { decks } = await this.getState();
        if (decks.length === 0) {
            // Create default deck
            const defaultDeck = new Deck("Default Deck", "Your default collection of flashcards", this.DEFAULT_DECK_ID);
            await this.saveDeck(defaultDeck);
        }
    }
    /**
     * Saves a card to storage
     *
     * @param card The card to save
     * @param deckId ID of the deck to add the card to (uses default if not specified)
     */
    static async saveCard(card, deckId = this.DEFAULT_DECK_ID) {
        const { cards, decks } = await this.getState();
        // Find the deck
        const deckIndex = decks.findIndex((d) => d.id === deckId);
        if (deckIndex === -1) {
            throw new Error(`Deck with ID ${deckId} not found`);
        }
        // Add/update card
        const existingCardIndex = cards.findIndex((c) => c.id === card.id);
        if (existingCardIndex !== -1) {
            cards[existingCardIndex] = card.toJSON();
        }
        else {
            cards.push(card.toJSON());
            decks[deckIndex].cardIds.push(card.id);
        }
        // Save state
        await this.setState({ cards, decks });
    }
    /**
     * Deletes a card from storage
     *
     * @param cardId ID of the card to delete
     */
    static async deleteCard(cardId) {
        const { cards, decks } = await this.getState();
        // Remove card from cards array
        const cardIndex = cards.findIndex((c) => c.id === cardId);
        if (cardIndex === -1) {
            return; // Card not found, nothing to delete
        }
        cards.splice(cardIndex, 1);
        // Remove card ID from all decks
        for (const deck of decks) {
            deck.cardIds = deck.cardIds.filter((id) => id !== cardId);
        }
        // Save state
        await this.setState({ cards, decks });
    }
    /**
     * Saves a deck to storage
     *
     * @param deck The deck to save
     */
    static async saveDeck(deck) {
        const { decks, cards } = await this.getState();
        // Add or update the deck
        const deckIndex = decks.findIndex((d) => d.id === deck.id);
        if (deckIndex !== -1) {
            decks[deckIndex] = deck.toJSON();
        }
        else {
            decks.push(deck.toJSON());
        }
        // Save associated cards
        const deckCards = deck.getAllCards();
        for (const card of deckCards) {
            const cardIndex = cards.findIndex((c) => c.id === card.id);
            if (cardIndex !== -1) {
                cards[cardIndex] = card.toJSON();
            }
            else {
                cards.push(card.toJSON());
            }
        }
        // Save state
        await this.setState({ cards, decks });
    }
    /**
     * Deletes a deck from storage
     *
     * @param deckId ID of the deck to delete
     * @param deleteCards Whether to also delete the cards in the deck
     */
    static async deleteDeck(deckId, deleteCards = false) {
        if (deckId === this.DEFAULT_DECK_ID) {
            throw new Error("Cannot delete the default deck");
        }
        const { decks, cards } = await this.getState();
        // Find deck
        const deckIndex = decks.findIndex((d) => d.id === deckId);
        if (deckIndex === -1) {
            return; // Deck not found, nothing to delete
        }
        // Get card IDs in this deck
        const cardIds = decks[deckIndex].cardIds;
        // Delete cards if requested
        if (deleteCards) {
            for (let i = cards.length - 1; i >= 0; i--) {
                if (cardIds.includes(cards[i].id)) {
                    cards.splice(i, 1);
                }
            }
        }
        // Remove deck
        decks.splice(deckIndex, 1);
        // Save state
        await this.setState({ cards, decks });
    }
    /**
     * Gets all cards in a specific deck
     *
     * @param deckId ID of the deck
     * @returns Array of cards in the deck
     */
    static async getCardsByDeck(deckId) {
        const { cards, decks } = await this.getState();
        // Find deck
        const deck = decks.find((d) => d.id === deckId);
        if (!deck) {
            throw new Error(`Deck with ID ${deckId} not found`);
        }
        // Get cards for this deck
        const deckCards = cards.filter((card) => deck.cardIds.includes(card.id)).map((cardData) => Card.fromJSON(cardData));
        return deckCards;
    }
    /**
     * Gets all due cards in a specific deck
     *
     * @param deckId ID of the deck
     * @returns Array of due cards
     */
    static async getDueCards(deckId) {
        const cards = await this.getCardsByDeck(deckId);
        const now = Date.now();
        return cards.filter((card) => card.dueDate <= now);
    }
    /**
     * Gets a specific deck with its cards
     *
     * @param deckId ID of the deck to retrieve
     * @returns The deck or null if not found
     */
    static async getDeck(deckId) {
        const { decks, cards } = await this.getState();
        const deckData = decks.find((d) => d.id === deckId);
        if (!deckData) {
            return null;
        }
        return Deck.fromJSON(deckData, cards);
    }
    /**
     * Gets all decks
     *
     * @returns Array of all decks (without their cards)
     */
    static async getAllDecks() {
        const { decks } = await this.getState();
        return decks;
    }
    /**
     * Updates a card's review state
     *
     * @param cardId ID of the card to update
     * @param difficulty The difficulty level reported by the user
     */
    static async updateCardReview(cardId, difficulty) {
        const { cards, decks } = await this.getState();
        // Find the card
        const cardIndex = cards.findIndex((c) => c.id === cardId);
        if (cardIndex === -1) {
            throw new Error(`Card with ID ${cardId} not found`);
        }
        // Create a Card instance, update it, and save back
        const card = Card.fromJSON(cards[cardIndex]);
        card.review(difficulty);
        cards[cardIndex] = card.toJSON();
        // Save state
        await this.setState({ cards, decks });
    }
    /**
     * Retrieves the current state from storage
     */
    static async getState() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.CARDS_KEY, this.DECKS_KEY], (result) => {
                resolve({
                    cards: result[this.CARDS_KEY] || [],
                    decks: result[this.DECKS_KEY] || [],
                });
            });
        });
    }
    /**
     * Saves the state to storage
     */
    static async setState(state) {
        return new Promise((resolve) => {
            chrome.storage.local.set({
                [this.CARDS_KEY]: state.cards,
                [this.DECKS_KEY]: state.decks,
            }, resolve);
        });
    }
    /**
     * Clears all data from storage (for testing/debugging)
     */
    static async clearAll() {
        return new Promise((resolve) => {
            chrome.storage.local.clear(resolve);
        });
    }
}
describe("StorageManager Module", () => {
    it("should initialize with a default deck", async () => {
        await StorageManager.clearAll();
        await StorageManager.initialize();
        const decks = await StorageManager.getAllDecks();
        expect(decks.length).toBe(1);
        expect(decks[0].id).toBe(StorageManager.DEFAULT_DECK_ID);
    });
    it("should save and retrieve a card correctly", async () => {
        await StorageManager.clearAll();
        const card = new Card("Front", "Back", "http://example.com");
        await StorageManager.saveCard(card);
        const deckCards = await StorageManager.getCardsByDeck(StorageManager.DEFAULT_DECK_ID);
        expect(deckCards.length).toBe(1);
        expect(deckCards[0].front).toBe("Front");
    });
    it("should delete a card correctly", async () => {
        await StorageManager.clearAll();
        const card = new Card("Front", "Back", "http://example.com");
        await StorageManager.saveCard(card);
        await StorageManager.deleteCard(card.id);
        const deckCards = await StorageManager.getCardsByDeck(StorageManager.DEFAULT_DECK_ID);
        expect(deckCards.length).toBe(0);
    });
    it("should save and retrieve a deck correctly", async () => {
        await StorageManager.clearAll();
        const deck = new Deck("Test Deck");
        await StorageManager.saveDeck(deck);
        const retrievedDeck = await StorageManager.getDeck(deck.id);
        expect(retrievedDeck?.name).toBe("Test Deck");
    });
});
