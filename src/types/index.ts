// src/types/index.ts
// Centralized type definitions for MEAP
// These match your Supabase database schema exactly

export type Ingredient = {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  servings_per_container: number | null;
  created_at: string;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
};

export type IngredientNutrient = {
  id: string;
  ingredient_id: string;
  nutrient_key: string;
  unit: string;
  amount: number;
  created_at: string;
};

export type IngredientUnit = {
  id: string;
  ingredient_id: string;
  unit_name: string;
  amount: number; // grams equivalent for this unit
  is_default: boolean;
  created_by: string;
  created_at: string;
};

export type IngredientVerification = {
  id: string;
  ingredient_id: string;
  submitted_by: string;
  reviewed_by: string | null;
  status: string;
  created_at: string;
  notes: string | null;
};

export type Recipe = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  servings: number;
  created_at: string;
  updated_at: string;
};

export type RecipeIngredient = {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  created_at: string;
};

export type RecipeNutrient = {
  recipe_id: string;
  nutrient_key: string;
  unit: string;
  total_amount: number;
};

export type InventoryItem = {
  id: string;
  user_id: string;
  ingredient_id: string | null;
  recipe_id: string | null;
  quantity: number;
  unit: string;
  created_at: string;
  updated_at: string;
};

export type FoodLog = {
  id: string;
  user_id: string;
  ingredient_id: string | null;
  recipe_id: string | null;
  quantity: number;
  unit: string;
  log_datetime: string;
  meal_type: string | null;
  created_at: string;
};

export type FoodLogNutrient = {
  id: string;
  food_log_id: string;
  nutrient_key: string;
  amount: number;
  unit: string;
};

export type Goal = {
  id: string;
  user_id: string;
  nutrient_key: string;
  target_amount: number;
  created_at: string;
  updated_at: string;
};

export type NutrientDefinition = {
  key: string;
  display_name: string;
  unit: string;
  user_id: string | null;
};

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  category: string;
  message: string;
  resolved_at: string | null;
};

// ============================================
// POPULATED TYPES (for UI display)
// ============================================
// These types represent data after joining tables
// Used when displaying data to users

export type PopulatedInventoryItem = InventoryItem & {
  ingredient?: Ingredient;
  recipe?: Recipe;
};

export type PopulatedFoodLog = FoodLog & {
  ingredient: Ingredient | null;
  recipe: Recipe | null;
  nutrients: Array<{
    nutrient_key: string;
    amount: number;
    unit: string;
  }>;
};

export type PopulatedRecipe = Recipe & {
  ingredients: Array<
    RecipeIngredient & {
      ingredient: Ingredient;
    }
  >;
  nutrients: RecipeNutrient[];
};
