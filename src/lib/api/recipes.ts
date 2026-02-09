/**
 * Recipes API Client
 * Handles all recipe-related API calls with type safety and error handling
 */

import { apiRequest, FetchFunction } from './client';
import {
    Recipe,
    DbRecipe,
    DbRecipeIngredient,
    DbRecipeNutrient,
    RecipeIngredient,
    RecipeNutrient,
    Ingredient,
    CreateRecipeRequest,
    CreateRecipeResponse,
    GetRecipesResponse,
    SearchRecipesResponse,
    GetRecipeNutrientsResponse,
} from './types/recipes';

// ============================================================================
// TYPE CONVERTERS (Database → UI)
// ============================================================================

/**
 * Convert database ingredient to clean UI ingredient
 */
function toIngredient(dbIngredient: DbRecipeIngredient['ingredient']): Ingredient {
    return {
        id: dbIngredient.id,
        name: dbIngredient.name,
        brand: dbIngredient.brand ?? undefined,
        units: dbIngredient.units?.map(unit => ({
            id: unit.id,
            unitName: unit.unit_name,
            amount: unit.amount,
            isDefault: unit.is_default ?? false,
        })),
    };
}

/**
 * Convert database recipe ingredient to clean UI recipe ingredient
 */
function toRecipeIngredient(dbRecipeIngredient: DbRecipeIngredient): RecipeIngredient {
    return {
        quantity: dbRecipeIngredient.quantity,
        unit: dbRecipeIngredient.unit,
        ingredient: toIngredient(dbRecipeIngredient.ingredient),
    };
}

/**
 * Convert database recipe nutrient to clean UI recipe nutrient
 */
function toRecipeNutrient(dbRecipeNutrient: DbRecipeNutrient): RecipeNutrient {
    return {
        nutrientKey: dbRecipeNutrient.nutrient_key,
        totalAmount: dbRecipeNutrient.total_amount,
        unit: dbRecipeNutrient.unit,
    };
}

/**
 * Convert database recipe to clean UI recipe
 * This is the SINGLE place where snake_case → camelCase conversion happens
 * Also converts null → undefined for optional fields
 */
function toRecipe(dbRecipe: DbRecipe): Recipe {
    return {
        id: dbRecipe.id,
        name: dbRecipe.name,
        servings: dbRecipe.servings,
        createdAt: dbRecipe.created_at,
        recipeIngredients: dbRecipe.recipe_ingredients.map(toRecipeIngredient),
        recipeNutrients: dbRecipe.recipe_nutrients.map(toRecipeNutrient),
    };
}

// ============================================================================
// API CLIENT
// ============================================================================

export const recipesApi = {
    /**
     * Get all recipes for the current user
     * Automatically includes ingredients and nutrients
     * 
     * @param customFetch - Optional custom fetch for demo mode
     */
    async getAll(customFetch?: FetchFunction): Promise<Recipe[]> {
        const response = await apiRequest<GetRecipesResponse>(
            '/api/recipes',
            { method: 'GET' },
            customFetch
        );

        return response.recipes.map(toRecipe);
    },

    /**
     * Create a new recipe
     * 
     * @param recipe - Recipe data to create
     * @param customFetch - Optional custom fetch for demo mode
     */
    async create(recipe: CreateRecipeRequest, customFetch?: FetchFunction): Promise<string> {
        const response = await apiRequest<CreateRecipeResponse>(
            '/api/recipes',
            {
                method: 'POST',
                body: JSON.stringify(recipe),
            },
            customFetch
        );

        return response.recipeId;
    },

    /**
     * Search recipes by name
     * 
     * @param query - Search query string
     * @param customFetch - Optional custom fetch for demo mode
     */
    async search(query: string, customFetch?: FetchFunction): Promise<SearchRecipesResponse['results']> {
        const response = await apiRequest<SearchRecipesResponse>(
            `/api/recipes/search?q=${encodeURIComponent(query)}`,
            { method: 'GET' },
            customFetch
        );

        return response.results;
    },

    /**
     * Get nutrients for a specific recipe
     * 
     * @param id - Recipe ID
     * @param customFetch - Optional custom fetch for demo mode
     */
    async getNutrients(id: string, customFetch?: FetchFunction): Promise<RecipeNutrient[]> {
        const response = await apiRequest<GetRecipeNutrientsResponse>(
            `/api/recipes/${id}/nutrients`,
            { method: 'GET' },
            customFetch
        );

        return response.nutrients.map(toRecipeNutrient);
    },

    /**
     * Update an existing recipe
     * (Not implemented in API yet, but structure is ready)
     * 
     * @param id - Recipe ID
     * @param updates - Partial recipe data to update
     * @param customFetch - Optional custom fetch for demo mode
     */
    async update(id: string, updates: Partial<CreateRecipeRequest>, customFetch?: FetchFunction): Promise<void> {
        await apiRequest(
            `/api/recipes/${id}`,
            {
                method: 'PATCH',
                body: JSON.stringify(updates),
            },
            customFetch
        );
    },

    /**
     * Delete a recipe
     * (Not implemented in API yet, but structure is ready)
     * 
     * @param id - Recipe ID
     * @param customFetch - Optional custom fetch for demo mode
     */
    async delete(id: string, customFetch?: FetchFunction): Promise<void> {
        await apiRequest(
            `/api/recipes/${id}`,
            { method: 'DELETE' },
            customFetch
        );
    },
};