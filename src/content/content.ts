import { ExtensionMessage } from "../lib/types";

let selectedText = "";

document.addEventListener("mouseup", () => {
  const selection = window.getSelection();
  if (selection) {
    const text = selection.toString().trim();
    if (text) {
      selectedText = text;
    }
  }
});

document.addEventListener("mousedown", () => {
  selectedText = "";
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  // @ts-ignore
  if (message.type === "GET_SELECTED_TEXT") {
    // Send the currently selected text
    sendResponse({
      text: selectedText,
      url: window.location.href,
      title: document.title,
    });
  }

  return true;
});

function createContextMenu() {
  chrome.runtime.sendMessage({
    type: "CREATE_CONTEXT_MENU",
  });
}

createContextMenu();

function getSelectionContext(selection: Selection, maxLength: number = 100): string {
  if (!selection.rangeCount) return "";

  const range = selection.getRangeAt(0);
  const startNode = range.startContainer;

  let contextNode = startNode;
  while (
    contextNode &&
    !(contextNode instanceof HTMLParagraphElement) &&
    !(contextNode instanceof HTMLDivElement) &&
    contextNode !== document.body
  ) {
    if (contextNode.parentNode) {
      contextNode = contextNode.parentNode;
    } else {
      break;
    }
  }

  let context = contextNode.textContent || "";

  if (context.length > maxLength) {
    const selectionPosition = context.indexOf(selection.toString());
    if (selectionPosition > -1) {
      const startPos = Math.max(0, selectionPosition - maxLength / 2);
      const endPos = Math.min(context.length, startPos + maxLength);
      context =
        (startPos > 0 ? "..." : "") + context.substring(startPos, endPos) + (endPos < context.length ? "..." : "");
    } else {
      context = context.substring(0, maxLength) + "...";
    }
  }

  return context;
}

document.addEventListener("contextmenu", (event) => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    const context = getSelectionContext(selection);

    sessionStorage.setItem("flashcard_selection_context", context);
  }
});

let highlightOverlay: HTMLElement | null = null;

document.addEventListener("mouseup", () => {
  if (highlightOverlay) {
    document.body.removeChild(highlightOverlay);
    highlightOverlay = null;
  }

  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    highlightOverlay = document.createElement("div");
    highlightOverlay.style.position = "absolute";
    highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
    highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
    highlightOverlay.style.width = `${rect.width}px`;
    highlightOverlay.style.height = `${rect.height}px`;
    highlightOverlay.style.backgroundColor = "rgba(255, 255, 0, 0.3)";
    highlightOverlay.style.pointerEvents = "none";
    highlightOverlay.style.zIndex = "9999";
    highlightOverlay.style.borderRadius = "3px";
    highlightOverlay.style.transition = "all 0.2s ease-in-out";

    const quickAddButton = document.createElement("div");
    quickAddButton.style.position = "absolute";
    quickAddButton.style.right = "0";
    quickAddButton.style.top = "-30px";
    quickAddButton.style.backgroundColor = "#4285f4";
    quickAddButton.style.color = "white";
    quickAddButton.style.padding = "3px 8px";
    quickAddButton.style.borderRadius = "3px";
    quickAddButton.style.fontSize = "12px";
    quickAddButton.style.cursor = "pointer";
    quickAddButton.style.pointerEvents = "auto";
    quickAddButton.textContent = "Add Card";
    quickAddButton.title = "Create flashcard from selection";

    quickAddButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      chrome.runtime.sendMessage({
        type: "CREATE_CARD",
        payload: {
          front: selection.toString().trim(),
          context: getSelectionContext(selection),
          url: window.location.href,
          title: document.title,
        },
      });

      quickAddButton.textContent = "Added!";
      setTimeout(() => {
        if (highlightOverlay) {
          document.body.removeChild(highlightOverlay);
          highlightOverlay = null;
        }
      }, 800);
    });

    highlightOverlay.appendChild(quickAddButton);
    document.body.appendChild(highlightOverlay);
  }
});

document.addEventListener("mousedown", (e) => {
  if (
    (e.target && (e.target as HTMLElement).textContent === "Add Card") ||
    (e.target as HTMLElement).textContent === "Added!"
  ) {
    return;
  }

  if (highlightOverlay) {
    document.body.removeChild(highlightOverlay);
    highlightOverlay = null;
  }
});
