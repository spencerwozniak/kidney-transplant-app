/**
 * API Service for backend communication
 */

const API_BASE_URL = __DEV__
  ? 'http://localhost:8000' // Development
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
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
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
