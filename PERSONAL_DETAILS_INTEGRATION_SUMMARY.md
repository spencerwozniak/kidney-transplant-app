# Personal Details Flow: End-to-End Integration Summary

## 1. Input Collection & Validation

**Screen:** `src/pages/onboarding/PatientDetailsScreen2.tsx`

| Field | Input Type | Validation Rules | UI Indicator |
|-------|-----------|------------------|--------------|
| Date of Birth | Date Picker | Required, must be past, age ≤ 120 | Red asterisk `*` |
| Sex Assigned at Birth | Button group (Male/Female) | Required, exactly one selection | Red asterisk `*` |
| Height | Dual dropdowns (Feet + Inches) | Required, feet must be selected | Red asterisk `*` |
| Weight | Numeric text input (lbs) | Required, numeric, 50-700 lbs | Red asterisk `*` |

**Validation Triggers:**
- On blur for each field
- When closing date/height picker modals
- On Next button attempt
- Errors cleared on user input

---

## 2. Conversion Logic (Normalization Layer)

**Location:** `PatientDetailsScreen2.tsx` → `handleNext()` → `onNext()` callback

```tsx
// INPUT (UI state in formData)
{
  dateOfBirth: Date,           // e.g., Mon Jan 15 1990
  sex: string,                 // 'male' | 'female'
  heightFeet: string,          // '5'
  heightInches: string,        // '10'
  weightLbs: string            // '180'
}

// CONVERSION LOGIC
const date_of_birth = `${year}-${month}-${day}`     // ISO format
const heightInCm = feet * 30.48 + inches * 2.54      // To cm
const weightInKg = parseFloat(weightLbs) / 2.20462   // To kg

// OUTPUT (onNext payload)
{
  date_of_birth: '1990-01-15',
  sex: 'male',
  height: 177.8,               // cm
  weight: 81.65                // kg
}
```

**Schema Naming:**
- ✅ `date_of_birth` (ISO string, NOT `dob`)
- ✅ `sex` (enum, NOT `sex_assigned_at_birth`)
- ✅ `height` in **cm** (NOT inches or feet)
- ✅ `weight` in **kg** (NOT lbs)

---

## 3. Data Flow & Payload Transit

### Step 1: Screen2 → Handler
**File:** `src/navigation/handlers/onboardingHandlers.ts`
```typescript
handlePatientDetails2Next(data: PatientDataPart2) {
  // data = { date_of_birth, sex, height, weight }
  setPatientDataPart2(data)
  setCurrentScreen('medical-questions')  // Cache, proceed
}
```

### Step 2: Consolidate & POST
**File:** `src/navigation/handlers/onboardingHandlers.ts` → `handleMedicalQuestionsNext()`
```typescript
const patientData: Patient = {
  ...patientDataPart1,       // name, email, phone
  ...patientDataPart2,       // date_of_birth, sex, height, weight
  ...medicalData             // has_ckd_esrd, last_gfr
}

await apiService.createPatient(patientData)
```

### Step 3: Backend POST
**Endpoint:** `POST /api/v1/patients`
**Payload Schema:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-15",
  "sex": "male",
  "height": 177.8,
  "weight": 81.65,
  "has_ckd_esrd": false,
  "last_gfr": 45,
  "has_referral": false
}
```

**Backend Response:**
```json
{
  "id": "patient-uuid-123",
  "name": "John Doe",
  "date_of_birth": "1990-01-15",
  "sex": "male",
  "height": 177.8,
  "weight": 81.65,
  ...
}
```

---

## 4. Persistence Verification

**Location:** `src/navigation/handlers/onboardingHandlers.ts` (Dev Mode Only)

### Immediate Response Check
```
✓ Compare POST response values vs sent values
  • dobMatches = (response.dob === sent.dob)
  • sexMatches = (response.sex === sent.sex)
  • heightMatches = (|response.height - sent.height| < 0.1 cm)
  • weightMatches = (|response.weight - sent.weight| < 0.01 kg)
