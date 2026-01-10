/**
 * API Service for backend communication
 */

import { Platform } from 'react-native';
// - iOS Simulator: use 'http://localhost:8000'
// - Android Emulator: use 'http://10.0.2.2:8000'
// - Physical Device: use your machine's local IP (e.g., 'http://192.168.1.81:8000')
//   Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
const API_BASE_URL = __DEV__ ? 'http://192.168.1.81:8000' : 'https://your-production-api.com'; // Production

export type Patient = {
  id?: string;
  name: string;
  date_of_birth: string; // YYYY-MM-DD
  sex?: string;
  height?: number; // cm
  weight?: number; // kg
  email?: string;
  phone?: string;
};

export type QuestionnaireSubmission = {
  id?: string;
  patient_id: string;
  answers: Record<string, string>; // question_id -> 'yes' | 'no'
  submitted_at?: string;
};

export type Contraindication = {
  id: string;
  question: string;
};

export type PatientStatus = {
  id?: string;
  patient_id: string;
  has_absolute: boolean;
  has_relative: boolean;
  absolute_contraindications: Contraindication[];
  relative_contraindications: Contraindication[];
  updated_at?: string;
};

export type ChecklistItem = {
  id: string;
  title: string;
  description?: string;
  is_complete: boolean;
  notes?: string;
  completed_at?: string;
  order: number;
  documents?: string[];
};

export type TransplantChecklist = {
  id?: string;
  patient_id: string;
  items: ChecklistItem[];
  created_at?: string;
  updated_at?: string;
};

class ApiService {
  public baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[API] Making request to: ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error: any) {
      // Handle network errors
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(
          `Unable to connect to server. Please ensure the backend is running at ${this.baseUrl}`
        );
      }
      throw error;
    }
  }

  async createPatient(patient: Patient): Promise<Patient> {
    return this.request<Patient>('/api/v1/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  }

  async getPatient(): Promise<Patient> {
    return this.request<Patient>('/api/v1/patients');
  }

  async submitQuestionnaire(submission: QuestionnaireSubmission): Promise<QuestionnaireSubmission> {
    return this.request<QuestionnaireSubmission>('/api/v1/questionnaire', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  async deletePatient(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/v1/patients', {
      method: 'DELETE',
    });
  }

  async getPatientStatus(): Promise<PatientStatus> {
    return this.request<PatientStatus>('/api/v1/patient-status');
  }

  async getChecklist(): Promise<TransplantChecklist> {
    return this.request<TransplantChecklist>('/api/v1/checklist');
  }

  async updateChecklistItem(
    itemId: string,
    updates: {
      is_complete?: boolean;
      completed_at?: string;
      notes?: string;
      documents?: string[];
    }
  ): Promise<TransplantChecklist> {
    return this.request<TransplantChecklist>(`/api/v1/checklist/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async uploadChecklistItemDocument(
    itemId: string,
    fileUri: string,
    fileName: string,
    fileType: string
  ): Promise<TransplantChecklist> {
    const url = `${this.baseUrl}/api/v1/checklist/items/${itemId}/documents`;
    console.log(`[API] Uploading file to: ${url}`);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: fileType,
    } as any);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let the browser set it with boundary
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error: any) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(
          `Unable to connect to server. Please ensure the backend is running at ${this.baseUrl}`
        );
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();
