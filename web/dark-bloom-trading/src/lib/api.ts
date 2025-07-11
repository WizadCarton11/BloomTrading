import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Define types for our API wrapper
export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
  code?: string;
}

export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: ApiError | null;
}

// Event types for state management
export type StateChangeListener = (state: { loading: LoadingState; errors: ErrorState }) => void;

class ApiService {
  private axiosInstance: AxiosInstance;
  private currentBaseURL: string = '';
  private loadingState: LoadingState = {};
  private errorState: ErrorState = {};
  private listeners: StateChangeListener[] = [];

  constructor(config: ApiConfig = {}) {
    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: config.baseURL || '',
      timeout: config.timeout || 10000,
      withCredentials: true, // Enable cookies
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.currentBaseURL = config.baseURL || '';
    this.setupInterceptors();
  }

  // Setup request and response interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // You can modify requests here (e.g., add auth tokens)
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Handle errors consistently
  private handleError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: error.message || 'An unknown error occurred',
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
    };

    // Enhanced error messages based on status codes
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          apiError.message = typeof error.response.data === 'object' && error.response.data && 'message' in error.response.data 
            ? String(error.response.data.message) 
            : 'Bad Request - Invalid data provided';
          break;
        case 401:
          apiError.message = 'Unauthorized - Please log in again';
          break;
        case 403:
          apiError.message = 'Forbidden - You do not have permission to access this resource';
          break;
        case 404:
        case 422:
          apiError.message = typeof error.response.data === 'object' && error.response.data && 'message' in error.response.data 
            ? String(error.response.data.message) 
            : 'Validation Error - Please check your input';
          break;
        case 429:
          apiError.message = 'Too Many Requests - Please try again later';
          break;
        case 500:
          apiError.message = 'Internal Server Error - Please try again later';
          break;
        case 502:
          apiError.message = 'Bad Gateway - Server is temporarily unavailable';
          break;
        case 503:
          apiError.message = 'Service Unavailable - Server is temporarily down';
          break;
        default:
          apiError.message = `Server Error (${error.response.status}) - ${error.response.statusText}`;
      }
    } else if (error.code === 'ECONNABORTED') {
      apiError.message = 'Request timed out - Please check your connection and try again';
    } else if (error.code === 'ERR_NETWORK') {
      apiError.message = 'Network Error - Please check your internet connection';
    }

    // Log error for debugging
    console.error('API Error:', apiError);

    return apiError;
  }

  // State management methods
  private setLoading(key: string, loading: boolean): void {
    this.loadingState[key] = loading;
    this.notifyListeners();
  }

  private setError(key: string, error: ApiError | null): void {
    this.errorState[key] = error;
    this.notifyListeners();
  }

  private clearError(key: string): void {
    delete this.errorState[key];
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener({
        loading: { ...this.loadingState },
        errors: { ...this.errorState }
      });
    });
  }

  // Public state management methods
  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getLoadingState(): LoadingState {
    return { ...this.loadingState };
  }

  public getErrorState(): ErrorState {
    return { ...this.errorState };
  }

  public isLoading(key?: string): boolean {
    if (key) {
      return this.loadingState[key] || false;
    }
    return Object.values(this.loadingState).some(loading => loading);
  }

  public hasError(key?: string): boolean {
    if (key) {
      return !!this.errorState[key];
    }
    return Object.values(this.errorState).some(error => error !== null);
  }

  public getError(key: string): ApiError | null {
    return this.errorState[key] || null;
  }

  public clearAllErrors(): void {
    this.errorState = {};
    this.notifyListeners();
  }

  public clearErrorByKey(key: string): void {
    this.clearError(key);
  }

  // Enhanced HTTP methods with loading and error states
  private async executeRequest<T>(
    requestKey: string,
    requestFn: () => Promise<AxiosResponse<T>>
  ): Promise<ApiResponse<T>> {
    this.setLoading(requestKey, true);
    this.clearError(requestKey);

    try {
      const response = await requestFn();
      this.setLoading(requestKey, false);
      
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      this.setLoading(requestKey, false);
      const apiError = error as ApiError;
      this.setError(requestKey, apiError);
      throw apiError;
    }
  }

  // Dynamically change base URL
  public setBaseURL(baseURL: string): void {
    this.currentBaseURL = baseURL;
    this.axiosInstance.defaults.baseURL = baseURL;
    console.log(`Base URL updated to: ${baseURL}`);
  }

  // Get current base URL
  public getBaseURL(): string {
    return this.currentBaseURL;
  }

  // Update default headers
  public setHeaders(headers: Record<string, string>): void {
    Object.assign(this.axiosInstance.defaults.headers.common, headers);
  }

  // Remove headers
  public removeHeader(headerName: string): void {
    delete this.axiosInstance.defaults.headers.common[headerName];
  }

  // Set timeout
  public setTimeout(timeout: number): void {
    this.axiosInstance.defaults.timeout = timeout;
  }

  // Enhanced HTTP Methods with loading states
  public async get<T = any>(
    url: string, 
    config?: AxiosRequestConfig,
    requestKey?: string
  ): Promise<ApiResponse<T>> {
    const key = requestKey || `GET:${url}`;
    return this.executeRequest(key, () => this.axiosInstance.get<T>(url, config));
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    requestKey?: string
  ): Promise<ApiResponse<T>> {
    const key = requestKey || `POST:${url}`;
    return this.executeRequest(key, () => this.axiosInstance.post<T>(url, data, config));
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    requestKey?: string
  ): Promise<ApiResponse<T>> {
    const key = requestKey || `PUT:${url}`;
    return this.executeRequest(key, () => this.axiosInstance.put<T>(url, data, config));
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    requestKey?: string
  ): Promise<ApiResponse<T>> {
    const key = requestKey || `PATCH:${url}`;
    return this.executeRequest(key, () => this.axiosInstance.patch<T>(url, data, config));
  }

  public async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig,
    requestKey?: string
  ): Promise<ApiResponse<T>> {
    const key = requestKey || `DELETE:${url}`;
    return this.executeRequest(key, () => this.axiosInstance.delete<T>(url, config));
  }

  // Upload file with progress tracking
  public async uploadFile<T = any>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void,
    requestKey?: string
  ): Promise<ApiResponse<T>> {
    const key = requestKey || `UPLOAD:${url}`;
    const formData = new FormData();
    formData.append('file', file);

    return this.executeRequest(key, () => 
      this.axiosInstance.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      })
    );
  }

  // Cancel request functionality
  public createCancelToken() {
    return axios.CancelToken.source();
  }

  // Get the raw axios instance for advanced usage
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// React Hook for using API service states
import { useState, useEffect } from 'react';

