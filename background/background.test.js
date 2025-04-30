import { jest } from "@jest/globals";
// Mock global self for service worker tests
global.self = global;
describe("Background Service Worker", () => {
    let postMessageMock;
    let originalAddEventListener;
    let messageHandler;
    beforeEach(() => {
        postMessageMock = jest.fn();
        // Save the original addEventListener
        originalAddEventListener = self.addEventListener;
        // Mock addEventListener to capture the message handler
        self.addEventListener = ((type, handler) => {
            if (type === "message") {
                messageHandler = handler;
            }
        });
        // Ensure a message event listener is registered
        if (typeof self.addEventListener === "function") {
            self.addEventListener("message", () => { });
        }
    });
    afterEach(() => {
        // Restore the original addEventListener
        self.addEventListener = originalAddEventListener;
        messageHandler = undefined;
    });
    it("should handle practice action and return a flashcard", () => {
        if (!messageHandler)
            throw new Error("Message event listener not found");
        const messageEvent = new MessageEvent("message", {
            data: { action: "practice" },
            ports: [{ postMessage: postMessageMock }],
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
        if (!messageHandler)
            throw new Error("Message event listener not found");
        const messageEvent = new MessageEvent("message", {
            data: {
                action: "update",
                flashcard: { id: 1, front: "What is the capital of France?", back: "Paris" },
                result: "easy",
            },
            ports: [{ postMessage: postMessageMock }],
        });
        messageHandler(messageEvent);
        expect(postMessageMock).toHaveBeenCalledWith({ success: true });
    });
});
