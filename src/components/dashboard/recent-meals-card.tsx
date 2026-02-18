// components/dashboard/RecentMealsCard.tsx
import Link from "next/link";
import React, {
  forwardRef,
  useState,
  useEffect,
  useImperativeHandle,
} from "react";
import { LuHistory, LuPlus, LuUtensils } from "react-icons/lu";

type FoodLogNutrient = {
  nutrient_key: string;
  amount: number;
};

interface RecentMealsCardProps {
  recentMeals: Array<{
    id: string;
    log_datetime: string;
    ingredient: { name: string } | null;
    recipe: { name: string } | null;
    nutrients: FoodLogNutrient[] | null;
  }> | null;
}

// Skeleton component for loading state
function MealItemSkeleton() {
  return (
    <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-700 rounded-lg animate-pulse">
      <div className="flex-1">
        <div className="h-5 bg-zinc-200 dark:bg-zinc-600 rounded w-3/4 mb-1"></div>
      </div>
      <div className="text-right ml-4">
        <div className="h-5 bg-zinc-200 dark:bg-zinc-600 rounded w-20"></div>
      </div>
    </div>
  );
}

function EmptyMealsState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-[#3A8F9E]/10 blur-2xl rounded-full" />
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700">
          <LuUtensils className="w-6 h-6 text-[#3A8F9E]" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        No meals logged today
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 max-w-[180px]">
        Track your breakfast, lunch, or dinner to stay on goal.
      </p>
      <Link href="/foodlog">
        <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#3A8F9E] text-white rounded-lg shadow-md hover:shadow-lg hover:bg-[#337E8D] transition-all">
          <LuPlus className="w-3.5 h-3.5" />
          Log Food
        </button>
      </Link>
    </div>
  );
}

const RecentMealsCard = forwardRef<
  { refresh: () => Promise<void> },
  RecentMealsCardProps
>(({ recentMeals: initialRecentMeals }, ref) => {
  const [recentMeals, setRecentMeals] = useState(initialRecentMeals);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with prop data
  useEffect(() => {
    setRecentMeals(initialRecentMeals);
  }, [initialRecentMeals]);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/recent-meals");
      const data = await res.json();
      if (data.success) {
        setRecentMeals(data.meals);
      }
    } catch (error) {
      console.error("Error fetching recent meals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh,
  }));

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <LuHistory className="w-4 h-4 text-zinc-400" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Recent Meals
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <MealItemSkeleton key={i} />
            ))}
          </div>
        ) : recentMeals?.length ? (
          <div className="space-y-2">
            {recentMeals.map((meal) => (
              <MealItem
                key={meal.id}
                name={meal.ingredient?.name || meal.recipe?.name || "Unknown"}
                nutrients={meal.nutrients || []}
                date={meal.log_datetime}
              />
            ))}
          </div>
        ) : (
          <EmptyMealsState />
        )}
      </div>
    </div>
  );
});

RecentMealsCard.displayName = "RecentMealsCard";

function MealItem({
  name,
  nutrients,
  date,
}: {
  name: string;
  nutrients: any[];
  date: string;
}) {
  const nutrientsDict: { [key: string]: number } = {};
  nutrients.forEach((n) => (nutrientsDict[n.nutrient_key] = n.amount));

  const calories = nutrientsDict["calories"] || 0;
  const time = new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="group flex justify-between items-center p-3 rounded-xl border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-[#3A8F9E] transition-colors">
          {name}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-tight text-zinc-400">
          Logged at {time}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {calories.toFixed(0)}
        </span>
        <span className="text-[10px] font-medium text-zinc-400 uppercase">
          kcal
        </span>
      </div>
    </div>
  );
}

export default RecentMealsCard;
