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

function InventoryItem({
  name,
  quantity,
}: {
  name: string;
  quantity: string;
  status?: string;
}) {
  // const statusColors = {
  //   low: "text-red-600 dark:text-red-400",
  //   medium: "text-amber-600 dark:text-amber-400",
  //   good: "text-green-600 dark:text-green-400",
  // };

  return (
    <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
      <span className="text-zinc-900 dark:text-white">{name}</span>
      <span className={`text-sm font-bold text-[#3A8F9E] dark:text-[#C9E6EA]`}>
        {quantity}
      </span>
    </div>
  );
}

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
    <div className="flex flex-col items-center justify-center py-10">
      {/* Icon with a "Soft" Presence */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-[#3A8F9E]/10 blur-xl rounded-full" />{" "}
        {/* Subtle glow */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700 shadow-sm">
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
        <button className="group flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm">
          <LuPlus className="w-3.5 h-3.5 text-[#3A8F9E] group-hover:scale-110 transition-transform" />
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

  // Initialize with prop data
  useEffect(() => {
    setInventoryItems(initialInventoryItems);
  }, [initialInventoryItems]);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (data.success) {
        setInventoryItems(data.inventory);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh,
  }));

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Inventory Status
        </h2>
        {/* <span className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
          3 items low
        </span> */}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <InventoryItemSkeleton />
          <InventoryItemSkeleton />
          <InventoryItemSkeleton />
          <InventoryItemSkeleton />
        </div>
      ) : inventoryItems.length === 0 ? (
        <EmptyInventoryState />
      ) : (
        <div className="space-y-2 max-h-[232px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600">
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
  );
});

InventoryCard.displayName = "InventoryCard";

export default InventoryCard;
