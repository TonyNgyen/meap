// src/store/demo-mock-data.ts
import type {
  Ingredient,
  IngredientNutrient,
  IngredientUnit,
  Recipe,
  RecipeIngredient,
  RecipeNutrient,
  InventoryItem,
  FoodLog,
  FoodLogNutrient,
  Goal,
  NutrientDefinition,
} from "@/types";

const DEMO_USER_ID = "demo-user-123";
const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();

// Nutrient Definitions
export const mockNutrientDefinitions: NutrientDefinition[] = [
  { key: "calories", display_name: "Calories", unit: "cal", user_id: null },
  { key: "protein", display_name: "Protein", unit: "g", user_id: null },
  { key: "total_carbs", display_name: "Total Carbs", unit: "g", user_id: null },
  { key: "total_fat", display_name: "Total Fat", unit: "g", user_id: null },
  {
    key: "dietary_fiber",
    display_name: "Dietary Fiber",
    unit: "g",
    user_id: null,
  },
  { key: "sugars", display_name: "Sugars", unit: "g", user_id: null },
  { key: "sodium", display_name: "Sodium", unit: "mg", user_id: null },
  {
    key: "saturated_fat",
    display_name: "Saturated Fat",
    unit: "g",
    user_id: null,
  },
];

// Ingredients
export const mockIngredients: Ingredient[] = [
  {
    id: "ing-1",
    user_id: DEMO_USER_ID,
    name: "Chicken Breast",
    brand: "Organic Valley",
    servings_per_container: 4,
    created_at: yesterday,
    is_verified: true,
    verified_by: null,
    verified_at: null,
    parent_ingredient_id: null,
  },
  {
    id: "ing-2",
    user_id: DEMO_USER_ID,
    name: "White Rice",
    brand: null,
    servings_per_container: null,
    created_at: yesterday,
    is_verified: true,
    verified_by: null,
    verified_at: null,
    parent_ingredient_id: null,
  },
  {
    id: "ing-3",
    user_id: DEMO_USER_ID,
    name: "Broccoli",
    brand: null,
    servings_per_container: null,
    created_at: yesterday,
    is_verified: true,
    verified_by: null,
    verified_at: null,
    parent_ingredient_id: null,
  },
  {
    id: "ing-4",
    user_id: DEMO_USER_ID,
    name: "Olive Oil",
    brand: "Bertolli",
    servings_per_container: 32,
    created_at: yesterday,
    is_verified: true,
    verified_by: null,
    verified_at: null,
    parent_ingredient_id: null,
  },
  {
    id: "ing-5",
    user_id: DEMO_USER_ID,
    name: "Eggs",
    brand: "Happy Egg Co",
    servings_per_container: 12,
    created_at: yesterday,
    is_verified: true,
    verified_by: null,
    verified_at: null,
    parent_ingredient_id: null,
  },
];

