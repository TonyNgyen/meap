/**
 * Type definitions for Recipes API
 * Uses existing Supabase types + adds clean UI types
 */

import { Database } from '@/types/database.types';

// ============================================================================
// DATABASE TYPES (from Supabase auto-generated types)
// ============================================================================

// Base table types from Supabase
type DbRecipeRow = Database['public']['Tables']['recipes']['Row'];
type DbRecipeIngredientRow = Database['public']['Tables']['recipe_ingredients']['Row'];
type DbRecipeNutrientRow = Database['public']['Tables']['recipe_nutrients']['Row'];

// Enriched types (what the API returns after joins)
export interface DbIngredient {
    id: string;
    name: string;
    brand: string | null;
    units?: Array<{
        id: string;
        unit_name: string;
        amount: number;
        is_default: boolean | null;
    }>;
}

export interface DbRecipeIngredient {
    quantity: number;
    unit: string;
    ingredient: DbIngredient;
}

export interface DbRecipeNutrient {
    nutrient_key: string;
    total_amount: number;
    unit: string;
}

export interface DbRecipe {
    id: string;
    name: string;
    servings: number;
    created_at: string;
    recipe_ingredients: DbRecipeIngredient[];
    recipe_nutrients: DbRecipeNutrient[];
}

// ============================================================================
// CLEAN UI TYPES (what components use)
// ============================================================================

export interface Ingredient {
    id: string;
    name: string;
    brand?: string;
    units?: Array<{
        id: string;
        unitName: string;
        amount: number;
        isDefault: boolean;
    }>;
}

export interface RecipeIngredient {
    quantity: number;
    unit: string;
    ingredient: Ingredient;
}

export interface RecipeNutrient {
    nutrientKey: string;
    displayName?: string;
    totalAmount: number;
    unit: string;
}

export interface Recipe {
    id: string;
    name: string;
    servings: number;
    createdAt: string;
    recipeIngredients: RecipeIngredient[];
    recipeNutrients: RecipeNutrient[];
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateRecipeIngredient {
    ingredient_id: string;
    quantity: number;
    unit: string;
}

export interface CreateRecipeRequest {
    name: string;
    servings: number;
    ingredients: CreateRecipeIngredient[];
}

export interface GetRecipesResponse {
    success: boolean;
    recipes: DbRecipe[];
}

export interface CreateRecipeResponse {
    success: boolean;
    recipeId: string;
}

export interface SearchRecipesResponse {
    success: boolean;
    results: Array<{
        id: string;
        name: string;
        servings: number | null;
        created_at: string | null;
    }>;
}

export interface GetRecipeNutrientsResponse {
    success: boolean;
    nutrients: DbRecipeNutrient[];
}