"use client";

import { useState, useEffect, useCallback } from "react";
import { ALL_NUTRIENTS_DICT } from "@/constants/constants";
import { LuPlus, LuX, LuTrash2, LuLoader, LuSearch } from "react-icons/lu";
import { useApiClient } from "@/lib/hooks";
import {
  recipesApi,
  ingredientsApi,
  ApiError,
  type Ingredient as ApiIngredient,
} from "@/lib/api";

type Nutrient = {
  id: string;
  nutrientKey: string;
  unit: string;
  amount: number;
};

type Unit = {
  id: string;
  unitName: string;
  isDefault: boolean;
  amount: number;
};

type Ingredient = {
  id: string;
  name: string;
  brand?: string;
  servingSize?: number;
  servingUnit?: string;
  servingsPerContainer?: number;
  nutrients: Nutrient[];
  units: Unit[];
};

type IngredientRow = {
  ingredient_id: string;
  ingredient_name: string;
  quantity: string;
  unit: string;
  searchResults?: Ingredient[];
  isSearching?: boolean;
  isSelected: boolean;
  selectedIngredient?: Ingredient;
  nutrients: Nutrient[];
  units: Unit[];
};

const getMainNutrients = (nutrients: Nutrient[]) => {
  const mainKeys = ["calories", "protein", "total_fat", "total_carbs"];
  return nutrients.filter((n) => mainKeys.includes(n.nutrientKey));
};

