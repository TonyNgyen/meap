import React from "react";

interface Item {
  name: string;
  price: number;
  is_offer?: boolean | null;
}

function ItemDisplay({ initialItem, itemId }: { initialItem: Item; itemId: string }) {
  return <div>ItemDisplay: {initialItem.name} (ID: {itemId})</div>;
}

export default ItemDisplay;