// Ingredient Nutrients (per 1 serving as defined in ingredient_units)
export const mockIngredientNutrients: IngredientNutrient[] = [
  // Chicken Breast (per 112g serving)
  {
    id: "in-1",
    ingredient_id: "ing-1",
    nutrient_key: "calories",
    unit: "cal",
    amount: 165,
    created_at: yesterday,
  },
  {
    id: "in-2",
    ingredient_id: "ing-1",
    nutrient_key: "protein",
    unit: "g",
    amount: 31,
    created_at: yesterday,
  },
  {
    id: "in-3",
    ingredient_id: "ing-1",
    nutrient_key: "total_carbs",
    unit: "g",
    amount: 0,
    created_at: yesterday,
  },
  {
    id: "in-4",
    ingredient_id: "ing-1",
    nutrient_key: "total_fat",
    unit: "g",
    amount: 3.6,
    created_at: yesterday,
  },

  // White Rice (per 45g dry serving)
  {
    id: "in-5",
    ingredient_id: "ing-2",
    nutrient_key: "calories",
    unit: "cal",
    amount: 160,
    created_at: yesterday,
  },
  {
    id: "in-6",
    ingredient_id: "ing-2",
    nutrient_key: "protein",
    unit: "g",
    amount: 3,
    created_at: yesterday,
  },
  {
    id: "in-7",
    ingredient_id: "ing-2",
    nutrient_key: "total_carbs",
    unit: "g",
    amount: 36,
    created_at: yesterday,
  },
  {
    id: "in-8",
    ingredient_id: "ing-2",
    nutrient_key: "total_fat",
    unit: "g",
    amount: 0.3,
    created_at: yesterday,
  },
  {
    id: "in-9",
    ingredient_id: "ing-2",
    nutrient_key: "dietary_fiber",
    unit: "g",
    amount: 0.6,
    created_at: yesterday,
  },

  // Broccoli (per 91g serving)
  {
    id: "in-10",
    ingredient_id: "ing-3",
    nutrient_key: "calories",
    unit: "cal",
    amount: 31,
    created_at: yesterday,
  },
  {
    id: "in-11",
    ingredient_id: "ing-3",
    nutrient_key: "protein",
    unit: "g",
    amount: 2.5,
    created_at: yesterday,
  },
  {
    id: "in-12",
    ingredient_id: "ing-3",
    nutrient_key: "total_carbs",
    unit: "g",
    amount: 6,
    created_at: yesterday,
  },
  {
    id: "in-13",
    ingredient_id: "ing-3",
    nutrient_key: "dietary_fiber",
    unit: "g",
    amount: 2.4,
    created_at: yesterday,
  },
  {
    id: "in-14",
    ingredient_id: "ing-3",
    nutrient_key: "total_fat",
    unit: "g",
    amount: 0.3,
    created_at: yesterday,
  },

  // Olive Oil (per 14g / 1 tbsp serving)
  {
    id: "in-15",
    ingredient_id: "ing-4",
    nutrient_key: "calories",
    unit: "cal",
    amount: 119,
    created_at: yesterday,
  },
  {
    id: "in-16",
    ingredient_id: "ing-4",
    nutrient_key: "total_fat",
    unit: "g",
    amount: 13.5,
    created_at: yesterday,
  },
  {
    id: "in-17",
    ingredient_id: "ing-4",
    nutrient_key: "protein",
    unit: "g",
    amount: 0,
    created_at: yesterday,
  },
  {
    id: "in-18",
    ingredient_id: "ing-4",
    nutrient_key: "total_carbs",
    unit: "g",
    amount: 0,
    created_at: yesterday,
  },

  // Eggs (per 50g / 1 large egg)
  {
    id: "in-19",
    ingredient_id: "ing-5",
    nutrient_key: "calories",
    unit: "cal",
    amount: 72,
    created_at: yesterday,
  },
  {
    id: "in-20",
    ingredient_id: "ing-5",
    nutrient_key: "protein",
    unit: "g",
    amount: 6,
    created_at: yesterday,
  },
  {
    id: "in-21",
    ingredient_id: "ing-5",
    nutrient_key: "total_fat",
    unit: "g",
    amount: 5,
    created_at: yesterday,
  },
  {
    id: "in-22",
    ingredient_id: "ing-5",
    nutrient_key: "total_carbs",
    unit: "g",
    amount: 0.6,
    created_at: yesterday,
  },
];

