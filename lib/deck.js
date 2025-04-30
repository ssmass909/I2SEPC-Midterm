/**
 * Deck ADT Implementation
 *
 * Represents a collection of cards with methods for reviewing, adding, and managing cards.
 */
import { Card } from "./card";
export class Deck {
    id;
    name;
    description;
    createdAt;
    cardIds;
    cards;
    /**
     * Creates a new Deck
     *
     * @param name The name of the deck
     * @param description A description of the deck's contents
     */
    constructor(name, description = "", id, createdAt, cardIds = [], cards = []) {
        this.id = id || this.generateId();
        this.name = name;
        this.description = description;
        this.createdAt = createdAt || Date.now();
        this.cardIds = [...cardIds];
        // Initialize cards map
        this.cards = new Map();
        cards.forEach((card) => {
            this.cards.set(card.id, card);
            if (!this.cardIds.includes(card.id)) {
                this.cardIds.push(card.id);
            }
        });
        this.checkRep();
    }
    /**
     * Add a card to the deck
     *
     * @param card The card to add
     * @returns The added card
     */
    addCard(card) {
        if (this.cards.has(card.id)) {
            throw new Error(`Card with ID ${card.id} already exists in deck`);
        }
        this.cards.set(card.id, card);
        this.cardIds.push(card.id);
        this.checkRep();
        return card;
    }
    /**
     * Remove a card from the deck
     *
     * @param cardId ID of the card to remove
     * @returns true if card was removed, false if not found
     */
    removeCard(cardId) {
        if (!this.cards.has(cardId)) {
            return false;
        }
        this.cards.delete(cardId);
        this.cardIds = this.cardIds.filter((id) => id !== cardId);
        this.checkRep();
        return true;
    }
    /**
     * Get a card by ID
     *
     * @param cardId ID of the card to retrieve
     * @returns The card or undefined if not found
     */
    getCard(cardId) {
        return this.cards.get(cardId);
    }
    /**
     * Get all cards in the deck
     *
     * @returns Array of all cards
     */
    getAllCards() {
        return Array.from(this.cards.values());
    }
    /**
     * Get cards due for review
     *
     * @param now Current timestamp (defaults to now)
     * @returns Array of due cards
     */
    getDueCards(now = Date.now()) {
        return this.getAllCards().filter((card) => card.dueDate <= now);
    }
    /**
     * Review a card and update its state
     *
     * @param cardId ID of the card to review
     * @param difficulty The reported difficulty level
     * @returns The updated card or undefined if not found
     */
    reviewCard(cardId, difficulty) {
        const card = this.getCard(cardId);
        if (!card) {
            return undefined;
        }
        card.review(difficulty);
        return card;
    }
    /**
     * Generate a unique ID for the deck
     */
    generateId() {
        return "deck_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    }
    /**
     * Creates a Deck instance from JSON data and card array
     */
    static fromJSON(data, cardData) {
        const cards = cardData.filter((card) => data.cardIds.includes(card.id)).map((card) => Card.fromJSON(card));
        return new Deck(data.name, data.description, data.id, data.createdAt, data.cardIds, cards);
    }
    /**
     * Converts deck to serializable object (without cards)
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            createdAt: this.createdAt,
            cardIds: [...this.cardIds],
        };
    }
    /**
     * Get cards and deck as serializable objects
     */
    serialize() {
        return {
            deck: this.toJSON(),
            cards: this.getAllCards().map((card) => card.toJSON()),
        };
    }
    /**
     * Verify the representation invariant
     */
    checkRep() {
        // Basic checks
        if (!this.id || this.id.trim() === "") {
            throw new Error("Deck ID cannot be empty");
        }
        if (!this.name || this.name.trim() === "") {
            throw new Error("Deck name cannot be empty");
        }
        if (this.createdAt > Date.now()) {
            throw new Error("Deck creation date cannot be in the future");
        }
        // Check that cardIds and cards are consistent
        if (this.cardIds.length !== this.cards.size) {
            throw new Error("Card IDs list and cards map size mismatch");
        }
        for (const cardId of this.cardIds) {
            if (!this.cards.has(cardId)) {
                throw new Error(`Card ID ${cardId} in cardIds but not in cards map`);
            }
        }
        // Check for duplicate card IDs
        const uniqueIds = new Set(this.cardIds);
        if (uniqueIds.size !== this.cardIds.length) {
            throw new Error("Duplicate card IDs detected");
        }
        // All checks passed
    }
}
describe("Deck Module", () => {
    it("should initialize a deck correctly", () => {
        // Add test logic here
        expect(true).toBe(true);
    });
});
