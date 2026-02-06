// src/types/utils.ts
import { Database } from './database.types';

// Extract table types from generated Database type
export type Tables = Database['public']['Tables'];

// Helper to get Row type for any table
export type Row<T extends keyof Tables> = Tables[T]['Row'];

// Helper to get Insert type for any table
export type Insert<T extends keyof Tables> = Tables[T]['Insert'];

// Helper to get Update type for any table
export type Update<T extends keyof Tables> = Tables[T]['Update'];

// ============================================
// UTILITY TYPES
// ============================================

// Make specific fields required in a type
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Make specific fields optional in a type
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Omit common fields (for forms)
export type OmitMetadata<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

// ============================================
// RELATIONSHIP HELPERS
// ============================================

// For types with optional related data (after joins)
export type WithRelation<T, K extends string, V> = T & {
    [P in K]?: V;
};

// For types with required related data
export type WithRequiredRelation<T, K extends string, V> = T & {
    [P in K]: V;
};