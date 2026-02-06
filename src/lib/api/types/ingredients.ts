import { Database } from '@/types/database.types';

type DbIngredientRow = Database['public']['Tables']['ingredients']['Row'];
type DbNutrientRow = Database['public']['Tables']['ingredient_nutrients']['Row'];
type DbUnitRow = Database['public']['Tables']['ingredient_units']['Row'];

export interface DbNutrient extends Omit<DbNutrientRow, 'ingredient_id' | 'created_at'> {
    display_name?: string;
}

export interface DbUnit extends Omit<DbUnitRow, 'ingredient_id' | 'created_by' | 'created_at'> {
}

export interface DbIngredient extends Omit<DbIngredientRow, 'user_id' | 'is_verified' | 'verified_at' | 'verified_by'> {
    nutrients: DbNutrient[];
    units: DbUnit[];
}

export interface Nutrient {
    id: string;
    nutrientKey: string;
    displayName: string;
    unit: string;
    amount: number;
}

export interface Unit {
    id: string;
    unitName: string;
    isDefault: boolean;
    amount: number;
}

export interface Ingredient {
    id: string;
    name: string;
    brand?: string;
    servingSize?: number;
    servingUnit?: string;
    servingsPerContainer?: number;
    nutrients: Nutrient[];
    units: Unit[];
}

export interface CreateIngredientNutrient {
    nutrient_key: string;
    unit: string;
    amount: number;
    display_name?: string;
}

export interface CreateIngredientUnit {
    unit_name: string;
    amount: number;
    is_default?: boolean;
}

export interface CreateIngredientRequest {
    name: string;
    brand?: string;
    servings_per_container?: number;
    nutrients: CreateIngredientNutrient[];
    units?: CreateIngredientUnit[];
}

export interface GetIngredientsResponse {
    success: boolean;
    ingredients: DbIngredient[];
}

export interface CreateIngredientResponse {
    success: boolean;
    ingredientId: string;
}