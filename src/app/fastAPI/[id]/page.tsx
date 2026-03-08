import React from "react";
import ItemDisplay from "./ItemDisplay";

// types.ts (or wherever you keep your types)

async function getItem(itemId: string) {
  // We fetch directly from the FastAPI URL
  const res = await fetch(`http://127.0.0.1:8000/items/${itemId}`, {
    cache: "no-store", // Ensures we get fresh data every time
  });

  if (!res.ok) return undefined;
  return res.json();
}

async function page({ params }: { params: { id: string } }) {
    console.log("Fetching item with ID:", params.id);
  const item = await getItem(params.id);

  if (!item) {
    return <div>Item not found!</div>;
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Server-Side Fetched Item</h1>
      {/* Pass the data to the Client Component */}
      <ItemDisplay initialItem={item} itemId={params.id} />
    </main>
  );
}

export default page;
