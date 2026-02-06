/**
 * API Module Exports
 * Central place to import all API clients
 * 
 * Usage:
 *   import { ingredientsApi, ApiError } from '@/lib/api'
 *   import type { FetchFunction, Ingredient } from '@/lib/api'
 */

// Export values (runtime code)
export { apiRequest, ApiError } from './client';
export { ingredientsApi } from './ingredients';

// Export types (compile-time only)
export type { FetchFunction } from './client';
export type * from './types/ingredients';