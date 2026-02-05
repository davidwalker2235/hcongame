/**
 * API Client for backend communication
 * Works in both Server Side Rendering (SSR) and Client Side
 */

const BASE_URL = 'https://ernibots-api.enricd.com';

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  detail?: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

/**
 * Makes a GET request to the backend
 * @param path - The path to append to the base URL (e.g., '/api/users')
 * @param options - Optional fetch options
 * @returns Promise with the response data
 */
export async function get<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  try {
    const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error: ApiError = {
        message: `HTTP error! status: ${response.status}`,
        status: response.status,
        statusText: response.statusText,
      };
      throw error;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      const apiError: ApiError = {
        message: error.message,
      };
      throw apiError;
    }
    throw error;
  }
}

/**
 * Makes a POST request to the backend
 * @param path - The path to append to the base URL (e.g., '/api/users')
 * @param body - The request body (will be JSON stringified)
 * @param options - Optional fetch options
 * @returns Promise with the response data
 */
export async function post<T = any>(
  path: string,
  body?: any,
  options?: RequestInit
): Promise<T> {
  try {
    const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        // Si no se puede parsear como JSON, usar el mensaje por defecto
      }

      const error: ApiError = {
        message: errorData?.detail
          ? errorData.detail.map((d: any) => d.msg).join(', ')
          : `HTTP error! status: ${response.status}`,
        status: response.status,
        statusText: response.statusText,
        detail: errorData?.detail,
      };
      throw error;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      const apiError: ApiError = {
        message: error.message,
      };
      throw apiError;
    }
    throw error;
  }
}

/**
 * Makes a PUT request to the backend
 * @param path - The path to append to the base URL
 * @param body - The request body (will be JSON stringified)
 * @param options - Optional fetch options
 * @returns Promise with the response data
 */
export async function put<T = any>(
  path: string,
  body?: any,
  options?: RequestInit
): Promise<T> {
  try {
    const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        // Si no se puede parsear como JSON, usar el mensaje por defecto
      }

      const error: ApiError = {
        message: errorData?.detail
          ? errorData.detail.map((d: any) => d.msg).join(', ')
          : `HTTP error! status: ${response.status}`,
        status: response.status,
        statusText: response.statusText,
        detail: errorData?.detail,
      };
      throw error;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      const apiError: ApiError = {
        message: error.message,
      };
      throw error;
    }
    throw error;
  }
}

/**
 * Makes a DELETE request to the backend
 * @param path - The path to append to the base URL
 * @param options - Optional fetch options
 * @returns Promise with the response data
 */
export async function del<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  try {
    const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        // Si no se puede parsear como JSON, usar el mensaje por defecto
      }

      const error: ApiError = {
        message: errorData?.detail 
          ? errorData.detail.map((d: any) => d.msg).join(', ')
          : `HTTP error! status: ${response.status}`,
        status: response.status,
        statusText: response.statusText,
        detail: errorData?.detail,
      };
      throw error;
    }

    // DELETE might not return a body
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data as T;
    }
    
    return {} as T;
  } catch (error) {
    if (error instanceof Error) {
      const apiError: ApiError = {
        message: error.message,
      };
      throw apiError;
    }
    throw error;
  }
}