```

### Round-Trip Verification (GET after POST)
```
GET /api/v1/patients
✓ Retrieved values must match original sent values
✓ Confirms data persists in backend storage
```

**Console Output:**
```
[Onboarding][Dev] ✅ All values persisted correctly
[Onboarding][Dev] ✅ Round-trip persistence verified
```

---

## 5. Navigation After Persistence

**Success:** 
- `setCurrentScreen('home')` 
- Checklists auto-created on backend
- Patient status will be computed on first fetch

**Failure:**
- Alert shows error message
- User stays on medical-questions screen
- Can retry after fix

---

## 6. Prediction Feature Verification

### How Prediction Uses Personal Details

**Endpoint:** `GET /api/v1/patient-status` (called by PathwayScreen)

**Features Used in ML Model:**
- `weight` (kg) → BMI, comorbidity scoring
- `height` (cm) → BMI calculation
- `age` (calculated from `date_of_birth`) → risk stratification
- `sex` → gender-specific scoring

**Response Includes:**
```json
{
  "id": "status-uuid",
  "patient_id": "patient-uuid-123",
  "pathway_stage": "identification",
  "has_absolute": false,
  "has_relative": true,
  "absolute_contraindications": [],
  "relative_contraindications": [
    { "id": "c1", "question": "BMI > 40?" },
    { "id": "c2", "question": "Age > 80?" }
  ]
}
```

### Dev Debug Logging

**File:** `src/services/api.ts` → `getPatientStatus()`
```
[API][Dev] Patient Status retrieved:
  pathway_stage: identification
  has_absolute: false
  has_relative: true
  absolute_count: 0
  relative_count: 2
```

---

## 7. Data Transformation Summary

```
┌─────────────────────────────────────────────────────────────┐
│ UI Input (PatientDetailsScreen2)                             │
│  • DOB picker: Date object                                   │
│  • Sex buttons: 'male' | 'female'                            │
│  • Height: feet (1-8), inches (0-11)                         │
│  • Weight input: lbs string                                  │
└────────────────────┬────────────────────────────────────────┘
                     │ Validation + Conversion (handleNext)
┌────────────────────▼────────────────────────────────────────┐
│ FE Payload (onNext callback)                                │
│  • date_of_birth: "YYYY-MM-DD"                              │
│  • sex: "male" | "female"                                   │
│  • height: number (cm)                                      │
│  • weight: number (kg)                                      │
└────────────────────┬────────────────────────────────────────┘
                     │ Consolidate with Part1 + Medical data
┌────────────────────▼────────────────────────────────────────┐
│ Unified Patient Object (handleMedicalQuestionsNext)         │
│  • name, email, phone (from Part1)                          │
│  • date_of_birth, sex, height, weight (from Part2)          │
│  • has_ckd_esrd, last_gfr (from Medical)                    │
└────────────────────┬────────────────────────────────────────┘
                     │ POST to /api/v1/patients
┌────────────────────▼────────────────────────────────────────┐
│ Backend Storage (PostgreSQL)                                │
│  • Exact same schema as Patient object                      │
│  • ML pipeline reads weight, height, dob for predictions    │
└────────────────────┬────────────────────────────────────────┘
                     │ GET /api/v1/patient-status
┌────────────────────▼────────────────────────────────────────┐
│ Prediction Output (PathwayScreen)                           │
│  • contraindications (affected by weight, height, age)      │
│  • pathway_stage (based on clinical profile)                │
│  • recommendation engine scoring                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Naming Mismatches: Fixed ✅

| Field | Frontend | Backend | Notes |
|-------|----------|---------|-------|
| DOB | `date_of_birth` | `date_of_birth` | ✅ Consistent (NOT `dob`) |
| Sex | `sex` | `sex` | ✅ Consistent (NOT `sex_assigned_at_birth`) |
| Height | `height` (cm) | `height` (cm) | ✅ Both in cm (NOT mixed) |
| Weight | `weight` (kg) | `weight` (kg) | ✅ Both in kg (NOT lbs on backend) |

---

## 9. QA Validation Checklist

### Test Scenario: Change Weight

**Setup:**
1. Fill all fields: DOB=1980-01-01, Sex=Male, Height=5'10", Weight=180 lbs
2. Submit → Patient created
3. Retrieve patient → Verify weight persisted

