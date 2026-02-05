'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type FirebaseAction = "read" | "write" | "update" | "remove" | "push";

type FirebaseApiResponse<T> = {
  data?: T;
  error?: string;
};

interface UseFirebaseDatabaseReturn {
  // Read operations
  read: <T = any>(path: string) => Promise<T | null>;
  readOnce: <T = any>(path: string) => Promise<T | null>;
  
  // Write operations
  write: <T = any>(path: string, data: T) => Promise<void>;
  updateData: (path: string, data: Record<string, any>) => Promise<void>;
  removeData: (path: string) => Promise<void>;
  push: <T = any>(path: string, data: T) => Promise<string | null>;
  
  // Subscribe operations
  subscribe: <T = any>(
    path: string, 
    callback: (data: T | null) => void
  ) => () => void;
  
  // State for subscriptions
  data: any;
  loading: boolean;
  error: Error | null;
}

export const useFirebaseDatabase = (): UseFirebaseDatabaseReturn => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  type SubEntry = { cancelled: boolean; unsubscribe?: () => void };
  const subscriptionsRef = useRef<Map<string, SubEntry>>(new Map());

  const callFirebase = useCallback(async <T = any>(
    action: FirebaseAction,
    path: string,
    payload?: unknown,
    silent?: boolean
  ): Promise<T | null> => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await fetch("/api/firebase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action,
          path,
          data: payload,
        }),
      });

      const json = (await response.json()) as FirebaseApiResponse<T>;
      if (!response.ok || json.error) {
        throw new Error(json.error || "Error en Firebase.");
      }
      return (json.data ?? null) as T | null;
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Unknown error");
      setError(nextError);
      throw nextError;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((entry) => {
        entry.unsubscribe?.();
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  /**
   * Read data from a path (one-time read)
   */
  const readOnce = useCallback(async <T = any>(path: string): Promise<T | null> => {
    try {
      return await callFirebase<T>("read", path);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, [callFirebase]);

  /**
   * Read data from a path (alias for readOnce)
   */
  const read = useCallback(<T = any>(path: string): Promise<T | null> => {
    return readOnce<T>(path);
  }, [readOnce]);

  /**
   * Write data to a path (replaces existing data)
   */
  const write = useCallback(async <T = any>(path: string, data: T): Promise<void> => {
    try {
      await callFirebase("write", path, data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, [callFirebase]);

  /**
   * Update specific fields in a path (merges with existing data)
   */
  const updateData = useCallback(async (path: string, data: Record<string, any>): Promise<void> => {
    try {
      await callFirebase("update", path, data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, [callFirebase]);

  /**
   * Remove data from a path
   */
  const removeData = useCallback(async (path: string): Promise<void> => {
    try {
      await callFirebase("remove", path);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, [callFirebase]);

  /**
   * Push data to a path (creates a new child with auto-generated key)
   */
  const pushData = useCallback(async <T = any>(path: string, data: T): Promise<string | null> => {
    try {
      const result = await callFirebase<{ key?: string }>("push", path, data);
      return result?.key ?? null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, [callFirebase]);

  /**
   * Subscribe to real-time changes at a path
   * Returns an unsubscribe function
   */
  const subscribe = useCallback(<T = any>(
    path: string,
    callback: (data: T | null) => void
  ): (() => void) => {
    setError(null);
    const entry: SubEntry = { cancelled: false };
    subscriptionsRef.current.set(path, entry);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const poll = async () => {
      if (entry.cancelled) return;
      try {
        const value = await callFirebase<T>("read", path, undefined, true);
        if (entry.cancelled) return;
        callback(value ?? null);
        setData(value ?? null);
      } catch (err) {
        const nextError = err instanceof Error ? err : new Error('Unknown error');
        setError(nextError);
        callback(null);
      } finally {
        if (!entry.cancelled) {
          timeoutId = setTimeout(poll, 30000);
        }
      }
    };

    poll();

    entry.unsubscribe = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    return () => {
      entry.cancelled = true;
      entry.unsubscribe?.();
      subscriptionsRef.current.delete(path);
    };
  }, []);

  return {
    read,
    readOnce,
    write,
    updateData,
    removeData,
    push: pushData,
    subscribe,
    data,
    loading,
    error,
  };
};
