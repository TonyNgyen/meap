/**
 * API Module Exports
 * Central place to import all API clients
 * 
 * Usage:
 *   import { ingredientsApi, recipesApi, ApiError } from '@/lib/api'
 *   import type { FetchFunction, Ingredient, Recipe } from '@/lib/api'
 */

// Export values (runtime code)
export { apiRequest, ApiError } from './client';
export { ingredientsApi } from './ingredients';
export { recipesApi } from './recipes';

// Export types (compile-time only)
export type { FetchFunction } from './client';

// Export ingredient types
export type {
    Ingredient,
    Nutrient,
    Unit,
    CreateIngredientRequest,
    CreateIngredientNutrient,
    CreateIngredientUnit,
} from './types/ingredients';

// Export recipe types
export type {
    Recipe,
    RecipeIngredient,
    RecipeNutrient,
    CreateRecipeRequest,
    CreateRecipeIngredient,
} from './types/recipes';