// src/services/demo-service.ts
// This file replicates your API/RPC logic for demo mode

import { ALL_NUTRIENTS_DICT } from '@/constants/constants';
import { useDemoStore } from '@/store/demo-store';
import type { PopulatedInventoryItem, PopulatedFoodLog, Ingredient, Recipe, Goal } from '@/types';
import { get } from 'http';


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
}): Promise<{
    success: boolean;
    message?: string;
    warnings?: string[];
    depleted_items?: Array<{ name: string; had: number; needed: number; unit: string }>;
}> {
    const store = useDemoStore.getState();
    const depletedItems: Array<{ name: string; had: number; needed: number; unit: string }> = [];

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
        const ratio = payload.quantity / recipe.servings;

        // 3. Deduct ingredients from inventory
        for (const ri of recipeIngredients) {
            const neededAmount = ri.quantity * ratio;

            // Find this ingredient in inventory
            const invItem = store.inventory.find(
                (i) => i.ingredient_id === ri.ingredient_id
            );

            if (!invItem) {
                // No inventory for this ingredient
                const ingredient = store.getIngredientById(ri.ingredient_id);
                depletedItems.push({
                    name: ingredient?.name || 'Unknown ingredient',
                    had: 0,
                    needed: neededAmount,
                    unit: ri.unit,
                });
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

            // Calculate new quantity
            const newQuantity = invItem.quantity - neededInInvUnit;

            if (newQuantity <= 0) {
                // Track depletion
                const ingredient = store.getIngredientById(ri.ingredient_id);
                depletedItems.push({
                    name: ingredient?.name || 'Unknown ingredient',
                    had: invItem.quantity,
                    needed: neededInInvUnit,
                    unit: invItem.unit,
                });

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

        // 5. Return with warnings if items were depleted
        if (depletedItems.length > 0) {
            const warnings = depletedItems.map(item =>
                `${item.name}: had ${item.had.toFixed(2)} ${item.unit}, needed ${item.needed.toFixed(2)} ${item.unit}`
            );

            return {
                success: true,
                warnings,
                depleted_items: depletedItems
            };
        }

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
}): Promise<{
    success: boolean;
    message?: string;
    warnings?: string[];
    depleted_items?: Array<{ name: string; had: number; needed: number; unit: string }>;
}> {
    const store = useDemoStore.getState();
    const depletedItems: Array<{ name: string; had: number; needed: number; unit: string }> = [];

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
                    // Track depletion
                    const ingredient = store.getIngredientById(payload.ingredient_id);
                    depletedItems.push({
                        name: ingredient?.name || 'Unknown ingredient',
                        had: invItem.quantity,
                        needed: quantityInInvUnit,
                        unit: invItem.unit,
                    });

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
                // Track depletion
                const recipe = store.getRecipeById(payload.recipe_id);
                depletedItems.push({
                    name: recipe?.name || 'Unknown recipe',
                    had: invItem.quantity,
                    needed: payload.quantity,
                    unit: invItem.unit,
                });

                // Zero out - delete from inventory
                store.deleteInventory(invItem.id);
            } else {
                // Update with remaining quantity
                store.updateInventory(invItem.id, newQuantity);
            }
        }
    }

    // Return with warnings if items were depleted
    if (depletedItems.length > 0) {
        const warnings = depletedItems.map(item =>
            `${item.name} inventory depleted (had ${item.had.toFixed(2)} ${item.unit}, used ${item.needed.toFixed(2)} ${item.unit})`
        );

        return {
            success: true,
            warnings,
            depleted_items: depletedItems
        };
    }
    console.log("SUCCESS");
    console.log("Food logs:", store.getFoodLogs());
    return { success: true };
}

export async function demoGetRecentMeals(): Promise<{
    success: boolean;
    meals: Array<{
        id: string;
        log_datetime: string;
        ingredient: Ingredient | null | undefined;
        recipe: Recipe | null | undefined;
        nutrients: Array<{
            nutrient_key: string;
            amount: number;
        }>;
    }>;
}> {
    const store = useDemoStore.getState();
    const meals = store.getRecentMeals();

    return { success: true, meals };
}

// Demo API: Get Goals
export async function demoGetGoals(): Promise<{
    success: boolean;
    goals: Goal[];
}> {
    const store = useDemoStore.getState();
    const goals = store.getGoals();

    return { success: true, goals };
}

// Demo API: Add Goal
export async function demoAddGoal(payload: {
    nutrient_key: string;
    target_amount: number;
}): Promise<{ success: boolean; goal?: Goal }> {
    const store = useDemoStore.getState();
    const newGoal = store.addGoal(payload);

    return { success: true, goal: newGoal };
}

// Demo API: Update Goal
export async function demoUpdateGoal(payload: {
    id: string;
    target_amount: number;
}): Promise<{ success: boolean; goal?: Goal }> {
    const store = useDemoStore.getState();
    store.updateGoal(payload.id, payload.target_amount);

    const updatedGoal = store.goals.find((g) => g.id === payload.id);

    return { success: true, goal: updatedGoal };
}

// Demo API: Get Ingredients
export async function demoGetIngredients(): Promise<{
    success: boolean;
    ingredients: Ingredient[];
}> {
    const store = useDemoStore.getState();
    const ingredients = store.getIngredients();

    const populated = ingredients.map((ing) => ({
        ...ing,
        units: store.ingredientUnits.filter((u) => u.ingredient_id === ing.id),
        nutrients: store.getIngredientNutrients(ing.id).map((n) => ({ ...n, display_name: ALL_NUTRIENTS_DICT[n.nutrient_key]?.display_name || n.nutrient_key })),
    }));

    return { success: true, ingredients: populated };
}

