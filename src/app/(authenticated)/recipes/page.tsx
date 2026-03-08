"use client";

import { ALL_NUTRIENTS_DICT } from "@/constants/constants";
import React, { useEffect, useMemo, useState } from "react";
import AddRecipeForm from "@/components/recipe/add-recipe-form";
import { LuChefHat } from "react-icons/lu";
import { useApiClient } from "@/lib/hooks";
import {
  recipesApi,
  type Recipe,
  type RecipeNutrient,
  ApiError,
} from "@/lib/api";

const SORTABLE_KEYS = [
  { key: "name", display: "Name" },
  { key: "created_at", display: "Date" },
  { key: "calories", display: "Calories/Serving" },
  { key: "protein", display: "Protein/Serving" },
  { key: "total_fat", display: "Fat/Serving" },
  { key: "total_carbs", display: "Carbs/Serving" },
];

function NutritionSkeleton() {
  return (
    <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-700/40 rounded w-1/4"></div>
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700/40 rounded-full w-20"></div>
      </div>

      {/* Main Nutrients Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-600 p-4 rounded-xl text-center animate-pulse"
          >
            <div className="h-8 bg-zinc-300 dark:bg-zinc-600 rounded-lg mx-auto mb-2"></div>
            <div className="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-5 bg-zinc-300 dark:bg-zinc-600 rounded w-5/6 mx-auto"></div>
          </div>
        ))}
      </div>

      {/* Detailed Nutrients Skeleton */}
      <div className="mb-4">
        <div className="h-5 bg-zinc-200 dark:bg-zinc-700/40 rounded w-1/3 mb-3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-700/40 rounded-lg animate-pulse"
            >
              <div className="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-2/3"></div>
              <div className="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-3 bg-zinc-200 dark:bg-zinc-700/40 rounded w-1/4 mx-auto"></div>
    </div>
  );
}

