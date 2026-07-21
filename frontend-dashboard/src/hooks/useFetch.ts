import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

export function useFetch<T = any>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const { request, loading, error } = useApi();

  const refetch = useCallback(async () => {
    try {
      const res = await request<T>(endpoint);
      setData(res);
    } catch (err: any) {
      if (err.message !== 'Unauthorized') {
        console.error('Fetch error:', err);
      }
    }
  }, [endpoint, request]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
