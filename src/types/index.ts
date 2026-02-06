// src/types/index.ts
// This file defines clean, domain-specific types for your application
// They are based on the auto-generated database types

import { Row, Insert, Update, WithRelation, WithRequiredRelation } from './utils';

// ============================================
// BASE TYPES (from database)
// ============================================

// Ingredients
export type Ingredient = Row<'ingredients'>;
export type IngredientInsert = Insert<'ingredients'>;
export type IngredientUpdate = Update<'ingredients'>;

export type IngredientNutrient = Row<'ingredient_nutrients'>;
export type IngredientNutrientInsert = Insert<'ingredient_nutrients'>;

export type IngredientUnit = Row<'ingredient_units'>;
export type IngredientUnitInsert = Insert<'ingredient_units'>;

export type IngredientVerification = Row<'ingredient_verifications'>;

// Recipes
export type Recipe = Row<'recipes'>;
export type RecipeInsert = Insert<'recipes'>;
export type RecipeUpdate = Update<'recipes'>;

export type RecipeIngredient = Row<'recipe_ingredients'>;
export type RecipeIngredientInsert = Insert<'recipe_ingredients'>;

export type RecipeNutrient = Row<'recipe_nutrients'>;

// Inventory
export type InventoryItem = Row<'inventories'>;
export type InventoryInsert = Insert<'inventories'>;
export type InventoryUpdate = Update<'inventories'>;

// Food Logs
export type FoodLog = Row<'food_logs'>;
export type FoodLogInsert = Insert<'food_logs'>;

export type FoodLogNutrient = Row<'food_log_nutrients'>;
export type FoodLogNutrientInsert = Insert<'food_log_nutrients'>;

// Goals
export type Goal = Row<'goals'>;
export type GoalInsert = Insert<'goals'>;
export type GoalUpdate = Update<'goals'>;

// Other
export type NutrientDefinition = Row<'nutrient_definitions'>;
export type Profile = Row<'profiles'>;
export type Contact = Row<'contacts'>;

// ============================================
// POPULATED TYPES (with relations)
// ============================================

// Ingredient with its units and nutrients
export type PopulatedIngredient = WithRelation<
  Ingredient,
  'units',
  IngredientUnit[]
> & WithRelation<Ingredient, 'nutrients', IngredientNutrient[]>;

// Inventory item with ingredient or recipe
export type PopulatedInventoryItem = WithRelation<
  InventoryItem,
  'ingredient',
  Ingredient
> & WithRelation<InventoryItem, 'recipe', Recipe>;

// Food log with ingredient/recipe and nutrients
export type PopulatedFoodLog = WithRelation<FoodLog, 'ingredient', Ingredient> &
  WithRelation<FoodLog, 'recipe', Recipe> &
  WithRequiredRelation<
    FoodLog,
    'nutrients',
    Array<{
      nutrient_key: string;
      amount: number;
      unit: string;
    }>
  >;

// Recipe with ingredients and nutrients
export type PopulatedRecipe = WithRequiredRelation<
  Recipe,
  'ingredients',
  Array<
    RecipeIngredient & {
      ingredient: Ingredient;
    }
  >
> & WithRelation<Recipe, 'nutrients', RecipeNutrient[]>;

// ============================================
// FORM TYPES
// ============================================
// Types for form data (no IDs, no timestamps)

export type IngredientFormData = {
  name: string;
  brand: string | null;
  servings_per_container: number | null;
  nutrients: Array<{
    nutrient_key: string;
    unit: string;
    amount: number;
  }>;
  units: Array<{
    unit_name: string;
    amount: number;
    is_default: boolean;
  }>;
};

export type RecipeFormData = {
  name: string;
  description: string | null;
  servings: number;
  ingredients: Array<{
    ingredient_id: string;
    quantity: number;
    unit: string;
  }>;
};

// ============================================
// API RESPONSE TYPES
// ============================================

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}>;

// ============================================
// SEARCH TYPES
// ============================================

export type SearchFilters = {
  query?: string;
  verified?: boolean;
  userId?: string;
};

export type SortOrder = 'asc' | 'desc';

export type SortableField<T> = keyof T;

// ============================================
// RE-EXPORT UTILITIES
// ============================================

export * from './utils';