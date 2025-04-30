import React, { Suspense, lazy, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { ICard } from "../lib/types";
import ProgressBar from "../popup/ProgressBar";
import { observer } from "mobx-react";
import PopupStore from "./popupStore";

const AddCardForm = lazy(() => import("../popup/AddCardForm"));
const PracticeCard = lazy(() => import("../popup/PracticeCard"));
const BucketsMenu = lazy(() => import("../popup/BucketsMenu"));

const RETIRED_BUCKET = 5;

const App: React.FC = observer(() => {
  const popupStore = useMemo(() => new PopupStore(), []);

  useEffect(() => {
    popupStore.fetchAll();
  }, [popupStore]);

  const bucketSets = Array.from({ length: RETIRED_BUCKET + 1 }, () => new Set<string>());
  popupStore.cards.forEach((card: ICard) => {
    const bucket = card.bucket ?? 0;
    if (bucket >= 0 && bucket <= RETIRED_BUCKET) {
      bucketSets[bucket].add(card.id);
    }
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div style={{ fontFamily: "Arial, sans-serif", padding: 10, minWidth: 320 }}>
        <h1>Flashcard Practice</h1>
        {popupStore.progress && <ProgressBar progress={popupStore.progress} />}
        <AddCardForm
          addFront={popupStore.addFront}
          setAddFront={popupStore.setAddFront}
          addBack={popupStore.addBack}
          setAddBack={popupStore.setAddBack}
          addSource={popupStore.addSource}
          setAddSource={popupStore.setAddSource}
          handleAddCard={() => popupStore.handleAddCard(popupStore.addFront, popupStore.addBack, popupStore.addSource)}
        />
        {!popupStore.practiceMode && (
          <div style={{ margin: "10px 0" }}>
            <button className="button" onClick={() => popupStore.startPractice()}>
              Start Practice
            </button>
          </div>
        )}
        {popupStore.practiceMode && popupStore.practiceQueue[popupStore.practiceIdx] && (
          <PracticeCard
            card={popupStore.practiceQueue[popupStore.practiceIdx]}
            bucket={popupStore.bucketMap.get(popupStore.practiceQueue[popupStore.practiceIdx].id) ?? 0}
            showBack={popupStore.showBack}
            onReveal={() => popupStore.setShowBack(true)}
            onResult={(result) => popupStore.handlePracticeResult(result)}
            onExit={() => popupStore.exitPractice()}
          />
        )}
        {!popupStore.practiceMode && (
          <BucketsMenu
            bucketSets={bucketSets}
            cards={popupStore.cards}
            openBucket={popupStore.openBucket}
            setOpenBucket={popupStore.setOpenBucket}
          />
        )}
        <p>Status: {popupStore.status}</p>
      </div>
    </Suspense>
  );
});

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

export default App;