**Test 1: Weight Affects Prediction**
```
Initial: Weight = 180 lbs (81.65 kg)
→ Contraindications: has_relative=true, relative_count=1

Edit patient (via API or future edit screen):
Weight = 250 lbs (113.4 kg)
→ Contraindications: has_relative=true, relative_count=2 (BMI + other)
```
**Expected:** `relative_count` increases due to higher BMI scoring

---

### Test Scenario: Change Height

**Setup:**
1. Initial: Height=5'10" (177.8 cm), Weight=180 lbs
2. Edit: Height=6'2" (188 cm), Weight=180 lbs (same)

**Test 2: Height Affects BMI Scoring**
```
Initial BMI: 180 lbs / (177.8 cm)² = 28.6 (overweight)
Updated BMI: 180 lbs / (188 cm)² = 25.5 (normal)
```
**Expected:** Fewer or different contraindications due to improved BMI

---

### Test Scenario: Change DOB (Age)

**Setup:**
1. Initial DOB: 1980-01-01 (age ~46)
2. Edit DOB: 1935-01-01 (age ~91)

**Test 3: Age Affects Risk Stratification**
```
[API][Dev] Patient Status retrieved:
  has_absolute: false (age 46)
  
[After DOB change]
[API][Dev] Patient Status retrieved:
  has_absolute: true (age 91 → triggers age contraindication)
```
**Expected:** `has_absolute` flips to `true` due to age threshold

---

### Test Scenario: Verify Payload Transformation

**Test 4: Weight Conversion (lbs → kg)**
```
UI Input: 180 lbs
Console [PersonalDetails][Dev]:
  Weight entered: 180 lbs
  Weight (kg): 81.65

Console [API][Dev]:
  weight_kg: 81.6465442627

Backend Storage: weight = 81.6465442627
GET /api/v1/patients: weight = 81.6465442627
```
**Expected:** Exact match, no rounding loss

---

### Test Scenario: Verify DOB Format

**Test 5: Date Normalization**
```
UI Input: Date picker → Jan 15, 1990
Console [PersonalDetails][Dev]:
  DOB (ISO): 1990-01-15

Console [Onboarding][Dev]:
  DOB (ISO): 1990-01-15

Backend Storage: date_of_birth = "1990-01-15"
Prediction uses: age = 2026 - 1990 = 36 years
```
**Expected:** ISO format preserved, age calculated correctly

---

### Test Scenario: End-to-End Happy Path

**Test 6: Full Integration**
```
1. ✅ Enter all details (DOB, Sex, Height, Weight)
2. ✅ Validation passes (all fields red asterisk cleared)
3. ✅ Next button enabled
4. ✅ Navigate through Medical Questions
5. ✅ Submit → Console shows:
   [PersonalDetails][Dev] Form Data Conversion ✓
   [Onboarding][Dev] Personal Details Payload Mapping ✓
   [API][Dev] createPatient payload ✓
   [API][Dev] createPatient response ✓
   [Onboarding][Dev] ✅ All values persisted correctly
   [Onboarding][Dev] ✅ Round-trip persistence verified
6. ✅ Navigate to home
7. ✅ PathwayScreen loads → Contraindications computed
8. ✅ GET /api/v1/patient-status shows prediction results
```

---

## 10. Quick Reference: Key Files

| Component | File | Responsibility |
|-----------|------|-----------------|
| Input UI | `src/pages/onboarding/PatientDetailsScreen2.tsx` | Collect DOB, sex, height, weight + validate |
| Normalization | `PatientDetailsScreen2.tsx` → `handleNext()` | Convert units, format dates |
| Data Handler | `src/navigation/handlers/onboardingHandlers.ts` | Cache data, consolidate, POST to API |
| API Service | `src/services/api.ts` → `createPatient()` | POST /api/v1/patients, verify response |
| Prediction | `src/services/api.ts` → `getPatientStatus()` | GET /api/v1/patient-status for contraindications |
| Verification | Dev console logs | Trace flow, verify transformations |

---

**Status:** ✅ Ready for QA Testing
