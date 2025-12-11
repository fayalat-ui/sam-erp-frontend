import { useState, useEffect } from 'react';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';

interface UseSharePointDataOptions {
  listName: string;
  select?: string;
  filter?: string;
  enabled?: boolean;
}

interface SharePointQueryOptions {
  select?: string;
  filter?: string;
  orderBy?: string;
  top?: number;
}

interface SharePointServiceLike<T> {
  getAll: (options: SharePointQueryOptions) => Promise<T[]>;
}

interface SharePointWritableServiceLike<T> extends SharePointServiceLike<T> {
  create?: (data: Record<string, unknown>) => Promise<unknown>;
  update?: (id: string, data: Record<string, unknown>) => Promise<unknown>;
  delete?: (id: string) => Promise<unknown>;
}

interface UseSharePointDataResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  create?: (data: Record<string, unknown>) => Promise<void>;
  update?: (id: string, data: Record<string, unknown>) => Promise<void>;
  remove?: (id: string) => Promise<void>;
}

export function useSharePointData<T>(
  service: SharePointServiceLike<T> | SharePointWritableServiceLike<T>,
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

  const writable = service as SharePointWritableServiceLike<T>;

  const create = writable.create
    ? async (payload: Record<string, unknown>) => {
        await writable.create!(payload);
        await fetchData();
      }
    : undefined;

  const update = writable.update
    ? async (id: string, payload: Record<string, unknown>) => {
        await writable.update!(id, payload);
        await fetchData();
      }
    : undefined;

  const remove = writable.delete
    ? async (id: string) => {
        await writable.delete!(id);
        await fetchData();
      }
    : undefined;

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.enabled, options.listName, isAuthenticated, options.select, options.filter]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    remove,
  };
}