// Ingredient Units
// IMPORTANT: amount = how much of this unit equals 1 serving
// Example: If 1 serving = 45g, and 1 cup = 185g, then amount = 45/185 = 0.243 cups
export const mockIngredientUnits: IngredientUnit[] = [
  // Chicken Breast - 1 serving = 112g
  {
    id: "iu-1",
    ingredient_id: "ing-1",
    unit_name: "g",
    amount: 112,
    is_default: true,
    created_by: DEMO_USER_ID,
    created_at: yesterday,
  },
  {
    id: "iu-2",
    ingredient_id: "ing-1",
    unit_name: "oz",
    amount: 112 / 28.35,
    is_default: false,
    created_by: DEMO_USER_ID,
    created_at: yesterday,
  }, // 1 serving = ~3.95 oz

  // White Rice - 1 serving = 45g dry
  {
    id: "iu-3",
    ingredient_id: "ing-2",
    unit_name: "g",
    amount: 45,
    is_default: true,
    created_by: DEMO_USER_ID,
    created_at: yesterday,
  },
  {
    id: "iu-4",
    ingredient_id: "ing-2",
    unit_name: "cup",
    amount: 45 / 185,
    is_default: false,
    created_by: DEMO_USER_ID,
    created_at: yesterday,
  }, // 1 serving = 0.243 cups

  // Broccoli - 1 serving = 91g
  {
    id: "iu-5",
    ingredient_id: "ing-3",
    unit_name: "g",
    amount: 91,
    is_default: true,
    created_by: DEMO_USER_ID,
    created_at: yesterday,
  },
  {
    id: "iu-6",
    ingredient_id: "ing-3",
    unit_name: "cup",
    amount: 1,
    is_default: false,
    created_by: DEMO_USER_ID,
    created_at: yesterday,
  }, // 1 serving = 1 cup

  // Olive Oil - 1 serving = 14g (1 tbsp)
  {
    id: "iu-7",
    ingredient_id: "ing-4",
    unit_name: "g",
    amount: 14,
    is_default: false,
    created_by: DEMO_USER_ID,
    created_at: yesterday,
  },
  {
    id: "iu-8",
    ingredient_id: "ing-4",
    unit_name: "tbsp",
    amount: 1,
    is_default: true,
    created_by: DEMO_USER_ID,
    created_at: yesterday,
  }, // 1 serving = 1 tbsp
  {
    id: "iu-9",
    ingredient_id: "ing-4",
    unit_name: "ml",
    amount: 14 / 14.79,
    is_default: false,
    created_by: DEMO_USER_ID,
    created_at: yesterday,
  }, // 1 serving = ~0.95 ml

  // Eggs - 1 serving = 50g (1 large egg)
  {
    id: "iu-10",
    ingredient_id: "ing-5",
    unit_name: "g",
    amount: 50,
    is_default: false,
    created_by: DEMO_USER_ID,
    created_at: yesterday,
  },
  {
    id: "iu-11",
    ingredient_id: "ing-5",
    unit_name: "piece",
    amount: 1,
    is_default: true,
    created_by: DEMO_USER_ID,
    created_at: yesterday,
  }, // 1 serving = 1 egg
];

// Recipes
export const mockRecipes: Recipe[] = [
  {
    id: "rec-1",
    user_id: DEMO_USER_ID,
    name: "Chicken & Rice Bowl",
    description: "Simple meal prep staple with chicken, rice, and broccoli",
    servings: 4,
    created_at: yesterday,
    updated_at: yesterday,
  },
  {
    id: "rec-2",
    user_id: DEMO_USER_ID,
    name: "Scrambled Eggs",
    description: "Quick breakfast with eggs and olive oil",
    servings: 1,
    created_at: yesterday,
    updated_at: yesterday,
  },
];

// Recipe Ingredients (quantities in grams for precision)
export const mockRecipeIngredients: RecipeIngredient[] = [
  // Chicken & Rice Bowl (4 servings total)
  {
    id: "ri-1",
    recipe_id: "rec-1",
    ingredient_id: "ing-1",
    quantity: 4,
    unit: "servings",
    created_at: yesterday,
  }, // 4 servings chicken = 448g
  {
    id: "ri-2",
    recipe_id: "rec-1",
    ingredient_id: "ing-2",
    quantity: 4,
    unit: "servings",
    created_at: yesterday,
  }, // 4 servings rice = 180g dry
  {
    id: "ri-3",
    recipe_id: "rec-1",
    ingredient_id: "ing-3",
    quantity: 4,
    unit: "servings",
    created_at: yesterday,
  }, // 4 servings broccoli = 364g
  {
    id: "ri-4",
    recipe_id: "rec-1",
    ingredient_id: "ing-4",
    quantity: 2,
    unit: "servings",
    created_at: yesterday,
  }, // 2 tbsp oil

  // Scrambled Eggs (1 serving)
  {
    id: "ri-5",
    recipe_id: "rec-2",
    ingredient_id: "ing-5",
    quantity: 2,
    unit: "servings",
    created_at: yesterday,
  }, // 2 eggs
  {
    id: "ri-6",
    recipe_id: "rec-2",
    ingredient_id: "ing-4",
    quantity: 0.5,
    unit: "servings",
    created_at: yesterday,
  }, // 0.5 tbsp oil
];

