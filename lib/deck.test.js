const { Deck } = require("./deck.js");
import { Card } from "./card";
describe("Deck Module", () => {
    it("should initialize a deck correctly", () => {
        const deck = new Deck("Test Deck", "A test deck");
        expect(deck.name).toBe("Test Deck");
        expect(deck.cardIds.length).toBe(0);
    });
    it("should add and retrieve a card", () => {
        const deck = new Deck("Test Deck");
        const card = new Card("Front", "Back", "source");
        deck.addCard(card);
        expect(deck.getCard(card.id)).toBeDefined();
        expect(deck.getAllCards().length).toBe(1);
    });
    it("should remove a card", () => {
        const deck = new Deck("Test Deck");
        const card = new Card("Front", "Back", "source");
        deck.addCard(card);
        deck.removeCard(card.id);
        expect(deck.getCard(card.id)).toBeUndefined();
        expect(deck.getAllCards().length).toBe(0);
    });
});