export const useApiState = (apiService: ApiService) => {
  const [state, setState] = useState({
    loading: apiService.getLoadingState(),
    errors: apiService.getErrorState(),
  });

  useEffect(() => {
    const unsubscribe = apiService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [apiService]);

  return {
    loading: state.loading,
    errors: state.errors,
    isLoading: (key?: string) => apiService.isLoading(key),
    hasError: (key?: string) => apiService.hasError(key),
    getError: (key: string) => apiService.getError(key),
    clearError: (key: string) => apiService.clearErrorByKey(key),
    clearAllErrors: () => apiService.clearAllErrors(),
  };
};

// Create and export service instances
export const AuthService = new ApiService({
  baseURL: import.meta.env.VITE_API_AUTH_BACKEND_URL,
  timeout: 15000,
});

export const MarketService = new ApiService({
  baseURL: import.meta.env.VITE_API_STOCK_BACKEND_URL,
  timeout: 15000,
});
export const BankService = new ApiService({
  baseURL: import.meta.env.VITE_API_BANK_BACKEND_URL,
  timeout: 15000,
});
export const AIChatService = new ApiService({
  baseURL: import.meta.env.VITE_API_AI_CHAT_BACKEND_URL,
  timeout: 15000,
});
// Export the class for creating additional instances if needed
export { ApiService };

// Usage examples:
/*
// Basic usage with automatic loading states
const UserComponent = () => {
  const authState = useApiState(AuthService);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await AuthService.get('/users', undefined, 'fetchUsers');
      setUsers(response.data);
    } catch (error) {
      // Error is automatically stored in state
      console.error('Failed to fetch users');
    }
  };

  return (
    <div>
      {authState.isLoading('fetchUsers') && <div>Loading users...</div>}
      {authState.hasError('fetchUsers') && (
        <div className="error">
          Error: {authState.getError('fetchUsers')?.message}
          <button onClick={() => authState.clearError('fetchUsers')}>
            Clear Error
          </button>
        </div>
      )}
      <button onClick={fetchUsers}>Fetch Users</button>
      <UserList users={users} />
    </div>
  );
};

// Multiple requests with different keys
const DashboardComponent = () => {
  const authState = useApiState(AuthService);
  const marketState = useApiState(MarketService);

  useEffect(() => {
    AuthService.get('/profile', undefined, 'userProfile');
    MarketService.get('/stocks', undefined, 'stockData');
  }, []);

  return (
    <div>
      {authState.isLoading('userProfile') && <div>Loading profile...</div>}
      {marketState.isLoading('stockData') && <div>Loading stocks...</div>}
      
      {authState.hasError() && <div>Auth Error!</div>}
      {marketState.hasError() && <div>Market Error!</div>}
    </div>
  );
};
*/