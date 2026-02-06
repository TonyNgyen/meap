"use client";

import { useEffect, useMemo, useState } from "react";
import AddIngredientForm from "@/components/add-ingredient-form";
import { useApiClient } from "@/lib/hooks";
import { ingredientsApi, Ingredient, Nutrient, ApiError } from "@/lib/api";

const SORTABLE_NUTRIENTS = [
  { key: "name", display: "Name" },
  { key: "calories", display: "Calories" },
  { key: "protein", display: "Protein" },
  { key: "total_fat", display: "Fat" },
  { key: "total_carbs", display: "Carbs" },
];

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(
    null,
  );
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // ✨ Get demo-aware fetch function
  const { customFetch } = useApiClient();

  // ✨ CLEAN: One function, one responsibility
  const fetchIngredients = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✨ CLEAN: Single API call, pass custom fetch for demo mode
      const data = await ingredientsApi.getAll(customFetch);
      console.log("Fetched ingredients:", data);
      setIngredients(data);
    } catch (err) {
      // ✨ CLEAN: Type-safe error handling
      const errorMessage =
        err instanceof ApiError ? err.message : "Failed to fetch ingredients";
      console.error("Failed to fetch ingredients:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIngredient(expandedIngredient === id ? null : id);
  };

  // ✨ CLEAN: Business logic functions stay the same
  const getMainNutrients = (nutrients: Nutrient[]) => {
    const mainKeys = ["calories", "protein", "total_fat", "total_carbs"];
    return nutrients.filter((n) => mainKeys.includes(n.nutrientKey));
  };

  const getOtherNutrients = (nutrients: Nutrient[]) => {
    const mainKeys = ["calories", "protein", "total_fat", "total_carbs"];
    return nutrients.filter(
      (n) => !mainKeys.includes(n.nutrientKey) && n.amount > 0,
    );
  };

  const getIngredientNutrientAmount = (
    ingredient: Ingredient,
    nutrientKey: string,
  ): number => {
    const nutrient = ingredient.nutrients.find(
      (n) => n.nutrientKey === nutrientKey,
    );
    return nutrient?.amount ?? 0;
  };

  const sortedIngredients = useMemo(() => {
    const sorted = [...ingredients];

    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortKey === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else {
        aValue = getIngredientNutrientAmount(a, sortKey);
        bValue = getIngredientNutrientAmount(b, sortKey);
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [ingredients, sortKey, sortDirection]);

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // ✨ CLEAN: Error state handling
  if (error) {
    return (
      <div className="p-6 min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error loading ingredients
          </h3>
          <p className="text-red-600 dark:text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchIngredients}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 min-h-screen">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-zinc-200 dark:bg-zinc-700 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (ingredients.length === 0) {
    return (
      <div className="p-6 min-h-screen">
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-8 max-w-md mx-auto flex flex-col items-center">
          <div className="text-zinc-400 dark:text-zinc-500 text-6xl mb-4">
            🥗
          </div>
          <h3 className="text-lg font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
            No ingredients yet
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            Add your first ingredient to get started with meal prep!
          </p>
          <AddIngredientForm fetchIngredients={fetchIngredients} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            My Ingredients
          </h1>
          <AddIngredientForm fetchIngredients={fetchIngredients} />
        </div>

        <span className="text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-3 py-1 rounded-full">
          {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mr-2">
          Sort by:
        </span>
        {SORTABLE_NUTRIENTS.map((item) => (
          <button
            key={item.key}
            onClick={() => handleSortChange(item.key)}
            className={`
              text-xs font-medium px-3 py-1 rounded-full transition-all duration-150 cursor-pointer
              ${
                sortKey === item.key
                  ? "bg-[#3A8F9E] text-white shadow-md hover:bg-[#337E8D]"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600 cursor-pointer"
              }
            `}
          >
            {item.display}{" "}
            {sortKey === item.key && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {sortedIngredients.map((ingredient) => (
          <div
            key={ingredient.id}
            className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="font-bold text-xl text-zinc-900 dark:text-white mb-1">
                  {ingredient.name}
                </h2>
                {ingredient.brand && (
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    Brand: {ingredient.brand}
                  </p>
                )}
                <div className="space-y-1 mt-1">
                  {(() => {
                    const defaultUnit = ingredient.units.find(
                      (u) => u.isDefault,
                    );
                    return defaultUnit ? (
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                        Serving: {defaultUnit.amount} {defaultUnit.unitName}{" "}
                        {ingredient.servingSize &&
                          ingredient.servingUnit &&
                          `(${ingredient.servingSize}${ingredient.servingUnit})`}
                      </p>
                    ) : (
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                        Serving: {ingredient.servingSize}
                        {ingredient.servingUnit}
                      </p>
                    );
                  })()}
                  {ingredient.servingsPerContainer && (
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                      Servings per container: {ingredient.servingsPerContainer}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => toggleExpand(ingredient.id)}
                className="ml-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
              >
                {expandedIngredient === ingredient.id ? (
                  <svg
                    className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Minimal Main Nutrition Facts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {getMainNutrients(ingredient.nutrients).map((nutrient) => (
                  <div key={nutrient.id} className="text-center">
                    <div className="text-lg font-semibold text-[#3A8F9E] dark:text-[#C9E6EA]">
                      {nutrient.amount}
                      <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 ml-1">
                        {nutrient.unit}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      {nutrient.displayName}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expandable Section */}
            {expandedIngredient === ingredient.id && (
              <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700">
                <h4 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-3 text-sm uppercase tracking-wide">
                  Full Nutrition Facts
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getOtherNutrients(ingredient.nutrients).map((nutrient) => (
                    <div
                      key={nutrient.id}
                      className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-700 rounded-lg"
                    >
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {nutrient.displayName}
                      </span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {nutrient.amount} {nutrient.unit}
                      </span>
                    </div>
                  ))}
                </div>

                {getOtherNutrients(ingredient.nutrients).length === 0 && (
                  <div className="text-center py-6 text-zinc-500 dark:text-zinc-400">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-sm">No additional nutrition data</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
