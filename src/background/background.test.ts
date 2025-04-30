import { jest } from "@jest/globals";

(global as any).self = global;

declare const self: any;

describe("Background Service Worker", () => {
  let postMessageMock: jest.Mock;
  let originalAddEventListener: typeof self.addEventListener;
  let messageHandler: ((event: MessageEvent) => void) | undefined;

  beforeEach(() => {
    postMessageMock = jest.fn();
    originalAddEventListener = self.addEventListener;
    self.addEventListener = ((type: string, handler: EventListenerOrEventListenerObject) => {
      if (type === "message") {
        messageHandler = handler as (event: MessageEvent) => void;
      }
    }) as typeof self.addEventListener;
    if (typeof self.addEventListener === "function") {
      self.addEventListener("message", () => {});
    }
  });

  afterEach(() => {
    self.addEventListener = originalAddEventListener;
    messageHandler = undefined;
  });

  it("should handle practice action and return a flashcard", () => {
    if (!messageHandler) throw new Error("Message event listener not found");
    const messageEvent = new MessageEvent("message", {
      data: { action: "practice" },
      ports: [{ postMessage: postMessageMock } as unknown as MessagePort],
    });
    messageHandler(messageEvent);
    expect(postMessageMock).toHaveBeenCalledWith({
      flashcard: {
        id: 1,
        front: "What is the capital of France?",
        back: "Paris",
      },
    });
  });

  it("should handle update action and confirm success", () => {
    if (!messageHandler) throw new Error("Message event listener not found");
    const messageEvent = new MessageEvent("message", {
      data: {
        action: "update",
        flashcard: { id: 1, front: "What is the capital of France?", back: "Paris" },
        result: "easy",
      },
      ports: [{ postMessage: postMessageMock } as unknown as MessagePort],
    });
    messageHandler(messageEvent);
    expect(postMessageMock).toHaveBeenCalledWith({ success: true });
  });
});
