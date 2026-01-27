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
 * Helper function to add Bearer token to headers
 */
function authHeaders(bearerToken: string | null | undefined, extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra && typeof extra === 'object' && !(extra instanceof Headers)
      ? (extra as Record<string, string>)
      : {}),
  };
  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }
  return headers;
}

/**
 * Hook for making API calls in client components
 * @param bearerToken - Optional ID/token sent as Bearer token in Authorization header
 * @returns Object with data, loading, error states and execute functions
 */
export function useApi<T = any>(bearerToken?: string | null): UseApiReturn<T> {
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
      const merged: RequestInit = {
        ...options,
        headers: authHeaders(bearerToken, options?.headers),
      };
      const result = await apiGet<T>(path, merged);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [bearerToken]);

  const executePost = useCallback(async (
    path: string,
    body?: any,
    options?: RequestInit
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const merged: RequestInit = {
        ...options,
        headers: authHeaders(bearerToken, options?.headers),
      };
      const result = await apiPost<T>(path, body, merged);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [bearerToken]);

  const executePut = useCallback(async (
    path: string,
    body?: any,
    options?: RequestInit
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const merged: RequestInit = {
        ...options,
        headers: authHeaders(bearerToken, options?.headers),
      };
      const result = await apiPut<T>(path, body, merged);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [bearerToken]);

  const executeDelete = useCallback(async (
    path: string,
    options?: RequestInit
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const merged: RequestInit = {
        ...options,
        headers: authHeaders(bearerToken, options?.headers),
      };
      const result = await apiDelete<T>(path, merged);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [bearerToken]);

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
