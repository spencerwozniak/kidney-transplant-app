/**
 * API Service for backend communication
 */

const API_BASE_URL = __DEV__
  ? 'http://0.0.0.0:8000' // Development
  : 'https://your-production-api.com'; // Production

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
  results?: Record<string, any>;
  submitted_at?: string;
};

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

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
    return this.request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  }

  async getPatient(): Promise<Patient> {
    return this.request<Patient>('/patients');
  }

  async submitQuestionnaire(submission: QuestionnaireSubmission): Promise<QuestionnaireSubmission> {
    return this.request<QuestionnaireSubmission>('/questionnaire', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }
}

export const apiService = new ApiService();
