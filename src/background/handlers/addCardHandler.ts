import { Card } from "../../lib/card";
import { StorageManager } from "../../lib/storageManager";

export async function addCardHandler(message: any, port: MessagePort | undefined) {
  const { card } = message;
  if (card && card.front && card.back) {
    try {
      const newCard = new Card(card.front, card.back, card.source);
      await StorageManager.saveCard(newCard);
      if (port) port.postMessage({ success: true });
    } catch (err) {
      if (port) port.postMessage({ success: false, error: String(err) });
    }
  } else {
    if (port) port.postMessage({ success: false, error: "Missing card data" });
  }
}
