import { StorageManager } from "../../lib/storageManager";

export async function removeCardHandler(message: any, port: MessagePort | undefined) {
  const { cardId } = message;
  if (cardId) {
    await StorageManager.deleteCard(cardId);
    if (port) port.postMessage({ success: true });
  } else {
    if (port) port.postMessage({ success: false, error: "Missing cardId" });
  }
}
