// src/store/demo-store.ts
import { create } from 'zustand';
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
} from '@/types';
import { DEMO_MOCK_DATA } from './demo-mock-data';

// ============================================
// UNIT CONVERSION HELPER
// ============================================
// Converts quantity from sourceUnit to targetUnit for a given ingredient
// Example: Convert "2 servings" to "cups"
function convertUnit(
    ingredientId: string,
    quantity: number,
    sourceUnit: string,
    targetUnit: string,
    allUnits: IngredientUnit[]
): number {
    // If units are the same, no conversion needed
    if (sourceUnit === targetUnit) return quantity;

    // Get unit definitions for this ingredient
    const units = allUnits.filter((u) => u.ingredient_id === ingredientId);

    const sourceUnitDef = units.find((u) => u.unit_name === sourceUnit);
    const targetUnitDef = units.find((u) => u.unit_name === targetUnit);

    if (!sourceUnitDef || !targetUnitDef) {
        console.error(`Unit conversion failed: ${sourceUnit} -> ${targetUnit}`);
        return quantity; // Fallback to original quantity if units not found
    }

    // Conversion formula:
    // 1. Convert source quantity to "servings" (the base unit)
    // 2. Convert "servings" to target unit
    //
    // Example: Converting 2 servings to cups
    //   sourceUnitDef.amount = 1 (1 serving = 1 serving)
    //   targetUnitDef.amount = 0.243 (1 serving = 0.243 cups)
    //   result = 2 × (0.243 / 1) = 0.486 cups

    const convertedQuantity = quantity * (targetUnitDef.amount / sourceUnitDef.amount);

    return convertedQuantity;
}

type DemoState = {
    // Data tables
    ingredients: Ingredient[];
    ingredientNutrients: IngredientNutrient[];
    ingredientUnits: IngredientUnit[];
    recipes: Recipe[];
    recipeIngredients: RecipeIngredient[];
    recipeNutrients: RecipeNutrient[];
    inventory: InventoryItem[];
    foodLogs: FoodLog[];
    foodLogNutrients: FoodLogNutrient[];
    goals: Goal[];
    nutrientDefinitions: NutrientDefinition[];

    // Demo user ID
    demoUserId: string;

    // Actions - Ingredients
    addIngredient: (ingredient: Omit<Ingredient, 'id' | 'created_at' | 'user_id'>) => Ingredient;
    addIngredientNutrient: (nutrient: Omit<IngredientNutrient, 'id' | 'created_at'>) => void;
    addIngredientUnit: (unit: Omit<IngredientUnit, 'id' | 'created_at'>) => void;
    getIngredients: () => Ingredient[];
    getIngredientById: (id: string) => Ingredient | undefined;
    getIngredientNutrients: (ingredientId: string) => IngredientNutrient[];

    // Actions - Recipes
    addRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Recipe;
    addRecipeIngredient: (recipeIngredient: Omit<RecipeIngredient, 'id' | 'created_at'>) => void;
    addRecipeNutrient: (recipeNutrient: RecipeNutrient) => void;
    getRecipes: () => Recipe[];
    getRecipeById: (id: string) => Recipe | undefined;
    getRecipeIngredients: (recipeId: string) => RecipeIngredient[];
    getRecipeNutrients: (recipeId: string) => RecipeNutrient[];

    // Actions - Inventory
    addInventory: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => InventoryItem;
    updateInventory: (id: string, quantity: number) => void;
    getInventory: () => InventoryItem[];
    deleteInventory: (id: string) => void;

    // Actions - Food Logs
    addFoodLog: (log: Omit<FoodLog, 'id' | 'created_at' | 'user_id'>) => FoodLog;
    addFoodLogNutrients: (nutrients: Omit<FoodLogNutrient, 'id'>[]) => void;
    getFoodLogsByDate: (date: string) => FoodLog[];
    getFoodLogNutrients: (foodLogId: string) => FoodLogNutrient[];
    getRecentMeals: () => Array<{
        id: string;
        log_datetime: string;
        ingredient: any | null;
        recipe: any | null;
        nutrients: Array<{
            nutrient_key: string;
            amount: number;
        }>;
    }>;
    getFoodLogs: () => FoodLog[];

    // Actions - Goals
    addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Goal;
    updateGoal: (id: string, target_amount: number) => void;
    getGoals: () => Goal[];
    deleteGoal: (id: string) => void;

    // Reset to initial state
    resetDemo: () => void;
};

