/**
 * API Service for backend communication
 */

// Small debug flag: true in development builds or when __DEV__ is set
const IS_DEBUG =
  (typeof __DEV__ !== 'undefined' && (__DEV__ as boolean)) ||
  (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');

function devLog(...args: any[]) {
  if (IS_DEBUG) console.log(...args);
}
function devInfo(...args: any[]) {
  if (IS_DEBUG) console.info(...args);
}
function devWarn(...args: any[]) {
  if (IS_DEBUG) console.warn(...args);
}

// Device ID management - single source of truth
// getOrCreateDeviceId will synchronously return an ID when possible (web/localStorage)
// and will attempt to persist it to AsyncStorage on native platforms asynchronously.
const generateDeviceId = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const getOrCreateDeviceId = (): string => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      let id = window.localStorage.getItem('device_id');
      if (!id) {
          devLog('[API] Generating new device id');
        console.time('deviceId:generate');
        id = generateDeviceId();
        window.localStorage.setItem('device_id', id);
        console.timeEnd('deviceId:generate');
      }
      return id;
    }

    // Non-web: try to read from AsyncStorage synchronously is not possible.
    // We'll fallback to environment variable or generate and attempt to persist asynchronously.
    let id = (globalThis as any).__DEVICE_ID__ as string | undefined;
    if (!id) {
      id = generateDeviceId();
      (globalThis as any).__DEVICE_ID__ = id;

      // Try to persist asynchronously without blocking execution
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        AsyncStorage.setItem('device_id', id).catch(() => {
          /* ignore */
        });
      } catch (e) {
        // AsyncStorage not available or require failed; ignore
      }
    }
    return id;
  } catch (e) {
    // As a last resort generate a transient id
    return generateDeviceId();
  }
};

const DEVICE_ID = getOrCreateDeviceId();

