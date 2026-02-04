'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ref,
  set,
  update,
  remove,
  get,
  onValue,
  off,
  push,
  DataSnapshot
} from 'firebase/database';
import { database } from '@/app/lib/firebase';
import { ensureFirebaseAuth } from '@/app/lib/firebaseAuth';

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
    await ensureFirebaseAuth();
    try {
      setLoading(true);
      setError(null);
      const dbRef = ref(database, path);
      const snapshot = await get(dbRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as T;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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
    await ensureFirebaseAuth();
    try {
      setLoading(true);
      setError(null);
      const dbRef = ref(database, path);
      await set(dbRef, data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update specific fields in a path (merges with existing data)
   */
  const updateData = useCallback(async (path: string, data: Record<string, any>): Promise<void> => {
    await ensureFirebaseAuth();
    try {
      setLoading(true);
      setError(null);
      const dbRef = ref(database, path);
      await update(dbRef, data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Remove data from a path
   */
  const removeData = useCallback(async (path: string): Promise<void> => {
    await ensureFirebaseAuth();
    try {
      setLoading(true);
      setError(null);
      const dbRef = ref(database, path);
      await remove(dbRef);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Push data to a path (creates a new child with auto-generated key)
   */
  const pushData = useCallback(async <T = any>(path: string, data: T): Promise<string | null> => {
    await ensureFirebaseAuth();
    try {
      setLoading(true);
      setError(null);
      const dbRef = ref(database, path);
      const newRef = await push(dbRef, data);
      return newRef.key;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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

    ensureFirebaseAuth()
      .then(() => {
        if (entry.cancelled) return;
        const dbRef = ref(database, path);
        const unsubscribe = onValue(
          dbRef,
          (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
              const value = snapshot.val() as T;
              callback(value);
              setData(value);
            } else {
              callback(null);
              setData(null);
            }
          },
          (err) => {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            callback(null);
          }
        );
        entry.unsubscribe = () => {
          off(dbRef);
          unsubscribe();
        };
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        callback(null);
      });

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
