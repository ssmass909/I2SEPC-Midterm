import { StorageManager } from "../../lib/storageManager";

export async function editCardHandler(message: any, port: MessagePort | undefined) {
  const { cardId, front, back } = message;
  const card = await StorageManager.getCardById(cardId);
  if (!card) {
    if (port) port.postMessage({ success: false, error: "Card not found" });
    return;
  }
  card.front = front;
  card.back = back;
  await StorageManager.saveCard(card);
  if (port) port.postMessage({ success: true });
}