// Instrument global network APIs to detect rogue same-origin '/patients' calls in development only
try {
  if (IS_DEBUG && typeof window !== 'undefined') {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async function (input: RequestInfo, init?: RequestInit) {
      try {
        let url = '';
        if (typeof input === 'string') url = input;
        else if (input instanceof Request) url = input.url;

        // If the url is relative (starts with '/') and targets '/patients', log stack
        if (url && /^\/patients(?:$|[?#\/])/.test(url)) {
          const stack = new Error('Rogue /patients fetch detected').stack;
          console.error('[API][rogue] fetch called with relative /patients URL:', url, '\nStack:', stack);
        } else {
          // also check absolute same-origin host but missing /api/v1
          try {
            const resolved = new URL(url, window.location.href);
            if (resolved.host === window.location.host && /^\/patients(?:$|[?#\/])/.test(resolved.pathname)) {
              const stack = new Error('Rogue same-origin /patients fetch detected').stack;
              console.error('[API][rogue] fetch called to same-origin /patients URL:', resolved.href, '\nStack:', stack);
            }
          } catch (e) {
            // ignore invalid URLs
          }
        }
      } catch (e) {
        // ignore instrumentation errors
      }
      return originalFetch(input, init);
    } as typeof fetch;

    const origXOpen = XMLHttpRequest.prototype.open;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    XMLHttpRequest.prototype.open = function (method: string, url?: string | URL | null) {
      try {
        const u = String(url || '');
        if (/^\/patients(?:$|[?#\/])/.test(u)) {
          const stack = new Error('Rogue /patients XHR detected').stack;
          console.error('[API][rogue] XHR.open called with relative /patients URL:', u, '\nStack:', stack);
        } else {
          try {
            const resolved = new URL(u, window.location.href);
            if (resolved.host === window.location.host && /^\/patients(?:$|[?#\/])/.test(resolved.pathname)) {
              const stack = new Error('Rogue same-origin /patients XHR detected').stack;
              console.error('[API][rogue] XHR.open called to same-origin /patients URL:', resolved.href, '\nStack:', stack);
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        // ignore
      }
      // @ts-ignore
      return origXOpen.apply(this, arguments as any);
    };
  }
} catch (e) {
  // swallow instrumentation errors to avoid breaking runtime
}

const getApiBaseUrl = (): string => {
  // Prefer explicit base URL env var (can include /api/v1)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;
    if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
    // Backwards compatible fallbacks
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  }

  // Production builds should use same-origin relative API path by default.
  // This prevents production bundles from unintentionally pointing at localhost.
  try {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
      return '/api/v1';
    }
  } catch (e) {
    // ignore
  }

  // Development fallback: localhost backend for dev only.
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl().trim().replace(/\/+$/, '');

// Log the resolved API base URL and warn about mixed-content only in dev
if (typeof window !== 'undefined') {
  devLog('[API] Resolved API base URL:', API_BASE_URL);
  try {
    const runningHttps = window.location?.protocol === 'https:';
    if (runningHttps && API_BASE_URL.startsWith('http://')) {
      devWarn('[API] Warning: app is running on https but API base URL uses http. Browser may block requests.');
      // Only recommend tunneling during development
      try {
        if (IS_DEBUG) {
          devWarn('[API] Recommendation: use an https tunnel or set EXPO_PUBLIC_API_BASE_URL to an https endpoint for web testing.');
        }
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // ignore
  }
}

export type Patient = {
  id?: string;
  name: string;
  date_of_birth: string; // YYYY-MM-DD
  sex?: string;
  height_cm?: number; // cm
  weight_kg?: number; // kg
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
    city?: string;
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
  private _patientLogEmitted = false;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.buildUrl(endpoint);
    const method = (options.method || 'GET').toUpperCase();
    devLog(`[API] Making request to: ${url} [method=${method}]`);
    // Definitive trace for debugging relative URL issues
    try {
      const resolvedBase = this.baseUrl || API_BASE_URL;
      console.log(`[API][trace] endpoint='${endpoint}' baseUrl='${resolvedBase}' fullUrl='${url}'`);
    } catch (e) {
      // ignore
    }

    // Use canonical device id
    const deviceId = DEVICE_ID || getOrCreateDeviceId();

    const timingLabel = `API ${endpoint}`;
    try {
      console.time(timingLabel);
      performance?.mark?.(`${timingLabel}:start`);
      // Log device id for debugging backend mapping issues (dev only)
      devLog(`[API] X-Device-ID: ${deviceId}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': deviceId,
          ...options.headers,
        },
      });

      // Log status for debugging/demo
      devLog(`[API] Response status for ${url}: ${response.status} ${response.statusText}`);

      // Read response body as text for logging and parsing
      const respText = await response.text();
      if (respText) {
        try {
          const parsed = JSON.parse(respText);
          devLog(`[API] Response body for ${url}:`, parsed);
        } catch {
          devLog(`[API] Response body (non-JSON) for ${url}:`, respText);
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

        // Handle questionnaire GET 404 as an expected 'not yet created' state.
        if (response.status === 404 && endpoint.includes('/questionnaire') && method === 'GET') {
          console.info(`[API] No questionnaire found (404) for ${url}; returning null`);
          console.log('[API][trace] questionnaire request', { endpoint, method, url });
          console.timeEnd(timingLabel);
          performance?.mark?.(`${timingLabel}:end`);
          performance?.measure?.(timingLabel, `${timingLabel}:start`, `${timingLabel}:end`);
          return null as unknown as T;
        }

        // Guardrail: convert server 404 "no patient found" into a well-known error
        if (
          response.status === 404 &&
          (endpoint.includes('/patient-status') || endpoint.includes('/checklist') || endpoint.includes('/patients'))
        ) {
          const lower = (errorMessage || '').toLowerCase();
          if (lower.includes('no patient') || lower.includes('patient not found')) {
            console.warn(`[API] Patient not found (device=${deviceId}) for ${endpoint}`);
            const err = new Error(`PATIENT_NOT_FOUND: ${errorMessage}`);
            (err as any).code = 'PATIENT_NOT_FOUND';
            throw err;
          }
        }

        throw new Error(errorMessage);
      }

      // Try to return parsed JSON if present, otherwise an empty object
      if (!respText) {
        console.timeEnd(timingLabel);
        performance?.mark?.(`${timingLabel}:end`);
        performance?.measure?.(timingLabel, `${timingLabel}:start`, `${timingLabel}:end`);
        return {} as T;
      }
      try {
        const parsed = JSON.parse(respText) as T;

        // Cache common resources locally for faster startup
        try {
          if (endpoint === '/api/v1/patients') {
              this.saveCache('patient', parsed);
            } else if (endpoint === '/api/v1/patient-status') {
              this.saveCache('patient_status', parsed);
            } else if (endpoint === '/api/v1/checklist') {
              this.saveCache('checklist', parsed);
            }
        } catch (e) {
          // ignore cache errors
        }

        console.timeEnd(timingLabel);
        performance?.mark?.(`${timingLabel}:end`);
        performance?.measure?.(timingLabel, `${timingLabel}:start`, `${timingLabel}:end`);

        return parsed;
      } catch (err) {
        // If parsing fails, return text as unknown
        console.timeEnd(timingLabel);
        performance?.mark?.(`${timingLabel}:end`);
        performance?.measure?.(timingLabel, `${timingLabel}:start`, `${timingLabel}:end`);
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

  // Build an absolute URL from the configured base and an endpoint
  private buildUrl(endpoint: string) {
    // If endpoint is already absolute, return as-is
    if (/^https?:\/\//i.test(endpoint)) return endpoint;

    const base = (this.baseUrl || API_BASE_URL || '').replace(/\/+$/, '');
    let ep = (endpoint || '').replace(/^\/+/, '');

    // If both base and endpoint contain api/v1, remove duplicate
    if (/\/api\/v1$/i.test(base) && /^api\/v1/i.test(ep)) {
      ep = ep.replace(/^api\/v1\/?/i, '');
    }

    return `${base}/${ep}`;
  }

  // Public helper to construct a URL for external callers (pages/components)
  // Uses the same normalization as private buildUrl
  public makeUrl(endpoint: string) {
    return this.buildUrl(endpoint);
  }

  // Simple cross-platform cache helper using localStorage on web and AsyncStorage on native if available
  // Stored value shape: { ts: number, ttl: number, data: any }
  private saveCache(key: string, value: any, ttlMs = 1000 * 60 * 5) {
    const payload = {
      ts: Date.now(),
      ttl: ttlMs,
      data: value,
    };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(payload));
        console.log(`[API][cache] save '${key}' (ttl=${ttlMs}ms)`);
      } else {
        // Try AsyncStorage if available
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          AsyncStorage.setItem(key, JSON.stringify(payload));
          console.log(`[API][cache] save '${key}' (ttl=${ttlMs}ms) [AsyncStorage]`);
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Load cached value and return meta about expiry.
   * If ttlMs is provided, it will override stored ttl for expiry checks.
   */
  public loadCached<T>(key: string, ttlMs?: number): { data: T | null; expired: boolean; ts?: number } {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const v = window.localStorage.getItem(key);
        if (!v) {
          console.log(`[API][cache] miss '${key}'`);
          return { data: null, expired: true };
        }
        const parsed = JSON.parse(v) as { ts?: number; ttl?: number; data?: T };
        const ts = parsed?.ts || 0;
        const storedTtl = parsed?.ttl ?? (1000 * 60 * 5);
        const effectiveTtl = ttlMs ?? storedTtl;
        const expired = Date.now() > ts + effectiveTtl;
        if (expired) {
          console.log(`[API][cache] expired '${key}' (ts=${ts}, ttl=${effectiveTtl}ms)`);
        } else {
          console.log(`[API][cache] hit '${key}' (ts=${ts}, ttl=${effectiveTtl}ms)`);
        }
        return { data: parsed?.data ?? null, expired, ts };
      } else {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          // Note: AsyncStorage is async; returning null for native synchronous path
          return { data: null, expired: true };
        } catch (e) {
          return { data: null, expired: true };
        }
      }
    } catch (e) {
      return { data: null, expired: true };
    }
  }

  // Remove a cache key from storage (localStorage on web, AsyncStorage on native when available)
  public clearCacheKey(key: string) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const prev = window.localStorage.getItem(key);
        try {
          console.log(`[API][cache] clearing '${key}', previous value:`, prev ? JSON.parse(prev) : null);
        } catch (e) {
          console.log(`[API][cache] clearing '${key}', previous (raw):`, prev);
        }
        window.localStorage.removeItem(key);
      } else {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          AsyncStorage.removeItem(key).catch(() => {});
          console.log(`[API][cache] requested clear '${key}' [AsyncStorage]`);
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Convenience: clear common patient-related caches to avoid leaking state between accounts
  public clearPatientCaches() {
    const keys = ['patient_status', 'checklist', 'questionnaire', 'referral_state', 'financial_profile'];
    keys.forEach((k) => this.clearCacheKey(k));
  }

  async createPatient(patient: Patient): Promise<Patient> {
    // One-time diagnostic: log resolved API base and full patient URL
    try {
      if (!this._patientLogEmitted) {
        const url = this.makeUrl('/api/v1/patients');
        console.log('[API][patient] Resolved API base URL (createPatient):', API_BASE_URL);
        console.log('[API][patient] Full createPatient URL:', url);
        this._patientLogEmitted = true;
      }
    } catch (e) {
      // ignore
    }

    // Dev logging for payload details
    if (IS_DEBUG) {
      devLog('[API][Dev] createPatient payload:', {
        date_of_birth: patient.date_of_birth,
        sex: patient.sex,
        height_cm: patient.height_cm,
        weight_kg: patient.weight_kg,
        has_ckd_esrd: patient.has_ckd_esrd,
        last_gfr: patient.last_gfr,
      });
    }

    const resp = await this.request<Patient>('/api/v1/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });

    // Dev logging for response verification
    if (IS_DEBUG) {
      devLog('[API][Dev] createPatient response:', {
        id: resp.id,
        date_of_birth: resp.date_of_birth,
        sex: resp.sex,
        height_cm: resp.height_cm,
        weight_kg: resp.weight_kg,
      });
    }

    // After creating a patient, clear caches that may contain previous demo/user data
    try {
      this.clearPatientCaches();
      console.log('[API] Cleared patient-related caches after createPatient');
    } catch (e) {
      // ignore cache-clear errors
    }

    return resp;
  }

  async getPatient(): Promise<Patient> {
    try {
      if (!this._patientLogEmitted) {
        const url = this.makeUrl('/api/v1/patients');
        console.log('[API][patient] Resolved API base URL (getPatient):', API_BASE_URL);
        console.log('[API][patient] Full getPatient URL:', url);
        this._patientLogEmitted = true;
      }
    } catch (e) {
      // ignore
    }
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
    const status = await this.request<PatientStatus>('/api/v1/patient-status');
    
    // Dev logging for prediction/feature verification
    if (IS_DEBUG) {
      devLog('[API][Dev] Patient Status retrieved - this may include prediction features:', {
        pathway_stage: status.pathway_stage,
        has_absolute: status.has_absolute,
        has_relative: status.has_relative,
        absolute_count: status.absolute_contraindications?.length || 0,
        relative_count: status.relative_contraindications?.length || 0,
      });
    }
    
    return status;
  }

  async getPatientStatusDebug(): Promise<any> {
    // Attempt to fetch prediction debug features from status endpoint
    // Backend may return additional debug info showing ML input features
    try {
      const status = await this.request<any>('/api/v1/patient-status?debug=true', {
        method: 'GET',
      });
      
      if (IS_DEBUG) {
        devLog('[API][Dev] Patient Status Debug (prediction features):', {
          patient_features: status.patient_features || null,
          ml_input_date_of_birth: status.ml_input_date_of_birth || status.date_of_birth || null,
          ml_input_sex: status.ml_input_sex || status.sex || null,
          ml_input_height_cm: status.ml_input_height_cm || status.height_cm || null,
          ml_input_weight_kg: status.ml_input_weight_kg || status.weight_kg || null,
          contraindications_computed: {
            has_absolute: status.has_absolute,
            has_relative: status.has_relative,
          },
        });
      }
      
      return status;
    } catch (error) {
      if (IS_DEBUG) {
        devLog('[API][Dev] Debug endpoint not available, falling back to standard status');
      }
      // Fall back to standard status
      return this.getPatientStatus();
    }
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
    fileUriOrFile: string | File,
    fileName: string,
    fileType: string
  ): Promise<TransplantChecklist> {
    const url = this.buildUrl(`/api/v1/checklist/items/${itemId}/documents`);
    console.log(`[API] Uploading file to: ${url}`);

    // Use canonical device id
    const deviceId = DEVICE_ID || getOrCreateDeviceId();

    // Create FormData for file upload
    const formData = new FormData();
    
    // Check if it's a web File object or a mobile URI
    if (fileUriOrFile instanceof File) {
      // Web: Use File object directly
      formData.append('file', fileUriOrFile, fileName);
    } else {
      // Mobile: Use React Native format
      formData.append('file', {
        uri: fileUriOrFile,
        name: fileName,
        type: fileType,
      } as any);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Device-ID': deviceId,
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

    const endpoint = `/api/v1/centers/nearby?${queryParams.toString()}`;
    const fullUrl = this.makeUrl(endpoint);
    
    const IS_DEBUG =
      (typeof __DEV__ !== 'undefined' && (__DEV__ as boolean)) ||
      (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');
    
    if (IS_DEBUG) {
      console.log('[API][debug] findNearbyCenters request:', {
        method: 'GET',
        url: fullUrl,
        params,
      });
    }
    
    const result = await this.request<TransplantCenter[]>(endpoint);
    
    if (IS_DEBUG) {
      console.log('[API][debug] findNearbyCenters response:', {
        status: 'success',
        count: result.length,
        sample: JSON.stringify(result[0] || {}).substring(0, 200),
      });
    }
    
    return result;
  }

  async getReferralState(): Promise<PatientReferralState> {
    const result = await this.request<PatientReferralState>('/api/v1/referral-state');
    devLog('[API] GET /api/v1/referral-state response:', {
      has_referral: result.has_referral,
      referral_status: result.referral_status,
      location: result.location,
    });
    return result;
  }

  async updateReferralState(state: Partial<PatientReferralState>): Promise<PatientReferralState> {
    devLog('[API] POST /api/v1/referral-state payload:', {
      has_referral: state.has_referral,
      referral_status: state.referral_status,
      location: state.location,
    });
    const result = await this.request<PatientReferralState>('/api/v1/referral-state', {
      method: 'POST',
      body: JSON.stringify(state),
    });
    devLog('[API] POST /api/v1/referral-state response:', {
      has_referral: result.has_referral,
      referral_status: result.referral_status,
      location: result.location,
    });
    return result;
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
    onComplete?: () => void,
    onButton?: (buttonMetadata: { show_button: boolean; button_text: string; pathway_stage?: string }) => void
  ): Promise<void> {
    const body: { query: string; provider?: string; model?: string } = {
      query: params.query,
    };
    if (params.provider) body.provider = params.provider;
    if (params.model) body.model = params.model;

    const url = this.buildUrl(`/api/v1/ai-assistant/query/stream`);

    // Use canonical device id
    const deviceId = DEVICE_ID || getOrCreateDeviceId();

    // Use XMLHttpRequest for React Native streaming support
    // React Native's fetch doesn't support streaming (response.body is null)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-Device-ID', deviceId);

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
                if (data.button !== undefined && onButton) {
                  onButton(data.button);
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
                  } else if (data.button !== undefined && onButton) {
                    onButton(data.button);
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

  async exportFhirData(): Promise<any> {
    return this.request<any>('/api/v1/patients/fhir', {
      headers: {
        'Accept': 'application/fhir+json',
      },
    });
  }

  async exportClinicalSummary(): Promise<{ summary: string; generated_at: string; patient_id: string; model: string }> {
    return this.request<{ summary: string; generated_at: string; patient_id: string; model: string }>(
      '/api/v1/patients/clinical-summary'
    );
  }

  /**
   * Stream clinical summary generation
   * 
   * @param onChunk - Callback for each text chunk received
   * @param onComplete - Callback when streaming completes
   * @param onError - Callback for errors
   */
  async exportClinicalSummaryStream(
    onChunk: (chunk: string) => void,
    onComplete?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    const url = this.buildUrl(`/api/v1/patients/clinical-summary/stream`);

    // Use canonical device id
    const deviceId = DEVICE_ID || getOrCreateDeviceId();

    // Use XMLHttpRequest for React Native streaming support
    // React Native's fetch doesn't support streaming (response.body is null)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader('X-Device-ID', deviceId);

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
          const errorMsg = `HTTP error! status: ${xhr.status}`;
          if (onError) {
            onError(errorMsg);
          }
          reject(new Error(errorMsg));
        }
      };

      xhr.onerror = () => {
        const errorMsg = 'Network error while streaming clinical summary';
        if (onError) {
          onError(errorMsg);
        }
        reject(new Error(errorMsg));
      };

      xhr.send();
    });
  }
}

export const apiService = new ApiService();

// Helper to detect patient-not-found errors thrown from the service
export function isPatientNotFoundError(err: any): boolean {
  if (!err) return false;
  if ((err as any).code === 'PATIENT_NOT_FOUND') return true;
  if (typeof err.message === 'string' && err.message.startsWith('PATIENT_NOT_FOUND')) return true;
  return false;
}
