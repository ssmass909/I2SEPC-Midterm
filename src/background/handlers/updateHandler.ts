import { StorageManager } from "../../lib/storageManager";

export async function updateHandler(message: any, port: MessagePort | undefined) {
  const { flashcard, result } = message;
  if (flashcard && flashcard.id) {
    await StorageManager.updateCardReview(flashcard.id, result);
    if (port) port.postMessage({ success: true });
  } else {
    if (port) port.postMessage({ success: false, error: "Invalid flashcard" });
  }
}
