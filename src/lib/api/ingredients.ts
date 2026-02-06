/**
 * Ingredients API Client
 * Handles all ingredient-related API calls with type safety and error handling
 */

import { apiRequest, FetchFunction } from './client';
import {
    Ingredient,
    DbIngredient,
    DbNutrient,
    Nutrient,
    Unit,
    DbUnit,
    CreateIngredientRequest,
    CreateIngredientResponse,
    GetIngredientsResponse,
} from './types/ingredients';

// ============================================================================
// TYPE CONVERTERS (Database → UI)
// ============================================================================

/**
 * Convert database nutrient to clean UI nutrient
 * Adds display_name from enriched data
 */
function toNutrient(dbNutrient: DbNutrient & { display_name?: string }): Nutrient {
    return {
        id: dbNutrient.id,
        nutrientKey: dbNutrient.nutrient_key,
        displayName: dbNutrient.display_name || dbNutrient.nutrient_key,
        unit: dbNutrient.unit,
        amount: dbNutrient.amount,
    };
}

/**
 * Convert database unit to clean UI unit
 */
function toUnit(dbUnit: DbUnit): Unit {
    return {
        id: dbUnit.id,
        unitName: dbUnit.unit_name,
        isDefault: dbUnit.is_default ?? false,
        amount: dbUnit.amount,
    };
}

/**
 * Convert database ingredient to clean UI ingredient
 * This is the SINGLE place where snake_case → camelCase conversion happens
 * Also converts null → undefined for optional fields
 */
function toIngredient(dbIngredient: DbIngredient): Ingredient {
    return {
        id: dbIngredient.id,
        name: dbIngredient.name,
        brand: dbIngredient.brand ?? undefined,
        servingsPerContainer: dbIngredient.servings_per_container ?? undefined,
        nutrients: dbIngredient.nutrients.map(toNutrient),
        units: dbIngredient.units.map(toUnit),
    };
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Ingredients API client
 * 
 * Usage:
 *   // Production mode
 *   const ingredients = await ingredientsApi.getAll();
 * 
 *   // Demo mode
 *   const { fetch: customFetch } = useFetch();
 *   const ingredients = await ingredientsApi.getAll(customFetch);
 */
export const ingredientsApi = {
    /**
     * Get all ingredients for the current user
     * Automatically enriched with display names from the API
     * 
     * @param customFetch - Optional custom fetch for demo mode
     */
    async getAll(customFetch?: FetchFunction): Promise<Ingredient[]> {
        const response = await apiRequest<GetIngredientsResponse>(
            '/api/ingredients',
            { method: 'GET' },
            customFetch
        );

        return response.ingredients.map(toIngredient);
    },

    /**
     * Create a new ingredient
     * 
     * @param ingredient - Ingredient data to create
     * @param customFetch - Optional custom fetch for demo mode
     */
    async create(ingredient: CreateIngredientRequest, customFetch?: FetchFunction): Promise<string> {
        const response = await apiRequest<CreateIngredientResponse>(
            '/api/ingredients',
            {
                method: 'POST',
                body: JSON.stringify(ingredient),
            },
            customFetch
        );

        return response.ingredientId;
    },

    /**
     * Update an existing ingredient
     * (Not implemented in API yet, but structure is ready)
     * 
     * @param id - Ingredient ID
     * @param updates - Partial ingredient data to update
     * @param customFetch - Optional custom fetch for demo mode
     */
    async update(id: string, updates: Partial<CreateIngredientRequest>, customFetch?: FetchFunction): Promise<void> {
        await apiRequest(
            `/api/ingredients/${id}`,
            {
                method: 'PATCH',
                body: JSON.stringify(updates),
            },
            customFetch
        );
    },

    /**
     * Delete an ingredient
     * (Not implemented in API yet, but structure is ready)
     * 
     * @param id - Ingredient ID
     * @param customFetch - Optional custom fetch for demo mode
     */
    async delete(id: string, customFetch?: FetchFunction): Promise<void> {
        await apiRequest(
            `/api/ingredients/${id}`,
            { method: 'DELETE' },
            customFetch
        );
    },
};