"use client";
import Link from "next/link";
import React, {
  forwardRef,
  useEffect,
  useState,
  useImperativeHandle,
} from "react";
import { LuBox, LuPlus } from "react-icons/lu";

type InventoryItemType = {
  id: string;
  ingredient?: {
    name: string;
  };
  recipe?: {
    name: string;
  };
  quantity: number;
  unit: string;
};

// Skeleton component for loading state
function InventoryItemSkeleton() {
  return (
    <div className="flex justify-between items-center py-2 animate-pulse">
      <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3"></div>
      <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-16"></div>
    </div>
  );
}

// Updated Empty State specifically for use inside Cards
function EmptyInventoryState() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Icon with a "Soft" Presence */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-[#3A8F9E]/10 blur-xl rounded-full" />{" "}
        {/* Subtle glow */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700">
          <LuBox className="w-8 h-8 text-[#3A8F9E]" strokeWidth={1.5} />
        </div>
      </div>

      <div className="text-center max-w-[240px]">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          No items tracked
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
          Your pantry is looking a bit empty. Start adding ingredients to see
          them here.
        </p>
      </div>

      <Link href="/inventory">
        <button className="cursor-pointer flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#3A8F9E] text-white rounded-lg shadow-md hover:shadow-lg hover:bg-[#337E8D] transition-all">
          <LuPlus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </Link>
    </div>
  );
}

type InventoryCardProps = { inventoryItems?: InventoryItemType[] };

const InventoryCard = forwardRef<
  { refresh: () => Promise<void> },
  InventoryCardProps
>(({ inventoryItems: initialInventoryItems = [] }, ref) => {
  const [inventoryItems, setInventoryItems] = useState(initialInventoryItems);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setInventoryItems(initialInventoryItems);
  }, [initialInventoryItems]);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (data.success) setInventoryItems(data.inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ refresh }));

  return (
    // Removed `h-full` so the card naturally hugs the fixed-height list
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-5 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LuBox className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Inventory Status
          </h2>
        </div>
      </div>

      {/* THE FIX: 
        1. Set `max-h-[282px]` to show exactly 4.5 items.
        2. Added a mask-image to create a soft fade-out effect at the very bottom.
      */}
      <div
        className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 max-h-[282px]"
        style={{
          // This creates a gradient mask that is 100% solid until the last 20px, then fades to transparent
          maskImage:
            inventoryItems.length > 4
              ? "linear-gradient(to bottom, black 85%, transparent 100%)"
              : "none",
          WebkitMaskImage:
            inventoryItems.length > 4
              ? "linear-gradient(to bottom, black 85%, transparent 100%)"
              : "none",
        }}
      >
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <InventoryItemSkeleton key={i} />
            ))}
          </div>
        ) : inventoryItems.length === 0 ? (
          <EmptyInventoryState />
        ) : (
          <div className="pb-2">
            {inventoryItems.map((item) => (
              <InventoryItem
                key={item.id}
                name={item.ingredient?.name || item.recipe?.name || ""}
                quantity={`${item.quantity} ${item.unit}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

function InventoryItem({ name, quantity }: { name: string; quantity: string }) {
  return (
    // Transparent by default, hover state matches Recent Meals
    <div className="group flex justify-between items-center p-3 rounded-xl border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all">
      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-[#3A8F9E] transition-colors">
        {name}
      </span>
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {quantity.split(" ")[0]}
        </span>
        <span className="text-[10px] font-medium text-zinc-400 uppercase">
          {quantity.split(" ")[1]}
        </span>
      </div>
    </div>
  );
}

InventoryCard.displayName = "InventoryCard";

export default InventoryCard;
