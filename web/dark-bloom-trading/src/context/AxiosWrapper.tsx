// axiosWrapper.tsx
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useState, useEffect, useRef } from 'react';

// Types
interface ApiError {
  status: number | null;
  message: string;
  data: any;
}

interface TokenResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  authToken?: string;
  auth_token?: string;
}

interface AxiosWrapperOptions extends AxiosRequestConfig {
  timeout?: number;
}

type TokenUpdateCallback = (token: string | null) => void;

class AxiosWrapper {
  private instance: AxiosInstance;
  private tokenUpdateCallback: TokenUpdateCallback | null = null;
  private currentToken: string | null = null;

  constructor(baseURL: string = '', options: AxiosWrapperOptions = {}) {
    this.instance = axios.create({
      baseURL,
      timeout: options.timeout || 10000,
      withCredentials: true, // Enable cookies for HTTPS
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    this.setupInterceptors();
  }

  // Set callback function to update token in React state
  public setTokenUpdateCallback(callback: TokenUpdateCallback): void {
    this.tokenUpdateCallback = callback;
  }

  // Set current token (usually called from React component)
  public setToken(token: string | null): void {
    this.currentToken = token;
    if (token) {
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.instance.defaults.headers.common['Authorization'];
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add token to request if available
        if (this.currentToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.currentToken}`;
        }
        
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
      },
      (error: AxiosError) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Check for access token in response
        const newToken = this.extractTokenFromResponse(response);
        if (newToken && this.tokenUpdateCallback) {
          this.currentToken = newToken;
          this.tokenUpdateCallback(newToken);
          this.setToken(newToken);
        }

        return response;
      },
      (error: AxiosError) => {
        // Handle token expiration
        if (error.response?.status === 401) {
          console.warn('Unauthorized request - token may be expired');
          if (this.tokenUpdateCallback) {
            this.tokenUpdateCallback(null);
          }
          this.setToken(null);
        }

        console.error('Response interceptor error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Extract token from various possible response locations
  private extractTokenFromResponse(response: AxiosResponse): string | null {
    const data = response.data as TokenResponse;
    
    // Common token field names
    return (
      data?.accessToken ||
      data?.access_token ||
      data?.token ||
      data?.authToken ||
      data?.auth_token ||
      response.headers?.authorization?.replace('Bearer ', '') ||
      null
    );
  }

  // HTTP Methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Error handling
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        status: error.response.status,
        message: (error.response.data as any)?.message || error.message,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        status: null,
        message: 'Network error - no response received',
        data: null,
      };
    } else {
      // Something else happened
      return {
        status: null,
        message: error.message,
        data: null,
      };
    }
  }

  // Utility methods
  public setBaseURL(baseURL: string): void {
    this.instance.defaults.baseURL = baseURL;
  }

  public setTimeout(timeout: number): void {
    this.instance.defaults.timeout = timeout;
  }

  public setHeader(key: string, value: string): void {
    this.instance.defaults.headers.common[key] = value;
  }

  public removeHeader(key: string): void {
    delete this.instance.defaults.headers.common[key];
  }

  // Get current instance for advanced usage
  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

export default AxiosWrapper;

// React Hook Interface
interface UseAxiosWrapperReturn {
  api: AxiosWrapper | null;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  loading: boolean;
  error: ApiError | null;
  clearError: () => void;
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

// React Hook for easy integration
let apiRef: React.MutableRefObject<AxiosWrapper | null> = null;
export const useAxiosWrapper = (
  baseURL: string, 
  options: AxiosWrapperOptions = {}
): UseAxiosWrapperReturn => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  apiRef = useRef<AxiosWrapper | null>(null);
  
  useEffect(() => {
    // Initialize API wrapper
    if (!apiRef.current && apiRef) apiRef.current = new AxiosWrapper();
    
    // Set token update callback
    apiRef.current.setTokenUpdateCallback((token: string | null) => {
      setAccessToken(token);
    });

    return () => {
      apiRef.current = null;
    };
  }, [baseURL]);

  useEffect(() => {
    // Update token in wrapper when state changes
    if (apiRef.current && accessToken !== null) {
      apiRef.current.setToken(accessToken);
    }
  }, [accessToken]);

  // Wrapped API methods with loading/error handling
  const makeRequest = async <T = any>(
    method: keyof Pick<AxiosWrapper, 'get' | 'post' | 'put' | 'patch' | 'delete'>,
    ...args: any[]
  ): Promise<T> => {
    if (!apiRef.current) throw new Error('API wrapper not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await (apiRef.current[method] as any)(...args);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  return {
    api: apiRef.current,
    accessToken,
    setAccessToken,
    loading,
    error,
    clearError: () => setError(null),
    
    // HTTP methods
    get: <T = any>(url: string, config?: AxiosRequestConfig) => 
      makeRequest<T>('get', baseURL+url, config),
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      makeRequest<T>('post',  baseURL+url, data, config),
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      makeRequest<T>('put', baseURL+url, data, config),
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      makeRequest<T>('patch', baseURL+url, data, config),
    delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
      makeRequest<T>('delete', baseURL+url, config),
  };
};

// Types for common API responses
