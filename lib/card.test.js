const { Card } = require("./card.js");
import { CardDifficulty } from "./types";
describe("Card Module", () => {
    it("should create a card with valid properties", () => {
        const card = new Card("Front content", "Back content", "http://example.com");
        expect(card.front).toBe("Front content");
        expect(card.back).toBe("Back content");
        expect(card.source).toBe("http://example.com");
        expect(card.reviewCount).toBe(0);
        expect(card.difficulty).toBe(CardDifficulty.MEDIUM);
        expect(card.bucket).toBe(0);
    });
    it("should update review state correctly", () => {
        const card = new Card("Front content", "Back content", "http://example.com");
        card.review(CardDifficulty.EASY);
        expect(card.reviewCount).toBe(1);
        expect(card.difficulty).toBe(CardDifficulty.EASY);
        expect(card.bucket).toBe(1);
        expect(card.dueDate).toBeGreaterThan(Date.now());
    });
    it("should serialize and deserialize correctly", () => {
        const card = new Card("Front content", "Back content", "http://example.com");
        const json = card.toJSON();
        const deserializedCard = Card.fromJSON(json);
        expect(deserializedCard.front).toBe(card.front);
        expect(deserializedCard.back).toBe(card.back);
        expect(deserializedCard.source).toBe(card.source);
        expect(deserializedCard.bucket).toBe(card.bucket);
    });
});
