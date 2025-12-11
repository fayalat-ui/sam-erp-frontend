import { useState, useEffect } from 'react';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';

interface UseSharePointDataOptions {
  listName: string;
  select?: string;
  filter?: string;
  enabled?: boolean;
}

interface SharePointServiceLike<T> {
  getAll: (options: { select?: string; filter?: string; orderBy?: string; top?: number }) => Promise<T[]>;
}

interface UseSharePointDataResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSharePointData<T>(
  service: SharePointServiceLike<T>,
  options: UseSharePointDataOptions
): UseSharePointDataResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated, getAccessToken } = useSharePointAuth();

  const fetchData = async () => {
    if (options.enabled === false || !isAuthenticated) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ensure we have a valid access token
      await getAccessToken();

      const result = await service.getAll({
        select: options.select,
        filter: options.filter,
      });

      setData(result);
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(e);
      console.error(`Error fetching data from ${options.listName}:`, e);

      // Set empty data on error to prevent UI crashes
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.enabled, options.listName, isAuthenticated]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}