// Demo API: Get Recipes
export async function demoGetRecipes(): Promise<{
    success: boolean;
    recipes: Recipe[];
}> {
    const store = useDemoStore.getState();
    const recipes = store.getRecipes();

    // Populate each recipe with its nutrients
    const populatedRecipes = recipes.map((recipe) => ({
        ...recipe,
        recipe_nutrients: store.getRecipeNutrients(recipe.id),
        recipe_ingredients: store.getRecipeIngredients(recipe.id).map((ri) => ({
            ...ri,
            ingredient: store.getIngredientById(ri.ingredient_id),
        })),
    }));

    return { success: true, recipes: populatedRecipes };
}

// ============================================
// API: Search Ingredients
// ============================================
export async function demoSearchIngredients(query: string): Promise<{
    success: boolean;
    ingredients: Ingredient[];
}> {
    const store = useDemoStore.getState();
    const ingredients = store.getIngredients();

    // Simple search by name or brand
    const results = ingredients.filter((ing) =>
        ing.name.toLowerCase().includes(query.toLowerCase()) ||
        (ing.brand && ing.brand.toLowerCase().includes(query.toLowerCase()))
    );

    // Populate with units for each ingredient
    const populatedResults = results.map((ing) => ({
        ...ing,
        units: store.ingredientUnits.filter((u) => u.ingredient_id === ing.id),
        nutrients: store.getIngredientNutrients(ing.id),
    }));

    return { success: true, ingredients: populatedResults };
}

// ============================================
// API: Search Recipes
// ============================================
export async function demoSearchRecipes(query: string): Promise<{
    success: boolean;
    results: Recipe[];
}> {
    const store = useDemoStore.getState();
    const recipes = store.getRecipes();

    // Simple search by name
    const results = recipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(query.toLowerCase())
    );

    return { success: true, results };
}

// ============================================
// API: Add Ingredient
// ============================================
// Creates a new ingredient with nutrients and units
export async function demoAddIngredient(payload: {
    name: string;
    brand: string | null;
    nutrients: Array<{
        nutrient_key: string;
        unit: string;
        amount: number;
        display_name: string;
    }>;
    units: Array<{
        unit_name: string;
        amount: number;
        is_default: boolean;
    }>;
}): Promise<{ success: boolean; ingredient?: Ingredient }> {
    const store = useDemoStore.getState();

    // 1. Create the ingredient
    const newIngredient = store.addIngredient({
        name: payload.name,
        brand: payload.brand,
        servings_per_container: null,
        is_verified: false,
        verified_by: null,
        verified_at: null,
    });

    // 2. Add nutrients for this ingredient
    payload.nutrients.forEach((nutrient) => {
        store.addIngredientNutrient({
            ingredient_id: newIngredient.id,
            nutrient_key: nutrient.nutrient_key,
            unit: nutrient.unit,
            amount: nutrient.amount,
        });
    });

    // 3. Add units for this ingredient
    payload.units.forEach((unit) => {
        store.addIngredientUnit({
            ingredient_id: newIngredient.id,
            unit_name: unit.unit_name,
            amount: unit.amount,
            is_default: unit.is_default,
            created_by: store.demoUserId,
        });
    });

    return { success: true, ingredient: newIngredient };
}

// ============================================
// API: Add Recipe
// ============================================
// Creates a new recipe with ingredients
export async function demoAddRecipe(payload: {
    name: string;
    description: string | null;
    servings: number;
    ingredients: Array<{
        ingredient_id: string;
        quantity: number;
        unit: string;
    }>;
}): Promise<{ success: boolean; recipe?: Recipe }> {
    const store = useDemoStore.getState();

    // 1. Create the recipe
    const newRecipe = store.addRecipe({
        name: payload.name,
        description: payload.description,
        servings: payload.servings,
    });

    // 2. Add ingredients to the recipe
    payload.ingredients.forEach((ingredient) => {
        store.addRecipeIngredient({
            recipe_id: newRecipe.id,
            ingredient_id: ingredient.ingredient_id,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
        });
    });

    // 3. Calculate and store recipe nutrients
    // For each ingredient in the recipe, calculate its nutrient contribution
    const recipeNutrients: { [key: string]: { total: number; unit: string } } = {};

    payload.ingredients.forEach((recipeIngredient) => {
        // Calculate nutrients for this ingredient quantity
        const nutrients = calculateIngredientNutrients(
            recipeIngredient.ingredient_id,
            recipeIngredient.quantity,
            recipeIngredient.unit
        );

        // Sum up nutrients
        nutrients.forEach((nutrient) => {
            if (!recipeNutrients[nutrient.nutrient_key]) {
                recipeNutrients[nutrient.nutrient_key] = {
                    total: 0,
                    unit: nutrient.unit,
                };
            }
            recipeNutrients[nutrient.nutrient_key].total += nutrient.amount;
        });
    });

    // 4. Store recipe nutrients in the store
    Object.entries(recipeNutrients).forEach(([nutrient_key, data]) => {
        store.addRecipeNutrient({
            recipe_id: newRecipe.id,
            nutrient_key,
            unit: data.unit,
            total_amount: data.total,
        });
    });

    return { success: true, recipe: newRecipe };
}