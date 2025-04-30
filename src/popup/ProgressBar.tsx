import { observer } from "mobx-react";
import React from "react";

const ProgressBar: React.FC<{ progress: any }> = ({ progress }) => (
  <div style={{ marginBottom: 10 }}>
    <b>Progress:</b> {progress.retired} retired / {progress.total} total cards
    <br />
    {progress.perBucket.map((count: number, i: number) => (
      <span key={i} style={{ marginRight: 8 }}>
        Bucket {i}: {count}
      </span>
    ))}
    <br />
    <span>Retired: {progress.percentRetired.toFixed(1)}%</span>
  </div>
);

export default observer(ProgressBar);
