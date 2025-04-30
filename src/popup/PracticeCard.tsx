import React from "react";
import { ICard } from "../lib/types";
import { observer } from "mobx-react";

interface PracticeCardProps {
  card: ICard;
  bucket: number;
  showBack: boolean;
  onReveal: () => void;
  onResult: (result: "easy" | "hard" | "wrong") => void;
  onExit: () => void;
}

const PracticeCard: React.FC<PracticeCardProps> = ({ card, bucket, showBack, onReveal, onResult, onExit }) => (
  <div
    className="flashcard"
    style={{ border: "1px solid #ccc", borderRadius: 5, padding: 20, margin: "20px 0", textAlign: "center" }}
  >
    <p>
      <b>Front:</b> {card.front}
    </p>
    <p style={{ display: showBack ? "block" : "none" }}>
      <b>Back:</b> {card.back}
    </p>
    <p style={{ fontSize: "0.9em", color: "#888" }}>Bucket: {bucket}</p>
    {!showBack && (
      <button className="button" onClick={onReveal}>
        Reveal Back
      </button>
    )}
    {showBack && (
      <>
        <button className="button" onClick={() => onResult("easy")}>
          Easy
        </button>
        <button className="button" onClick={() => onResult("hard")}>
          Hard
        </button>
        <button className="button" onClick={() => onResult("wrong")}>
          Wrong
        </button>
      </>
    )}
    <div style={{ marginTop: "10px" }}>
      <button className="button" onClick={onExit} style={{ backgroundColor: "#ff4444" }}>
        Exit Practice
      </button>
    </div>
  </div>
);

export default observer(PracticeCard);
