import React from "react";
import { ICard } from "../lib/types";
import { observer } from "mobx-react";

interface BucketsMenuProps {
  bucketSets: Array<Set<string>>;
  cards: ICard[];
  openBucket: number | null;
  setOpenBucket: (i: number | null) => void;
}

const BucketsMenu: React.FC<BucketsMenuProps> = ({ bucketSets, cards, openBucket, setOpenBucket }) => {
  return (
    <div style={{ marginTop: 20 }}>
      <h2>Buckets</h2>
      {bucketSets.map((set, i) => (
        <div key={i} style={{ marginBottom: 15 }}>
          <button
            style={{
              width: "100%",
              fontWeight: "bold",
              cursor: "pointer",
              background: openBucket === i ? "#e0e0e0" : "#f8f8f8",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: "8px",
              marginBottom: 4,
              textAlign: "left",
            }}
            onClick={() => setOpenBucket(openBucket === i ? null : i)}
          >
            📚 Bucket {i}: {set.size} card{set.size !== 1 ? "s" : ""}
          </button>
          {openBucket === i && (
            <div style={{ marginTop: 8 }}>
              {[...set].map((cardId) => {
                const card = cards.find((c) => c.id === cardId);
                if (!card) return null;
                return (
                  <div
                    key={card.id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      padding: 12,
                      marginBottom: 8,
                      backgroundColor: "white",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <strong>Front:</strong>
                      <div
                        style={{
                          padding: "8px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: 3,
                          marginTop: 4,
                        }}
                      >
                        {card.front}
                      </div>
                    </div>
                    <div>
                      <strong>Back:</strong>
                      <div
                        style={{
                          padding: "8px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: 3,
                          marginTop: 4,
                        }}
                      >
                        {card.back}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default observer(BucketsMenu);
