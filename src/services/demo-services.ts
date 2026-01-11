// src/services/demo-service.ts
// This file replicates your API/RPC logic for demo mode

import { useDemoStore } from '@/store/demo-store';
import type { PopulatedInventoryItem, PopulatedFoodLog } from '@/types';

// ============================================
// HELPER: Calculate Ingredient Nutrients
// ============================================
// Calculates nutrients for a specific quantity of an ingredient
// Handles unit conversions (servings, grams, cups, etc.)
export function calculateIngredientNutrients(
    ingredientId: string,
    quantity: number,
    unit: string
) {
    const store = useDemoStore.getState();
    const ingredient = store.getIngredientById(ingredientId);
    if (!ingredient) return [];

    const nutrients = store.getIngredientNutrients(ingredientId);
    const units = store.ingredientUnits.filter(u => u.ingredient_id === ingredientId);

    // Get the default unit (1 serving)
    const defaultUnit = units.find(u => u.is_default);
    if (!defaultUnit) {
        console.error('No default unit found for ingredient:', ingredientId);
        return [];
    }

    // Get the unit being used
    const sourceUnit = units.find(u => u.unit_name === unit);
    if (!sourceUnit) {
        console.error('Unit not found:', unit);
        return [];
    }

    // Convert to servings
    // Example: If user logged "2 cups" and 1 serving = 0.243 cups
    //   servings = 2 / 0.243 = 8.23 servings
    const servings = quantity / sourceUnit.amount;

    // Multiply nutrients by servings
    // Example: If protein per serving = 3g, and we have 8.23 servings
    //   total protein = 3 × 8.23 = 24.69g
    return nutrients.map((n) => ({
        nutrient_key: n.nutrient_key,
        amount: n.amount * servings,
        unit: n.unit,
    }));
}

// Helper to calculate nutrients for a recipe serving
export function calculateRecipeNutrients(
    recipeId: string,
    servings: number
) {
    const store = useDemoStore.getState();
    const recipe = store.getRecipeById(recipeId);
    if (!recipe) return [];

    const recipeNutrients = store.getRecipeNutrients(recipeId);

    // Calculate per-serving amounts
    const ratio = servings / recipe.servings;

    return recipeNutrients.map((n) => ({
        nutrient_key: n.nutrient_key,
        amount: n.total_amount * ratio,
        unit: n.unit,
    }));
}

// Demo API: Get Inventory
export async function demoGetInventory(): Promise<{
    success: boolean;
    inventory: PopulatedInventoryItem[];
}> {
    const store = useDemoStore.getState();
    const inventory = store.getInventory();

    const populated: PopulatedInventoryItem[] = inventory.map((item) => ({
        ...item,
        ingredient: item.ingredient_id
            ? store.getIngredientById(item.ingredient_id)
            : undefined,
        recipe: item.recipe_id ? store.getRecipeById(item.recipe_id) : undefined,
    }));

    return { success: true, inventory: populated };
}

// ============================================
// API: Add to Inventory
// ============================================
// Handles both ingredient and recipe additions
// Replicates your RPC function logic
export async function demoAddInventory(payload: {
    ingredient_id?: string | null;
    recipe_id?: string | null;
    quantity: number;
    unit: string;
}): Promise<{ success: boolean; message?: string }> {
    const store = useDemoStore.getState();

    if (payload.recipe_id) {
        // ========================================
        // RECIPE PATH: Add recipe to inventory
        // ========================================
        // 1. Get recipe and its ingredients
        const recipeIngredients = store.getRecipeIngredients(payload.recipe_id);
        const recipe = store.getRecipeById(payload.recipe_id);

        if (!recipe) {
            return { success: false, message: 'Recipe not found' };
        }

        // 2. Calculate how much of each ingredient is needed
        // Example: Recipe makes 4 servings, user wants to make 2 servings
        //   ratio = 2 / 4 = 0.5
        //   If recipe needs 4 servings of chicken, we need 4 × 0.5 = 2 servings
        const ratio = payload.quantity / recipe.servings;

        // 3. Deduct ingredients from inventory
        for (const ri of recipeIngredients) {
            const neededAmount = ri.quantity * ratio;

            // Find this ingredient in inventory
            const invItem = store.inventory.find(
                (i) => i.ingredient_id === ri.ingredient_id
            );

            if (!invItem) {
                // No inventory for this ingredient - skip it
                continue;
            }

            // Convert needed amount to inventory's unit
            const units = store.ingredientUnits.filter(u => u.ingredient_id === ri.ingredient_id);
            const invUnit = units.find(u => u.unit_name === invItem.unit);
            const recipeUnit = units.find(u => u.unit_name === ri.unit);

            if (!invUnit || !recipeUnit) {
                continue; // Skip if units not found
            }

            // Convert needed amount to inventory's unit
            const neededInInvUnit = neededAmount * (invUnit.amount / recipeUnit.amount);

            // Deduct from inventory (or zero out if not enough)
            const newQuantity = invItem.quantity - neededInInvUnit;

            if (newQuantity <= 0) {
                // Zero out - delete from inventory
                store.deleteInventory(invItem.id);
            } else {
                // Update with remaining quantity
                store.updateInventory(invItem.id, newQuantity);
            }
        }

        // 4. Add recipe to inventory
        store.addInventory({
            ingredient_id: null,
            recipe_id: payload.recipe_id,
            quantity: payload.quantity,
            unit: payload.unit || 'servings',
        });

        return { success: true };

    } else if (payload.ingredient_id) {
        // ========================================
        // INGREDIENT PATH: Add ingredient to inventory
        // ========================================
        // This uses the smart unit conversion in the store
        store.addInventory({
            ingredient_id: payload.ingredient_id,
            recipe_id: null,
            quantity: payload.quantity,
            unit: payload.unit,
        });

        return { success: true };
    }

    return { success: false, message: 'Invalid payload' };
}

