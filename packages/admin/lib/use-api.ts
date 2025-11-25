'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiFetchOptions, apiFetch } from './api';

type UseApiState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

export function useApi<TResponse = unknown>(
  path: string,
  options?: ApiFetchOptions,
): UseApiState<TResponse> {
  const [data, setData] = useState<TResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<TResponse>(path, options);
      setData(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha ao carregar dados.';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [path, options]);

  useEffect(() => {
    void run();
  }, [run]);

  return { data, error, loading, refetch: run };
}
