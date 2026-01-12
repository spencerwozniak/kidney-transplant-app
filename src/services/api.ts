/**
 * API Service for backend communication
 */

// Local (e.g., 'http://192.168.1.81:8000')
// Connect to AWS EC2 server: (e.g., 'http://3.21.125.231:8000')

const API_BASE_URL = 'http://192.168.1.81:8000';

export type Patient = {
  id?: string;
  name: string;
  date_of_birth: string; // YYYY-MM-DD
  sex?: string;
  height?: number; // cm
  weight?: number; // kg
  email?: string;
  phone?: string;
  has_ckd_esrd?: boolean;
  last_gfr?: number;
  has_referral?: boolean;
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
  pathway_stage?: string; // 'identification' | 'referral' | 'evaluation' | 'selection' | 'transplantation' | 'post-transplant'
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

export type FinancialProfile = {
  id?: string;
  patient_id: string;
  answers: Record<string, string | null>; // question_id -> answer or null
  submitted_at?: string;
  updated_at?: string;
};

export type TransplantCenter = {
  center_id: string;
  name: string;
  location: {
    city: string;
    state: string;
    zip?: string;
    lat?: number;
    lng?: number;
  };
  distance_miles?: number;
  referral_required: boolean;
  self_referral_allowed: boolean;
  who_can_refer: string[];
  contact: {
    referral_phone: string;
    referral_fax?: string;
    website?: string;
  };
  insurance_compatible: boolean;
};

export type PatientReferralState = {
  patient_id: string;
  location: {
    zip?: string;
    state?: string;
    lat?: number;
    lng?: number;
  };
  has_referral: boolean;
  referral_source?: string | null;
  last_nephrologist?: {
    name?: string | null;
    clinic?: string | null;
  } | null;
  dialysis_center?: {
    name?: string | null;
    social_worker_contact?: string | null;
  } | null;
  preferred_centers: string[];
  referral_status: 'not_started' | 'in_progress' | 'completed';
};

export type ReferralPathway = {
  pathway: 'nephrologist_referral' | 'dialysis_center_referral' | 'no_provider';
  guidance: {
    title: string;
    steps?: string[];
    script?: string;
    what_to_send?: string[];
    paths?: Array<{
      name: string;
      description: string;
      action: string;
    }>;
  };
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

      // Log status for debugging/demo
      console.log(`[API] Response status for ${url}: ${response.status} ${response.statusText}`);

      // Read response body as text for logging and parsing
      const respText = await response.text();
      if (respText) {
        try {
          const parsed = JSON.parse(respText);
          console.log(`[API] Response body for ${url}:`, parsed);
        } catch {
          console.log(`[API] Response body (non-JSON) for ${url}:`, respText);
        }
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const error = respText ? JSON.parse(respText) : null;
          errorMessage = (error && (error.detail || error.message)) || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Try to return parsed JSON if present, otherwise an empty object
      if (!respText) return {} as T;
      try {
        return JSON.parse(respText) as T;
      } catch (err) {
        // If parsing fails, return text as unknown
        return respText as unknown as T;
      }
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

  async getQuestionnaire(): Promise<QuestionnaireSubmission> {
    return this.request<QuestionnaireSubmission>('/api/v1/questionnaire');
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

  async saveFinancialProfile(profile: FinancialProfile): Promise<FinancialProfile> {
    return this.request<FinancialProfile>('/api/v1/financial-profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async submitFinancialProfile(profile: FinancialProfile): Promise<FinancialProfile> {
    return this.request<FinancialProfile>('/api/v1/financial-profile/submit', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async getFinancialProfile(): Promise<FinancialProfile> {
    return this.request<FinancialProfile>('/api/v1/financial-profile');
  }

  // Transplant Access Navigator APIs
  async findNearbyCenters(params: {
    zip_code?: string;
    state?: string;
    lat?: number;
    lng?: number;
    insurance_type?: string;
  }): Promise<TransplantCenter[]> {
    const queryParams = new URLSearchParams();
    if (params.zip_code) queryParams.append('zip_code', params.zip_code);
    if (params.state) queryParams.append('state', params.state);
    if (params.lat !== undefined) queryParams.append('lat', params.lat.toString());
    if (params.lng !== undefined) queryParams.append('lng', params.lng.toString());
    if (params.insurance_type) queryParams.append('insurance_type', params.insurance_type);

    return this.request<TransplantCenter[]>(`/api/v1/centers/nearby?${queryParams.toString()}`);
  }

  async getReferralState(): Promise<PatientReferralState> {
    return this.request<PatientReferralState>('/api/v1/referral-state');
  }

  async updateReferralState(state: Partial<PatientReferralState>): Promise<PatientReferralState> {
    return this.request<PatientReferralState>('/api/v1/referral-state', {
      method: 'POST',
      body: JSON.stringify(state),
    });
  }

  async getReferralPathway(): Promise<ReferralPathway> {
    return this.request<ReferralPathway>('/api/v1/referral-pathway');
  }

  // AI Assistant APIs
  async queryAIAssistant(params: {
    query: string;
    provider?: string;
    model?: string;
  }): Promise<{ response: string; context_summary: Record<string, any> }> {
    const body: { query: string; provider?: string; model?: string } = {
      query: params.query,
    };
    if (params.provider) body.provider = params.provider;
    if (params.model) body.model = params.model;

    return this.request<{ response: string; context_summary: Record<string, any> }>(
      '/api/v1/ai-assistant/query',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  async queryAIAssistantStream(
    params: {
      query: string;
      provider?: string;
      model?: string;
    },
    onChunk: (chunk: string) => void,
    onError?: (error: string) => void,
    onComplete?: () => void
  ): Promise<void> {
    const body: { query: string; provider?: string; model?: string } = {
      query: params.query,
    };
    if (params.provider) body.provider = params.provider;
    if (params.model) body.model = params.model;

    const url = `${this.baseUrl}/api/v1/ai-assistant/query/stream`;

    // Use XMLHttpRequest for React Native streaming support
    // React Native's fetch doesn't support streaming (response.body is null)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      let buffer = '';
      let lastProcessedIndex = 0;
      let isDone = false;

      xhr.onprogress = () => {
        // Process new data as it arrives incrementally
        const currentLength = xhr.responseText.length;
        if (currentLength > lastProcessedIndex) {
          const newData = xhr.responseText.substring(lastProcessedIndex);
          lastProcessedIndex = currentLength;

          buffer += newData;
          const lines = buffer.split('\n');

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.error) {
                  if (onError) {
                    onError(data.error);
                  }
                  xhr.abort();
                  reject(new Error(data.error));
                  return;
                }
                if (data.done) {
                  isDone = true;
                  if (onComplete) {
                    onComplete();
                  }
                  resolve();
                  return;
                }
                if (data.chunk !== undefined) {
                  onChunk(data.chunk);
                }
              } catch (e) {
                // Skip invalid JSON lines
                console.warn('Failed to parse SSE data:', line, e);
              }
            }
          }
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Process any remaining buffer
          if (buffer.trim()) {
            const lines = buffer.trim().split('\n');
            for (const line of lines) {
              if (line.trim() && line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.error && onError) {
                    onError(data.error);
                  } else if (data.done && !isDone) {
                    if (onComplete) {
                      onComplete();
                    }
                  } else if (data.chunk !== undefined) {
                    onChunk(data.chunk);
                  }
                } catch (e) {
                  console.warn('Failed to parse final SSE data:', line, e);
                }
              }
            }
          }

          // Ensure complete is called if not already done
          if (!isDone && onComplete) {
            onComplete();
          }
          if (!isDone) {
            resolve();
          }
        } else {
          let errorMessage = `HTTP error! status: ${xhr.status}`;
          try {
            const error = xhr.responseText ? JSON.parse(xhr.responseText) : null;
            errorMessage =
              (error && (error.detail || error.message || error.error)) || errorMessage;
          } catch {
            errorMessage = xhr.statusText || errorMessage;
          }
          if (onError) {
            onError(errorMessage);
          }
          reject(new Error(errorMessage));
        }
      };

      xhr.onerror = () => {
        const errorMsg = `Unable to connect to server. Please ensure the backend is running at ${this.baseUrl}`;
        if (onError) {
          onError(errorMsg);
        }
        reject(new Error(errorMsg));
      };

      xhr.ontimeout = () => {
        const errorMsg = 'Request timeout';
        if (onError) {
          onError(errorMsg);
        }
        reject(new Error(errorMsg));
      };

      // Set timeout to 5 minutes for long responses
      xhr.timeout = 300000;

      try {
        xhr.send(JSON.stringify(body));
      } catch (error: any) {
        if (onError) {
          onError(error.message || 'Unknown error occurred');
        }
        reject(error);
      }
    });
  }

  async getAIContext(): Promise<{ patient_id: string; context: Record<string, any> }> {
    return this.request<{ patient_id: string; context: Record<string, any> }>(
      '/api/v1/ai-assistant/context'
    );
  }

  async getAIStatus(): Promise<{
    enabled: boolean;
    provider: string | null;
    message: string;
  }> {
    return this.request<{ enabled: boolean; provider: string | null; message: string }>(
      '/api/v1/ai-assistant/status'
    );
  }
}

export const apiService = new ApiService();
