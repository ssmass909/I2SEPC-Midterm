import { StorageManager } from "../../lib/storageManager";

export async function practiceHandler(message: any, port: MessagePort | undefined) {
  const decks = await StorageManager.getAllDecks();
  let flashcard = null;
  if (decks.length > 0) {
    const cards = await StorageManager.getDueCards(decks[0].id);
    if (cards.length > 0) flashcard = cards[0];
  }
  if (port) port.postMessage({ flashcard });
}
