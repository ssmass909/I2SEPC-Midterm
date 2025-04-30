// In-memory mock for chrome.storage.local for Jest
// @ts-ignore
const memoryStore = {};
global.chrome = {
    storage: {
        local: {
            get: jest.fn((keys, cb) => {
                if (Array.isArray(keys)) {
                    const result = {};
                    keys.forEach((key) => {
                        result[key] = memoryStore[key] || [];
                    });
                    cb(result);
                }
                else {
                    cb({});
                }
            }),
            set: jest.fn((items, cb) => {
                Object.assign(memoryStore, items);
                cb && cb();
            }),
            clear: jest.fn((cb) => {
                Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
                cb && cb();
            }),
        },
    },
};
const { StorageManager } = require("./storageManager.js");
import { Card } from "./card";
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
});
