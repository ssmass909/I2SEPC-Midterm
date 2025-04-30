import { observer } from "mobx-react";
import React from "react";

interface AddCardFormProps {
  addFront: string;
  setAddFront: (v: string) => void;
  addBack: string;
  setAddBack: (v: string) => void;
  addSource: string;
  setAddSource: (v: string) => void;
  handleAddCard: (e: React.FormEvent) => void;
}

const AddCardForm: React.FC<AddCardFormProps> = ({
  addFront,
  setAddFront,
  addBack,
  setAddBack,
  addSource,
  setAddSource,
  handleAddCard,
}) => (
  <form style={{ marginBottom: 15 }} onSubmit={handleAddCard}>
    <input
      value={addFront}
      onChange={(e) => setAddFront(e.target.value)}
      placeholder="Front"
      required
      style={{ width: "95%", marginBottom: 5 }}
    />
    <input
      value={addBack}
      onChange={(e) => setAddBack(e.target.value)}
      placeholder="Back"
      required
      style={{ width: "95%", marginBottom: 5 }}
    />
    <input
      value={addSource}
      onChange={(e) => setAddSource(e.target.value)}
      placeholder="Source (URL)"
      style={{ width: "95%", marginBottom: 5 }}
    />
    <button className="button" type="submit">
      Add Card
    </button>
  </form>
);

export default observer(AddCardForm);