// Recipe Nutrients (total for entire recipe)
// Calculated based on recipe ingredients
export const mockRecipeNutrients: RecipeNutrient[] = [
  // Chicken & Rice Bowl (total for 4 servings)
  // 4×165 + 4×160 + 4×31 + 2×119 = 1660 calories
  {
    recipe_id: "rec-1",
    nutrient_key: "calories",
    unit: "cal",
    total_amount: 1660,
  },
  { recipe_id: "rec-1", nutrient_key: "protein", unit: "g", total_amount: 146 }, // 4×31 + 4×3 + 4×2.5
  {
    recipe_id: "rec-1",
    nutrient_key: "total_carbs",
    unit: "g",
    total_amount: 168,
  }, // 4×36 + 4×6
  {
    recipe_id: "rec-1",
    nutrient_key: "total_fat",
    unit: "g",
    total_amount: 42.6,
  }, // 4×3.6 + 4×0.3 + 4×0.3 + 2×13.5
  {
    recipe_id: "rec-1",
    nutrient_key: "dietary_fiber",
    unit: "g",
    total_amount: 12,
  }, // 4×0.6 + 4×2.4

  // Scrambled Eggs (total for 1 serving)
  // 2×72 + 0.5×119 = 203.5 calories
  {
    recipe_id: "rec-2",
    nutrient_key: "calories",
    unit: "cal",
    total_amount: 203.5,
  },
  { recipe_id: "rec-2", nutrient_key: "protein", unit: "g", total_amount: 12 }, // 2×6
  {
    recipe_id: "rec-2",
    nutrient_key: "total_fat",
    unit: "g",
    total_amount: 16.75,
  }, // 2×5 + 0.5×13.5
  {
    recipe_id: "rec-2",
    nutrient_key: "total_carbs",
    unit: "g",
    total_amount: 1.2,
  }, // 2×0.6
];

// Inventory
export const mockInventory: InventoryItem[] = [
  {
    id: "inv-1",
    user_id: DEMO_USER_ID,
    ingredient_id: "ing-1",
    recipe_id: null,
    quantity: 8,
    unit: "servings",
    created_at: yesterday,
    updated_at: yesterday,
  },
  {
    id: "inv-2",
    user_id: DEMO_USER_ID,
    ingredient_id: "ing-2",
    recipe_id: null,
    quantity: 10,
    unit: "servings",
    created_at: yesterday,
    updated_at: yesterday,
  },
  {
    id: "inv-3",
    user_id: DEMO_USER_ID,
    ingredient_id: "ing-3",
    recipe_id: null,
    quantity: 5,
    unit: "servings",
    created_at: yesterday,
    updated_at: yesterday,
  },
  {
    id: "inv-4",
    user_id: DEMO_USER_ID,
    ingredient_id: "ing-4",
    recipe_id: null,
    quantity: 14,
    unit: "servings",
    created_at: yesterday,
    updated_at: yesterday,
  },
  {
    id: "inv-5",
    user_id: DEMO_USER_ID,
    ingredient_id: "ing-5",
    recipe_id: null,
    quantity: 12,
    unit: "servings",
    created_at: yesterday,
    updated_at: yesterday,
  },
  {
    id: "inv-6",
    user_id: DEMO_USER_ID,
    ingredient_id: null,
    recipe_id: "rec-1",
    quantity: 2,
    unit: "servings",
    created_at: yesterday,
    updated_at: yesterday,
  },
];