// --- AddRecipeForm Component ---
export default function AddRecipeForm({
  fetchRecipes,
}: {
  fetchRecipes: () => void;
}) {
  // ✨ Get demo-aware fetch function
  const { customFetch } = useApiClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [servings, setServings] = useState<number>(1);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    {
      ingredient_id: "",
      ingredient_name: "",
      quantity: "",
      unit: "",
      isSelected: false,
      nutrients: [],
      units: [],
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Utility Functions ---

  const createNewIngredientRow = (): IngredientRow => ({
    ingredient_id: "",
    ingredient_name: "",
    quantity: "",
    unit: "",
    isSelected: false,
    nutrients: [],
    units: [],
  });

  const addIngredient = () => {
    setIngredients([...ingredients, createNewIngredientRow()]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const resetForm = () => {
    setName("");
    setServings(1);
    setIngredients([createNewIngredientRow()]);
    setIsSubmitting(false);
  };

  const openModal = () => setIsModalOpen(true);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, []);

  const searchIngredients = async (query: string, index: number) => {
    if (!query || query.length < 2) {
      setIngredients((prev) =>
        prev.map((ing, i) =>
          i === index ? { ...ing, searchResults: [] } : ing,
        ),
      );
      return;
    }

    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, isSearching: true } : ing)),
    );

    try {
      // ✨ CLEAN: Use API client instead of manual fetch
      const results = await ingredientsApi.getAll(customFetch);

      // Filter results by query (client-side search for now)
      const filteredResults = results.filter(
        (ing) =>
          ing.name.toLowerCase().includes(query.toLowerCase()) ||
          ing.brand?.toLowerCase().includes(query.toLowerCase()),
      );

      setIngredients((prev) =>
        prev.map((ing, i) =>
          i === index
            ? { ...ing, searchResults: filteredResults, isSearching: false }
            : ing,
        ),
      );
    } catch (error) {
      console.error("Search error:", error);
      setIngredients((prev) =>
        prev.map((ing, i) =>
          i === index ? { ...ing, isSearching: false, searchResults: [] } : ing,
        ),
      );
    }
  };

  const selectIngredient = (index: number, ingredient: Ingredient) => {
    // Find the default unit
    const primaryUnit = ingredient.units.find((u) => u.isDefault);

    const defaultUnitName =
      primaryUnit?.unitName || // 1. Use the explicit default unit
      ingredient.servingUnit || // 2. Fallback to the 'serving_unit' field
      ingredient.units[0]?.unitName || // 3. Fallback to the first unit
      ""; // 4. Fallback to empty string

    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === index
          ? {
              ...ing,
              ingredient_id: ingredient.id,
              ingredient_name: ingredient.name,
              unit: defaultUnitName,
              searchResults: [],
              isSearching: false,
              isSelected: true,
              selectedIngredient: ingredient,
            }
          : ing,
      ),
    );
  };

  const deselectIngredient = (index: number) => {
    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === index
          ? {
              ...ing,
              ingredient_id: "",
              ingredient_name: ing.selectedIngredient?.name || "",
              quantity: "",
              unit: "",
              isSelected: false,
              selectedIngredient: undefined,
              searchResults: [],
            }
          : ing,
      ),
    );
  };

  const handleInputChange = (
    index: number,
    field: keyof IngredientRow,
    value: string | number,
  ) => {
    setIngredients((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  // --- Submission Logic ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out rows without a selected ingredient or quantity
      const ingredientsToSend = ingredients
        .filter((ing) => ing.ingredient_id && ing.quantity && ing.unit)
        .map(({ ingredient_id, quantity, unit }) => ({
          ingredient_id,
          quantity: parseFloat(quantity),
          unit: unit.trim(),
        }));

      if (ingredientsToSend.length === 0) {
        alert("Please select and enter quantity for at least one ingredient.");
        return;
      }

      // ✨ CLEAN: Use API client instead of manual fetch
      await recipesApi.create(
        {
          name,
          servings: Number(servings),
          ingredients: ingredientsToSend,
        },
        customFetch,
      );

      // Success!
      alert("Recipe created successfully! 🎉");
      fetchRecipes();
      closeModal();
    } catch (error) {
      // ✨ CLEAN: Type-safe error handling
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "An unexpected error occurred during submission.";

      console.error("Error creating recipe:", error);
      alert(`Failed to create recipe: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Modal Control Effects ---

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen, closeModal]);

  // --- Render Logic ---

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={openModal}
        className="cursor-pointer bg-[#3A8F9E] hover:bg-[#337E8D] text-white py-2 px-4 rounded-md font-semibold transition-colors duration-200 shadow-md flex items-center gap-2"
      >
        Add New Recipe
      </button>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50  flex items-center justify-center p-4 z-50 transition-opacity duration-300"
          onClick={handleBackdropClick}
        >
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 p-6 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 transform scale-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 flex-shrink-0">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Create New Recipe
              </h1>
              <button
                onClick={closeModal}
                className="cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700"
                disabled={isSubmitting}
                aria-label="Close modal"
              >
                <LuX size={24} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 pt-6 overflow-y-auto"
            >
              {/* --- 1. Recipe Info --- */}
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#3A8F9E] dark:text-[#C9E6EA] border-b border-zinc-200 dark:border-zinc-700 pb-1 text-left">
                  Recipe Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recipe Name */}
                  <div>
                    <label
                      htmlFor="recipe-name"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 text-left"
                    >
                      Recipe Name *
                    </label>
                    <input
                      id="recipe-name"
                      type="text"
                      placeholder="e.g., Chicken Alfredo Pasta"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-[#3A8F9E] focus:border-[#3A8F9E] dark:bg-zinc-700 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Servings */}
                  <div>
                    <label
                      htmlFor="servings"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 text-left"
                    >
                      Number of Servings *
                    </label>
                    <input
                      id="servings"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="4"
                      value={servings}
                      onChange={(e) => setServings(e.target.valueAsNumber)}
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-[#3A8F9E] focus:border-[#3A8F9E] dark:bg-zinc-700 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </section>

              {/* --- 2. Ingredients Section --- */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#3A8F9E] dark:text-[#C9E6EA] pb-1">
                    Ingredients List
                  </h2>
                  <button
                    type="button"
                    onClick={addIngredient}
                    disabled={isSubmitting}
                    className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm bg-[#3A8F9E] hover:bg-[#337E8D] text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LuPlus size={16} />
                    Add Item
                  </button>
                </div>

                {/* Ingredient Rows */}
                <div className="space-y-3">
                  {ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200
                        ${
                          ing.isSelected
                            ? "bg-[#C9E6EA]/20 dark:bg-[#3A8F9E]/20 border-[#C9E6EA] dark:border-[#3A8F9E]"
                            : "bg-zinc-50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700"
                        }
                      `}
                    >
                      {/* --- Quantity Input (Narrow) --- */}
                      <div className="w-1/6 min-w-[70px]">
                        <label className="sr-only">Quantity</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="1"
                          value={ing.quantity}
                          onChange={(e) =>
                            handleInputChange(idx, "quantity", e.target.value)
                          }
                          className="bg-white text-left w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-1 focus:ring-[#3A8F9E] dark:bg-zinc-700 dark:text-white transition-colors text-sm"
                          required={ing.isSelected}
                          disabled={isSubmitting || !ing.isSelected}
                        />
                      </div>

                      {/* --- Unit Input (Narrow) --- */}
                      <div className="w-1/6 min-w-[60px]">
                        <label className="sr-only">Unit</label>
                        {ing.isSelected && ing.selectedIngredient ? (
                          <select
                            value={ing.unit}
                            onChange={(e) =>
                              handleInputChange(idx, "unit", e.target.value)
                            }
                            className="bg-white w-full px-3 py-2 text-left border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-1 focus:ring-[#3A8F9E] dark:bg-zinc-700 dark:text-white transition-colors text-sm appearance-none"
                            required
                            disabled={isSubmitting}
                          >
                            {/* Map through the available units */}
                            {ing.selectedIngredient.units.map((unit) => (
                              <option key={unit.id} value={unit.unitName}>
                                {unit.unitName}
                              </option>
                            ))}
                            {/* Fallback option for servingUnit if not in units list */}
                            {ing.selectedIngredient.servingUnit &&
                              !ing.selectedIngredient.units.some(
                                (u) =>
                                  u.unitName ===
                                  ing.selectedIngredient!.servingUnit,
                              ) && (
                                <option
                                  value={ing.selectedIngredient.servingUnit}
                                >
                                  {ing.selectedIngredient.servingUnit}
                                </option>
                              )}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="Unit"
                            value=""
                            className="w-full px-3 py-2 text-left border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-1 focus:ring-[#3A8F9E] dark:bg-zinc-700 dark:text-white transition-colors text-sm"
                            disabled
                          />
                        )}
                      </div>

                      {/* --- Ingredient Name (Search/Selected Tag) (Wide) --- */}
                      <div className="flex-1 relative">
                        {ing.isSelected ? (
                          // Selected Tag Display
                          <div className="flex items-center justify-between px-3 py-2 bg-[#C9E6EA]/50 dark:bg-[#3A8F9E]/30 rounded-lg border border-[#3A8F9E]/40 dark:border-[#3A8F9E] text-sm font-semibold text-[#3A8F9E] dark:text-white transition-colors">
                            <span className="truncate">
                              {ing.selectedIngredient?.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => deselectIngredient(idx)}
                              disabled={isSubmitting}
                              className="cursor-pointer ml-2 text-[#3A8F9E] hover:text-[#3A8F9E] dark:text-[#C9E6EA] dark:hover:text-[#C9E6EA] p-0.5 rounded-full hover:bg-[#C9E6EA]/50 dark:hover:bg-[#3A8F9E]/50 transition-colors"
                            >
                              <LuX size={14} />
                            </button>
                          </div>
                        ) : (
                          // Search Input Field
                          <>
                            <input
                              type="text"
                              placeholder="Search or type ingredient name..."
                              value={ing.ingredient_name}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleInputChange(idx, "ingredient_name", val);
                                searchIngredients(val, idx);
                              }}
                              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-[#3A8F9E] dark:bg-zinc-700 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors text-sm pr-10"
                              disabled={isSubmitting}
                              required={!ing.isSelected}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                              {ing.isSearching ? (
                                <LuLoader
                                  size={16}
                                  className="animate-spin text-[#3A8F9E]"
                                />
                              ) : (
                                <LuSearch size={16} />
                              )}
                            </div>
                          </>
                        )}

                        {/* Search results dropdown */}
                        {!ing.isSelected &&
                          ing.searchResults &&
                          ing.searchResults.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg shadow-xl max-h-60 overflow-y-auto ring-1 ring-black/5">
                              {ing.searchResults.map((res) => (
                                <li
                                  key={res.id}
                                  className="text-left px-4 py-2 cursor-pointer hover:bg-[#C9E6EA]/30 dark:hover:bg-[#3A8F9E]/10 transition-colors border-b dark:border-zinc-600 last:border-b-0"
                                  onClick={() =>
                                    !isSubmitting && selectIngredient(idx, res)
                                  }
                                >
                                  <div className="font-semibold text-zinc-900 dark:text-white leading-tight">
                                    {res.name}
                                  </div>
                                  {res.brand || res.servingUnit || res.units ? (
                                    <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                                      {res.brand && (
                                        <span className="border-r-1 pr-1 mr-1 border-r-zinc-600 dark:border-r-zinc-400">
                                          {res.brand}
                                        </span>
                                      )}
                                      {(res.servingUnit || res.units) && (
                                        <span className="font-mono text-xs text-[#3A8F9E] dark:text-[#C9E6EA]">
                                          {
                                            res.units.find((u) => u.isDefault)
                                              ?.amount
                                          }{" "}
                                          {
                                            res.units.find((u) => u.isDefault)
                                              ?.unitName
                                          }
                                        </span>
                                      )}
                                    </div>
                                  ) : null}
                                  {getMainNutrients(res.nutrients).length >
                                    0 && (
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex flex-wrap gap-2">
                                      {getMainNutrients(res.nutrients).map(
                                        (n) => (
                                          <span key={n.id}>
                                            {
                                              ALL_NUTRIENTS_DICT[n.nutrientKey]
                                                ?.display_name
                                            }
                                            : {n.amount}
                                            {n.unit}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>

                      {/* --- Remove Button --- */}
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(idx)}
                          disabled={isSubmitting}
                          className="cursor-pointer p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          aria-label={`Remove ingredient ${idx + 1}`}
                        >
                          <LuTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* --- Form Actions --- */}
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="cursor-pointer px-6 py-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer px-8 py-2.5 bg-[#3A8F9E] hover:bg-[#337E8D] text-white rounded-xl font-bold transition-colors shadow-md shadow-[#3A8F9E]/30 dark:shadow-[#3A8F9E]/20 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <LuLoader size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Recipe"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
