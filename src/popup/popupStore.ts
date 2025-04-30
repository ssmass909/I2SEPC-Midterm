import { action, computed, makeObservable, observable, reaction, toJS } from "mobx";
import { ICard } from "src/lib/types";
import {
  ensureBuckets,
  computeProgress,
  getTodayNumber,
  getPracticeSet,
  updateBucket,
  RETIRED_BUCKET,
} from "../lib/buckets";

class PopupStore {
  cards: ICard[] = [];
  bucketMap = new Map<string, number>();
  practiceQueue: ICard[] = [];
  practiceIdx = 0;
  practiceMode = false;
  showBack = false;
  status = "";
  addFront = "";
  addBack = "";
  addSource = "";
  progress: any = null;
  openBucket: number | null = null;

  constructor() {
    makeObservable(this, {
      cards: observable,
      bucketMap: observable,
      practiceQueue: observable,
      practiceIdx: observable,
      practiceMode: observable,
      showBack: observable,
      status: observable,
      addFront: observable,
      addBack: observable,
      addSource: observable,
      progress: observable,
      openBucket: observable,
      setCards: action,
      setBucketMap: action,
      setPracticeQueue: action,
      setPracticeIdx: action,
      setPracticeMode: action,
      setShowBack: action,
      setStatus: action,
      setAddFront: action,
      setAddBack: action,
      setAddSource: action,
      setProgress: action,
      setOpenBucket: action,
      filteredCards: computed,
      fetchAll: action,
      handleAddCard: action,
      startPractice: action,
      exitPractice: action,
      handlePracticeResult: action,
    });

    reaction(
      () => toJS(this.cards),
      (cards) => {}
    );
  }

  setCards(newCards: ICard[]) {
    this.cards = newCards;
  }

  setBucketMap(newBucketMap: Map<string, number>) {
    this.bucketMap = newBucketMap;
  }

  setPracticeQueue(newQueue: ICard[]) {
    this.practiceQueue = newQueue;
  }

  setPracticeIdx(newIdx: number) {
    this.practiceIdx = newIdx;
  }

  setPracticeMode(newMode: boolean) {
    this.practiceMode = newMode;
  }

  setShowBack(newShowBack: boolean) {
    this.showBack = newShowBack;
  }

  setStatus(newStatus: string) {
    this.status = newStatus;
  }

  setAddFront(newFront: string) {
    this.addFront = newFront;
  }

  setAddBack(newBack: string) {
    this.addBack = newBack;
  }

  setAddSource(newSource: string) {
    this.addSource = newSource;
  }

  setProgress(newProgress: any) {
    this.progress = newProgress;
  }

  setOpenBucket(newOpenBucket: number | null) {
    this.openBucket = newOpenBucket;
  }

  get filteredCards() {
    return this.cards.filter((card) => this.bucketMap.get(card.id) !== undefined);
  }

  fetchAll() {
    chrome.runtime.sendMessage({ action: "getAllDecksAndCards" }, (response) => {
      if (response && response.cards) {
        this.setCards(response.cards);
        let map = new Map<string, number>();
        for (const card of response.cards) {
          if (typeof card.bucket === "number") {
            map.set(card.id, card.bucket);
          }
        }
        map = ensureBuckets(response.cards, map);
        this.setBucketMap(map);
        this.setProgress(computeProgress(map, RETIRED_BUCKET));
      } else {
        this.setCards([]);
        this.setBucketMap(new Map());
        this.setProgress(null);
      }
    });
  }

  handleAddCard(addFront: string, addBack: string, addSource: string) {
    if (!addFront.trim() || !addBack.trim()) {
      this.setStatus("Front and Back are required.");
      return;
    }
    chrome.runtime.sendMessage(
      { action: "addCard", card: { front: addFront, back: addBack, source: addSource } },
      (response) => {
        if (response && response.success) {
          this.setStatus("Card added.");
          this.setAddFront("");
          this.setAddBack("");
          this.setAddSource("");
          this.fetchAll();
        } else {
          this.setStatus("Failed to add card.");
        }
      }
    );
  }

  startPractice() {
    const today = getTodayNumber();
    const dueIds = getPracticeSet(this.bucketMap, RETIRED_BUCKET, today);
    const dueCards = this.cards.filter((c) => dueIds.has(c.id));
    this.setPracticeQueue(dueCards);
    this.setPracticeIdx(0);
    this.setPracticeMode(true);
    this.setShowBack(false);
    this.setStatus(dueCards.length ? "Practice started." : "No cards due for practice today.");
  }

  exitPractice() {
    this.setPracticeMode(false);
    this.setPracticeQueue([]);
    this.setPracticeIdx(0);
    this.setShowBack(false);
    this.setStatus("Practice mode exited.");
    this.fetchAll();
  }

  handlePracticeResult(result: "easy" | "hard" | "wrong") {
    if (!this.practiceQueue[this.practiceIdx]) return;
    const card = this.practiceQueue[this.practiceIdx];
    const newMap = new Map(this.bucketMap);
    updateBucket(newMap, card.id, RETIRED_BUCKET, result);
    this.setBucketMap(newMap);

    chrome.runtime.sendMessage(
      {
        action: "updateCardReview",
        cardId: card.id,
        difficulty: result,
      },
      () => {
        if (this.practiceIdx + 1 < this.practiceQueue.length) {
          this.setPracticeIdx(this.practiceIdx + 1);
          this.setShowBack(false);
        } else {
          this.exitPractice();
          this.setStatus("Practice complete!");
        }
      }
    );
  }
}

export default PopupStore;
