declare interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
  addEventListener(type: "install", listener: (this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => any): void;
  addEventListener(type: "activate", listener: (this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => any): void;
  addEventListener(type: "fetch", listener: (this: ServiceWorkerGlobalScope, ev: FetchEvent) => any): void;
  addEventListener(type: "message", listener: (this: ServiceWorkerGlobalScope, ev: MessageEvent) => any): void;
}

declare interface ExtendableEvent extends Event {
  waitUntil(f: Promise<any>): void;
}

declare interface FetchEvent extends Event {
  readonly request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

import { Card } from "../lib/card";
import { StorageManager } from "../lib/storageManager";
import { addCardHandler } from "./handlers/addCardHandler";
import { removeCardHandler } from "./handlers/removeCardHandler";
import { updateHandler } from "./handlers/updateHandler";
import { practiceHandler } from "./handlers/practiceHandler";
import { getAllDecksAndCardsHandler } from "./handlers/getAllDecksAndCardsHandler";
import { editCardHandler } from "./handlers/editCardHandler";
import { moveCardHandler } from "./handlers/moveCardHandler";

StorageManager.initialize().then(() => {});

function respond(port: MessagePort | undefined, data: any) {
  if (port) port.postMessage(data);
}

async function handleMessage(event: MessageEvent) {
  const { data: message, ports } = event;
  const port = ports && ports[0];
  try {
    switch (message.action) {
      case "performAction":
        respond(port, { status: "Action Completed" });
        break;
      case "practice":
        await practiceHandler(message, port);
        break;
      case "update":
        await updateHandler(message, port);
        break;
      case "addCard":
        await addCardHandler(message, port);
        break;
      case "removeCard":
        await removeCardHandler(message, port);
        break;
      case "getAllDecksAndCards":
        await getAllDecksAndCardsHandler(message, port);
        break;
      case "editCard":
        await editCardHandler(message, port);
        break;
      case "moveCard":
        await moveCardHandler(message, port);
        break;
      default:
        respond(port, { error: "Unknown action" });
    }
  } catch (err: any) {
    const errorMsg =
      err && typeof err === "object" && "message" in err ? (err as any).message : String(err) || "Internal error";
    respond(port, { success: false, error: errorMsg });
  }
}

self.addEventListener("install", async () => {
  await StorageManager.initialize();
});

self.addEventListener("activate", async () => {
  await StorageManager.initialize();
});

self.addEventListener("fetch", (event) => {
  const fetchEvent = event as FetchEvent;
});

self.addEventListener("message", (event) => {
  handleMessage(event);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "addCard") {
    const card = message.card;
    if (card && card.front && card.back) {
      try {
        const newCard = new Card(card.front, card.back, card.source);
        const deckId = card.deckId || StorageManager.DEFAULT_DECK_ID;
        StorageManager.saveCard(newCard, deckId)
          .then(() => {
            StorageManager.getAllDecks().then((decks) => {});
            StorageManager.getAllCards().then((cards) => {});
            sendResponse({ success: true });
          })
          .catch((err) => {
            const errorMsg =
              err && typeof err === "object" && "message" in err
                ? (err as any).message
                : String(err) || "Failed to save card";
            sendResponse({ success: false, error: errorMsg });
          });
      } catch (err) {
        const errorMsg =
          err && typeof err === "object" && "message" in err
            ? (err as any).message
            : String(err) || "Failed to create card";
        sendResponse({ success: false, error: errorMsg });
      }
    } else {
      sendResponse({ success: false, error: "Missing card data" });
    }
    return true;
  }
});