export const useDemoStore = create<DemoState>((set, get) => ({
    // Initialize with mock data
    ...DEMO_MOCK_DATA,
    demoUserId: 'demo-user-123',

    // Ingredients
    addIngredient: (ingredient) => {
        const newIngredient: Ingredient = {
            ...ingredient,
            id: `ingredient-${Date.now()}`,
            user_id: get().demoUserId,
            created_at: new Date().toISOString(),
        };
        set((state) => ({
            ingredients: [...state.ingredients, newIngredient],
        }));
        return newIngredient;
    },

    addIngredientNutrient: (nutrient) => {
        const newNutrient: IngredientNutrient = {
            ...nutrient,
            id: `nutrient-${Date.now()}`,
            created_at: new Date().toISOString(),
        };
        set((state) => ({
            ingredientNutrients: [...state.ingredientNutrients, newNutrient],
        }));
    },

    addIngredientUnit: (unit) => {
        const newUnit: IngredientUnit = {
            ...unit,
            id: `unit-${Date.now()}`,
            created_at: new Date().toISOString(),
        };
        set((state) => ({
            ingredientUnits: [...state.ingredientUnits, newUnit],
        }));
    },

    getIngredients: () => get().ingredients,

    getIngredientById: (id) => get().ingredients.find((i) => i.id === id),

    getIngredientNutrients: (ingredientId) =>
        get().ingredientNutrients.filter((n) => n.ingredient_id === ingredientId),

    // Recipes
    addRecipe: (recipe) => {
        const newRecipe: Recipe = {
            ...recipe,
            id: `recipe-${Date.now()}`,
            user_id: get().demoUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        set((state) => ({
            recipes: [...state.recipes, newRecipe],
        }));
        return newRecipe;
    },

    addRecipeIngredient: (recipeIngredient) => {
        const newRecipeIngredient: RecipeIngredient = {
            ...recipeIngredient,
            id: `recipe-ingredient-${Date.now()}`,
            created_at: new Date().toISOString(),
        };
        set((state) => ({
            recipeIngredients: [...state.recipeIngredients, newRecipeIngredient],
        }));
    },

    addRecipeNutrient: (recipeNutrient) => {
        set((state) => ({
            recipeNutrients: [...state.recipeNutrients, recipeNutrient],
        }));
    },

    getRecipes: () => get().recipes,

    getRecipeById: (id) => get().recipes.find((r) => r.id === id),

    getRecipeIngredients: (recipeId) =>
        get().recipeIngredients.filter((ri) => ri.recipe_id === recipeId),

    getRecipeNutrients: (recipeId) =>
        get().recipeNutrients.filter((rn) => rn.recipe_id === recipeId),

    // Inventory - With Smart Unit Conversion
    addInventory: (item) => {
        // Find if this ingredient/recipe already exists in inventory (regardless of unit)
        const existingItem = get().inventory.find(
            (i) =>
                i.ingredient_id === item.ingredient_id &&
                i.recipe_id === item.recipe_id
        );

        if (existingItem) {
            // Item exists - need to convert units if they're different
            if (existingItem.unit === item.unit) {
                // Same unit - just add quantities
                set((state) => ({
                    inventory: state.inventory.map((i) =>
                        i.id === existingItem.id
                            ? {
                                ...i,
                                quantity: i.quantity + item.quantity,
                                updated_at: new Date().toISOString(),
                            }
                            : i
                    ),
                }));
                return existingItem;
            } else {
                // Different units - convert item.quantity to existingItem.unit
                const convertedQuantity = convertUnit(
                    item.ingredient_id!,
                    item.quantity,
                    item.unit,
                    existingItem.unit,
                    get().ingredientUnits
                );

                set((state) => ({
                    inventory: state.inventory.map((i) =>
                        i.id === existingItem.id
                            ? {
                                ...i,
                                quantity: i.quantity + convertedQuantity,
                                updated_at: new Date().toISOString(),
                            }
                            : i
                    ),
                }));
                return existingItem;
            }
        } else {
            // New item - add to inventory
            const newItem: InventoryItem = {
                ...item,
                id: `inventory-${Date.now()}`,
                user_id: get().demoUserId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            set((state) => ({
                inventory: [...state.inventory, newItem],
            }));
            return newItem;
        }
    },

    updateInventory: (id, quantity) => {
        set((state) => ({
            inventory: state.inventory.map((i) =>
                i.id === id
                    ? { ...i, quantity, updated_at: new Date().toISOString() }
                    : i
            ),
        }));
    },

    getInventory: () => get().inventory,

    deleteInventory: (id) => {
        set((state) => ({
            inventory: state.inventory.filter((i) => i.id !== id),
        }));
    },

    // Food Logs
    addFoodLog: (log) => {
        const now = new Date();
        const today =
            now.getFullYear() +
            "-" +
            String(now.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(now.getDate()).padStart(2, "0");
        const newLog: FoodLog = {
            ...log,
            id: `food-log-${Date.now()}`,
            user_id: get().demoUserId,
            log_datetime: today,
            created_at: today,
        };
        set((state) => ({
            foodLogs: [...state.foodLogs, newLog],
        }));
        return newLog;
    },

    getRecentMeals: () => {
        const logs = get().foodLogs
            .sort((a, b) => new Date(b.log_datetime).getTime() - new Date(a.log_datetime).getTime())
            .slice(0, 5);

        return logs.map((log) => {
            const nutrients = get().getFoodLogNutrients(log.id);
            return {
                ...log,
                ingredient: log.ingredient_id ? get().getIngredientById(log.ingredient_id) : null,
                recipe: log.recipe_id ? get().getRecipeById(log.recipe_id) : null,
                nutrients,
            };
        });
    },

    addFoodLogNutrients: (nutrients) => {
        const newNutrients: FoodLogNutrient[] = nutrients.map((n) => ({
            ...n,
            id: `food-log-nutrient-${Date.now()}-${Math.random()}`,
        }));
        set((state) => ({
            foodLogNutrients: [...state.foodLogNutrients, ...newNutrients],
        }));
    },

    getFoodLogsByDate: (date) => {
        // FIX DATES
        // console.log("Getting food logs for date:", date);
        // const startOfDay = new Date(date);
        // console.log("Initial startOfDay:", startOfDay);
        // startOfDay.setHours(0, 0, 0, 0);
        // const endOfDay = new Date(date);
        // endOfDay.setHours(23, 59, 59, 999);
        // get().foodLogs.map((log) => { console.log(new Date(log.created_at)); });
        // return get().foodLogs.filter((log) => {
        //     const logDate = new Date(log.created_at);
        //     return logDate >= startOfDay && logDate <= endOfDay;
        // });

        return get().foodLogs
    },

    getFoodLogs: () => get().foodLogs,

    getFoodLogNutrients: (foodLogId) =>
        get().foodLogNutrients.filter((n) => n.food_log_id === foodLogId),

    // Goals
    addGoal: (goal) => {
        const newGoal: Goal = {
            ...goal,
            id: `goal-${Date.now()}`,
            user_id: get().demoUserId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        set((state) => ({
            goals: [...state.goals, newGoal],
        }));
        return newGoal;
    },

    updateGoal: (id, target_amount) => {
        set((state) => ({
            goals: state.goals.map((g) =>
                g.id === id
                    ? { ...g, target_amount, updated_at: new Date().toISOString() }
                    : g
            ),
        }));
    },

    getGoals: () => get().goals,

    deleteGoal: (id) => {
        set((state) => ({
            goals: state.goals.filter((g) => g.id !== id),
        }));
    },

    // Reset
    resetDemo: () => {
        set(() => ({
            ...DEMO_MOCK_DATA,
            demoUserId: 'demo-user-123',
        }));
    },
}));