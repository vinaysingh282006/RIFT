import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_ENDPOINTS, AuthResponse, ApiResponse, User, Analysis } from './types';

export class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<AuthResponse> | null = null;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (!this.refreshTokenPromise) {
            this.refreshTokenPromise = this.refreshToken();
          }

          try {
            const response = await this.refreshTokenPromise;
            localStorage.setItem('accessToken', response.tokens.accessToken);
            localStorage.setItem('refreshToken', response.tokens.refreshToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.tokens.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.refreshTokenPromise = null;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.data as AuthResponse;
  }

  // Auth methods
  async register(data: { email: string; password: string; firstName: string; lastName: string; role?: string }) {
    const response = await this.client.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  }

  // Analysis methods
  async uploadAnalysis(formData: FormData) {
    const response = await this.client.post<ApiResponse<Analysis>>(API_ENDPOINTS.ANALYSIS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getAnalysis(id: string) {
    const response = await this.client.get<ApiResponse<Analysis>>(API_ENDPOINTS.ANALYSIS.GET_BY_ID(id));
    return response.data;
  }

  async getAnalyses() {
    const response = await this.client.get<ApiResponse<Analysis[]>>(API_ENDPOINTS.ANALYSIS.GET);
    return response.data;
  }

  // Patient methods (clinician only)
  async getPatients() {
    const response = await this.client.get<ApiResponse<User[]>>(API_ENDPOINTS.PATIENTS.GET_ALL);
    return response.data;
  }

  async getPatient(id: string) {
    const response = await this.client.get<ApiResponse<User>>(API_ENDPOINTS.PATIENTS.GET_BY_ID(id));
    return response.data;
  }

  async getPatientAnalyses(patientId: string) {
    const response = await this.client.get<ApiResponse<Analysis[]>>(API_ENDPOINTS.PATIENTS.GET_ANALYSES(patientId));
    return response.data;
  }

  // Report methods
  async getReport(id: string) {
    const response = await this.client.get<ApiResponse<any>>(API_ENDPOINTS.REPORTS.GET_BY_ID(id));
    return response.data;
  }

  async generateReport(analysisId: string, format: string = 'json') {
    const response = await this.client.post<ApiResponse<any>>(API_ENDPOINTS.REPORTS.GENERATE, { analysisId, format });
    return response.data;
  }
}

// Create default instance
export const apiClient = new ApiClient();