// Food Logs (some from today)
const todayStart = new Date();
todayStart.setHours(8, 30, 0, 0);
const todayLunch = new Date();
todayLunch.setHours(12, 45, 0, 0);

export const mockFoodLogs: FoodLog[] = [
  // Today's logs
  {
    id: "fl-1",
    user_id: DEMO_USER_ID,
    ingredient_id: null,
    recipe_id: "rec-2",
    quantity: 1,
    unit: "servings",
    log_datetime: todayStart.toISOString(),
    meal_type: "breakfast",
    created_at: now,
  },
  {
    id: "fl-2",
    user_id: DEMO_USER_ID,
    ingredient_id: null,
    recipe_id: "rec-1",
    quantity: 1,
    unit: "servings",
    log_datetime: todayLunch.toISOString(),
    meal_type: "lunch",
    created_at: now,
  },
];

// Food Log Nutrients
export const mockFoodLogNutrients: FoodLogNutrient[] = [
  // Scrambled Eggs (fl-1) - 1 serving
  {
    id: "fln-1",
    food_log_id: "fl-1",
    nutrient_key: "calories",
    amount: 203.5,
    unit: "cal",
  },
  {
    id: "fln-2",
    food_log_id: "fl-1",
    nutrient_key: "protein",
    amount: 12,
    unit: "g",
  },
  {
    id: "fln-3",
    food_log_id: "fl-1",
    nutrient_key: "total_fat",
    amount: 16.75,
    unit: "g",
  },
  {
    id: "fln-4",
    food_log_id: "fl-1",
    nutrient_key: "total_carbs",
    amount: 1.2,
    unit: "g",
  },

  // Chicken & Rice Bowl (fl-2) - 1 serving = 1/4 of recipe
  {
    id: "fln-5",
    food_log_id: "fl-2",
    nutrient_key: "calories",
    amount: 415,
    unit: "cal",
  },
  {
    id: "fln-6",
    food_log_id: "fl-2",
    nutrient_key: "protein",
    amount: 36.5,
    unit: "g",
  },
  {
    id: "fln-7",
    food_log_id: "fl-2",
    nutrient_key: "total_carbs",
    amount: 42,
    unit: "g",
  },
  {
    id: "fln-8",
    food_log_id: "fl-2",
    nutrient_key: "total_fat",
    amount: 10.65,
    unit: "g",
  },
  {
    id: "fln-9",
    food_log_id: "fl-2",
    nutrient_key: "dietary_fiber",
    amount: 3,
    unit: "g",
  },
];

// Goals
export const mockGoals: Goal[] = [
  {
    id: "goal-1",
    user_id: DEMO_USER_ID,
    nutrient_key: "calories",
    target_amount: 2000,
    created_at: yesterday,
    updated_at: yesterday,
  },
  {
    id: "goal-2",
    user_id: DEMO_USER_ID,
    nutrient_key: "protein",
    target_amount: 150,
    created_at: yesterday,
    updated_at: yesterday,
  },
  {
    id: "goal-3",
    user_id: DEMO_USER_ID,
    nutrient_key: "total_carbs",
    target_amount: 200,
    created_at: yesterday,
    updated_at: yesterday,
  },
  {
    id: "goal-4",
    user_id: DEMO_USER_ID,
    nutrient_key: "total_fat",
    target_amount: 65,
    created_at: yesterday,
    updated_at: yesterday,
  },
];

// Export everything as initial state
export const DEMO_MOCK_DATA = {
  ingredients: mockIngredients,
  ingredientNutrients: mockIngredientNutrients,
  ingredientUnits: mockIngredientUnits,
  recipes: mockRecipes,
  recipeIngredients: mockRecipeIngredients,
  recipeNutrients: mockRecipeNutrients,
  inventory: mockInventory,
  foodLogs: mockFoodLogs,
  foodLogNutrients: mockFoodLogNutrients,
  goals: mockGoals,
  nutrientDefinitions: mockNutrientDefinitions,
};
