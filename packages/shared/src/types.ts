export type RiskLevel = "Toxic" | "Ineffective" | "Adjust Dosage" | "Safe" | "Unknown";
export type Phenotype = "PM" | "IM" | "NM" | "RM" | "UM";
export type ClinicalMode = "doctor" | "patient";
export type UserRole = "PATIENT" | "CLINICIAN" | "ADMIN";
export type AnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface DrugRisk {
  drug: string;
  risk: RiskLevel;
  phenotype: Phenotype;
  gene: string;
  diplotype: string;
  confidence: number;
  variantEvidence: number;
  guidelineMatch: number;
  dataCompleteness: number;
  clinicalNote: string;
  evidence: ("cpic" | "pharmgkb" | "fda")[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Analysis {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  status: AnalysisStatus;
  results?: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
  processingTime?: number;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  analysisId?: string;
  action: string;
  details?: any;
  timestamp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// WebSocket events
export interface WebSocketEvents {
  'authenticated': (data: { success: boolean; userId?: string; role?: string; error?: string }) => void;
  'analysis:created': (data: { analysisId: string; userId: string; timestamp: string }) => void;
  'analysis:completed': (data: { analysisId: string; results: any }) => void;
  'analysis:error': (data: { analysisId: string; userId: string; error: string }) => void;
  'activity:log': (data: ActivityLog) => void;
  'user:status': (data: { userId: string; status: string; timestamp: string }) => void;
  'user:disconnected': (data: { userId: string; timestamp: string }) => void;
}

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me'
  },
  ANALYSIS: {
    UPLOAD: '/api/analysis/upload',
    GET: '/api/analysis',
    GET_BY_ID: (id: string) => `/api/analysis/${id}`
  },
  PATIENTS: {
    GET_ALL: '/api/patients',
    GET_BY_ID: (id: string) => `/api/patients/${id}`,
    GET_ANALYSES: (id: string) => `/api/patients/${id}/analyses`
  },
  REPORTS: {
    GET_BY_ID: (id: string) => `/api/reports/${id}`,
    GENERATE: '/api/reports/generate'
  }
} as const;