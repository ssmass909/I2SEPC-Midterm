import { StorageManager } from "../../lib/storageManager";

export async function getAllDecksAndCardsHandler(message: any, port: MessagePort | undefined) {
  const decks = await StorageManager.getAllDecks();
  const cards = await StorageManager.getAllCards();
  // Attach deckId to each card for UI
  const deckMap: Record<string, string> = {};
  for (const deck of decks) {
    for (const cardId of deck.cardIds) {
      deckMap[cardId] = deck.id;
    }
  }
  const cardsWithDeck = cards.map((card) => ({
    ...card.toJSON(),
    deckId: deckMap[card.id] || StorageManager.DEFAULT_DECK_ID,
  }));
  if (port) port.postMessage({ decks, cards: cardsWithDeck });
}