function RecipeNutrients({
  servings,
  nutrients,
  loading,
}: {
  servings: number;
  nutrients: RecipeNutrient[];
  loading: boolean;
}) {
  const [showPerServing, setShowPerServing] = useState(true);

  // Show skeleton while loading
  if (loading) {
    return <NutritionSkeleton />;
  }

  if (!nutrients || nutrients.length === 0) {
    return (
      <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <div className="text-center py-6 text-zinc-500 dark:text-zinc-400">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No nutrition data available</p>
        </div>
      </div>
    );
  }

  const getMainNutrients = () => {
    const mainKeys = ["calories", "protein", "total_fat", "total_carbs"];
    return nutrients.filter((n) => mainKeys.includes(n.nutrientKey));
  };

  const getOtherNutrients = () => {
    const mainKeys = ["calories", "protein", "total_fat", "total_carbs"];
    return nutrients.filter((n) => !mainKeys.includes(n.nutrientKey));
  };

  return (
    <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-zinc-900 dark:text-white text-lg">
          Nutrition Facts
        </h4>
        <button
          onClick={() => setShowPerServing(!showPerServing)}
          className="cursor-pointer px-3 py-1 text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700/40 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-full transition-colors"
        >
          {showPerServing ? "Per Serving" : "Total"}
        </button>
      </div>

      {/* Main Nutrients Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {getMainNutrients().map((nutrient) => (
          <div
            key={nutrient.nutrientKey}
            className="dark:bg-zinc-700/40 bg-zinc-50 p-4 rounded-xl text-center"
          >
            <div className="text-2xl font-bold text-[#337E8D] dark:text-[#C9E6EA]">
              {showPerServing
                ? (nutrient.totalAmount / servings).toFixed(0)
                : nutrient.totalAmount.toFixed(0)}
              <span className="text-xs text-[#337E8D] dark:text-[#C9E6EA] uppercase tracking-wide font-bold ml-1">
                {nutrient.unit}
              </span>
            </div>
            <div className="text-sm font-medium text-[#337E8D] dark:text-[#C9E6EA] mt-2">
              {ALL_NUTRIENTS_DICT[nutrient.nutrientKey]?.display_name ||
                nutrient.nutrientKey}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Nutrients */}
      {getOtherNutrients().length > 0 && (
        <>
          <h5 className="font-medium text-zinc-700 dark:text-zinc-300 text-sm mb-3">
            Detailed Nutrition
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {getOtherNutrients().map((nutrient) => (
              <div
                key={nutrient.nutrientKey}
                className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/40 rounded-lg"
              >
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {ALL_NUTRIENTS_DICT[nutrient.nutrientKey]?.display_name ||
                    nutrient.nutrientKey}
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {showPerServing
                    ? (nutrient.totalAmount / servings).toFixed(1)
                    : nutrient.totalAmount.toFixed(1)}{" "}
                  {nutrient.unit}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 text-center">
        Based on 1 serving
      </div>
    </div>
  );
}

export default function RecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  const { customFetch } = useApiClient();

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await recipesApi.getAll(customFetch);
      setRecipes(data);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : "Failed to fetch recipes";
      console.error("Failed to fetch recipes:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const getRecipeNutrientAmountPerServing = (
    recipe: Recipe,
    nutrientKey: string,
  ): number => {
    const nutrient = recipe.recipeNutrients.find(
      (n) => n.nutrientKey === nutrientKey,
    );
    return nutrient ? nutrient.totalAmount / recipe.servings : 0;
  };

  const sortedRecipes = useMemo(() => {
    const sorted = [...recipes];

    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortKey === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortKey === "created_at") {
        aValue = a.createdAt;
        bValue = b.createdAt;
      } else {
        aValue = getRecipeNutrientAmountPerServing(a, sortKey);
        bValue = getRecipeNutrientAmountPerServing(b, sortKey);
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
  }, [recipes, sortKey, sortDirection]);

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      if (key === "created_at") {
        setSortDirection("desc");
      } else {
        setSortDirection("asc");
      }
    }
  };

  function getPreviewNutrients(nutrients: RecipeNutrient[]) {
    const keys = ["calories", "protein", "total_carbs"];
    const dict: Record<string, RecipeNutrient | undefined> = {};
    for (const k of keys) {
      dict[k] = nutrients.find((n) => n.nutrientKey === k);
    }
    return dict;
  }

  const toggleExpand = (recipeId: string) => {
    setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <div className="p-6 min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error loading recipes
          </h3>
          <p className="text-red-600 dark:text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchRecipes}
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
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-zinc-200 dark:bg-zinc-700/40 rounded-xl p-6 h-48"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="p-6 text-center min-h-screen">
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-8 max-w-md mx-auto flex flex-col items-center">
          <div className="text-zinc-400 dark:text-zinc-500 text-6xl mb-4">
            <LuChefHat className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
            No recipes yet
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            Create your first recipe to start cooking!
          </p>
          <AddRecipeForm fetchRecipes={fetchRecipes} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            My Recipes
          </h1>
          <AddRecipeForm fetchRecipes={fetchRecipes} />
        </div>

        <span className="text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700/40 px-3 py-1 rounded-full">
          {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mr-2">
          Sort by:
        </span>
        {SORTABLE_KEYS.map((item) => (
          <button
            key={item.key}
            onClick={() => handleSortChange(item.key)}
            className={`
              text-xs font-medium px-3 py-1 rounded-full transition-all duration-150 cursor-pointer
              ${
                sortKey === item.key
                  ? "bg-[#3A8F9E] text-white shadow-md hover:bg-[#337E8D]"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700/40 dark:text-zinc-300 dark:hover:bg-zinc-600 cursor-pointer"
              }
            `}
          >
            {item.display}{" "}
            {sortKey === item.key && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {sortedRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Recipe Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="font-bold text-xl text-zinc-900 dark:text-white mb-2">
                  {recipe.name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(recipe.createdAt)}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex gap-6 text-sm text-zinc-800 dark:text-zinc-200">
                    {(() => {
                      const preview = getPreviewNutrients(
                        recipe.recipeNutrients,
                      );
                      return (
                        <>
                          <div>
                            <span className="font-bold">
                              {preview.calories
                                ? (
                                    preview.calories.totalAmount /
                                    recipe.servings
                                  ).toFixed(0)
                                : "--"}
                            </span>{" "}
                            kcal
                          </div>
                          <div>
                            <span className="font-bold">
                              {preview.protein
                                ? (
                                    preview.protein.totalAmount /
                                    recipe.servings
                                  ).toFixed(0)
                                : "--"}
                            </span>{" "}
                            g Protein
                          </div>
                          <div>
                            <span className="font-bold">
                              {preview.total_carbs
                                ? (
                                    preview.total_carbs.totalAmount /
                                    recipe.servings
                                  ).toFixed(0)
                                : "--"}
                            </span>{" "}
                            g Carbs
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleExpand(recipe.id)}
                className="ml-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700/40 rounded-lg transition-colors cursor-pointer"
              >
                {expandedRecipe === recipe.id ? (
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

            {/* Expanded Section */}
            {expandedRecipe === recipe.id && (
              <>
                {/* Full Ingredients */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <h4 className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm uppercase tracking-wide mb-3">
                    All Ingredients
                  </h4>
                  <div className="grid gap-3">
                    {recipe.recipeIngredients.map((ri, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/40 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-white">
                            {ri.ingredient.name}
                          </div>
                          {ri.ingredient.brand && (
                            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                              {ri.ingredient.brand}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-[#337E8D] dark:text-[#C9E6EA]">
                            {ri.quantity} {ri.unit}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nutrition */}
                <RecipeNutrients
                  servings={recipe.servings}
                  nutrients={recipe.recipeNutrients}
                  loading={false}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
