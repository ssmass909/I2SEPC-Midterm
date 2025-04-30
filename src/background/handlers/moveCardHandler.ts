import { StorageManager } from "../../lib/storageManager";

export async function moveCardHandler(message: any, port: MessagePort | undefined) {
  const { cardId, newDeckId } = message;
  const card = await StorageManager.getCardById(cardId);
  if (!card) {
    if (port) port.postMessage({ success: false, error: "Card not found" });
    return;
  }
  // Remove from all decks, add to new deck
  const decks = await StorageManager.getAllDecks();
  for (const deck of decks) {
    const idx = deck.cardIds.indexOf(cardId);
    if (idx !== -1) deck.cardIds.splice(idx, 1);
  }
  const newDeck = decks.find((d: any) => d.id === newDeckId);
  if (!newDeck) {
    if (port) port.postMessage({ success: false, error: "Target deck not found" });
    return;
  }
  newDeck.cardIds.push(cardId);
  await StorageManager.saveCard(card, newDeckId);
  if (port) port.postMessage({ success: true });
}
