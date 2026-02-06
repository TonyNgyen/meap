/**
 * Base API client with error handling and type-safe fetch wrapper
 * All API modules will use this as their foundation
 */

export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Custom fetch function type that matches native fetch signature
 * Used for demo mode compatibility
 */
export type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

/**
 * Type-safe fetch wrapper with error handling
 * Automatically handles JSON parsing and error responses
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options (method, body, headers, etc.)
 * @param customFetch - Optional custom fetch function (for demo mode)
 */
export async function apiRequest<T>(
    url: string,
    options?: RequestInit,
    customFetch?: FetchFunction
): Promise<T> {
    try {
        // Use custom fetch if provided (demo mode), otherwise use native fetch
        const fetchFn = customFetch || fetch;

        const response = await fetchFn(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        // Parse response body
        const data = await response.json();

        // Handle error responses from your API
        if (!response.ok || data.error || !data.success) {
            throw new ApiError(
                data.error?.message || data.error || 'Request failed',
                response.status,
                data.error
            );
        }

        return data as T;
    } catch (error) {
        // Re-throw ApiErrors as-is
        if (error instanceof ApiError) {
            throw error;
        }

        // Wrap other errors (network errors, JSON parse errors, etc.)
        if (error instanceof Error) {
            throw new ApiError(error.message);
        }

        // Fallback for unknown errors
        throw new ApiError('An unexpected error occurred');
    }
}