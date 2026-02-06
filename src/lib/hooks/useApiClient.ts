import { useCallback } from 'react';
import { useFetch } from '@/providers/demo-provider';
import type { FetchFunction } from '@/lib/api';

export function useApiClient() {
    const { fetch: demoFetch, isDemo } = useFetch();

    const customFetch: FetchFunction = useCallback(
        (input: RequestInfo | URL, init?: RequestInit) => {
            const url = typeof input === 'string' ? input : input.toString();
            return demoFetch(url, init);
        },
        [demoFetch]
    );

    return {
        customFetch,
        isDemo,
    };
}