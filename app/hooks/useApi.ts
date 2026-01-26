'use client';

/**
 * React Hook for making API calls from client components
 * For Server Side Rendering, use the functions directly from app/lib/api.ts
 */

import { useState, useCallback } from 'react';
import { get as apiGet, post as apiPost, put as apiPut, del as apiDelete, ApiError } from '../lib/api';

interface UseApiReturn<T = any> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  executeGet: (path: string, options?: RequestInit) => Promise<T | null>;
  executePost: (path: string, body?: any, options?: RequestInit) => Promise<T | null>;
  executePut: (path: string, body?: any, options?: RequestInit) => Promise<T | null>;
  executeDelete: (path: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for making API calls in client components
 * @returns Object with data, loading, error states and execute functions
 */
export function useApi<T = any>(): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const executeGet = useCallback(async (
    path: string,
    options?: RequestInit
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<T>(path, options);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const executePost = useCallback(async (
    path: string,
    body?: any,
    options?: RequestInit
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiPost<T>(path, body, options);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const executePut = useCallback(async (
    path: string,
    body?: any,
    options?: RequestInit
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiPut<T>(path, body, options);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeDelete = useCallback(async (
    path: string,
    options?: RequestInit
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiDelete<T>(path, options);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    executeGet,
    executePost,
    executePut,
    executeDelete,
    reset,
  };
}