// Demo API: Get Food Logs by Date
export async function demoGetFoodLogs(date: string): Promise<{
    success: boolean;
    food_logs: PopulatedFoodLog[];
}> {
    const store = useDemoStore.getState();
    const logs = store.getFoodLogsByDate(date);

    const populated: PopulatedFoodLog[] = logs.map((log) => {
        const nutrients = store.getFoodLogNutrients(log.id);

        return {
            ...log,
            ingredient: log.ingredient_id
                ? store.getIngredientById(log.ingredient_id) || null
                : null,
            recipe: log.recipe_id ? store.getRecipeById(log.recipe_id) || null : null,
            nutrients: nutrients.map((n) => ({
                nutrient_key: n.nutrient_key,
                amount: n.amount,
                unit: n.unit,
            })),
            logged_at: log.log_datetime, // Map field name
        };
    });

    return { success: true, food_logs: populated };
}

// ============================================
// API: Add Food Log
// ============================================
// Logs food consumption and deducts from inventory
export async function demoAddFoodLog(payload: {
    ingredient_id?: string | null;
    recipe_id?: string | null;
    quantity: number;
    unit: string;
    log_datetime: string;
    meal_type?: string;
}): Promise<{ success: boolean; message?: string }> {
    const store = useDemoStore.getState();

    // Calculate nutrients based on what was logged
    let nutrients: Array<{ nutrient_key: string; amount: number; unit: string }> = [];

    if (payload.ingredient_id) {
        nutrients = calculateIngredientNutrients(
            payload.ingredient_id,
            payload.quantity,
            payload.unit
        );
    } else if (payload.recipe_id) {
        nutrients = calculateRecipeNutrients(payload.recipe_id, payload.quantity);
    }

    // Create food log entry
    const newLog = store.addFoodLog({
        ingredient_id: payload.ingredient_id || null,
        recipe_id: payload.recipe_id || null,
        quantity: payload.quantity,
        unit: payload.unit,
        log_datetime: payload.log_datetime,
        meal_type: payload.meal_type || null,
    });

    // Add nutrients to the food log
    store.addFoodLogNutrients(
        nutrients.map((n) => ({
            food_log_id: newLog.id,
            ...n,
        }))
    );

    // Deduct from inventory (if item exists)
    if (payload.ingredient_id) {
        const invItem = store.inventory.find(
            (i) => i.ingredient_id === payload.ingredient_id
        );

        if (invItem) {
            // Convert logged quantity to inventory's unit
            const units = store.ingredientUnits.filter(u => u.ingredient_id === payload.ingredient_id);
            const loggedUnit = units.find(u => u.unit_name === payload.unit);
            const invUnit = units.find(u => u.unit_name === invItem.unit);

            if (loggedUnit && invUnit) {
                const quantityInInvUnit = payload.quantity * (invUnit.amount / loggedUnit.amount);
                const newQuantity = invItem.quantity - quantityInInvUnit;

                if (newQuantity <= 0) {
                    // Zero out - delete from inventory
                    store.deleteInventory(invItem.id);
                } else {
                    // Update with remaining quantity
                    store.updateInventory(invItem.id, newQuantity);
                }
            }
        }
    } else if (payload.recipe_id) {
        const invItem = store.inventory.find(
            (i) => i.recipe_id === payload.recipe_id
        );

        if (invItem) {
            const newQuantity = invItem.quantity - payload.quantity;

            if (newQuantity <= 0) {
                // Zero out - delete from inventory
                store.deleteInventory(invItem.id);
            } else {
                // Update with remaining quantity
                store.updateInventory(invItem.id, newQuantity);
            }
        }
    }

    return { success: true };
}

// Demo API: Get Goals
export async function demoGetGoals(): Promise<{
    success: boolean;
    goals: any[];
}> {
    const store = useDemoStore.getState();
    const goals = store.getGoals();

    return { success: true, goals };
}

// Demo API: Add Goal
export async function demoAddGoal(payload: {
    nutrient_key: string;
    target_amount: number;
}): Promise<{ success: boolean; goal?: any }> {
    const store = useDemoStore.getState();
    const newGoal = store.addGoal(payload);

    return { success: true, goal: newGoal };
}

// Demo API: Update Goal
export async function demoUpdateGoal(payload: {
    id: string;
    target_amount: number;
}): Promise<{ success: boolean; goal?: any }> {
    const store = useDemoStore.getState();
    store.updateGoal(payload.id, payload.target_amount);

    const updatedGoal = store.goals.find((g) => g.id === payload.id);

    return { success: true, goal: updatedGoal };
}

// Demo API: Get Ingredients
export async function demoGetIngredients(): Promise<{
    success: boolean;
    ingredients: any[];
}> {
    const store = useDemoStore.getState();
    const ingredients = store.getIngredients();

    return { success: true, ingredients };
}

// Demo API: Get Recipes
export async function demoGetRecipes(): Promise<{
    success: boolean;
    recipes: any[];
}> {
    const store = useDemoStore.getState();
    const recipes = store.getRecipes();

    return { success: true, recipes };
}