# Canonical Payload Flow: Personal Details Integration

## Overview

All patient personal details now use **canonical keys** throughout the entire data flow:
- `date_of_birth` (ISO string: YYYY-MM-DD)
- `sex` (string: 'male' or 'female')
- `height_cm` (number, centimeters)
- `weight_kg` (number, kilograms)

No legacy aliases. No mixed units. **One source of truth.**

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PatientDetailsScreen2.tsx                                              │
│  Input: UI controls (date picker, buttons, dropdowns, text input)      │
│  Validation: DOB (past, age ≤120), Sex (required), Height, Weight      │
│  Conversion:                                                            │
│    • DOB: Date → YYYY-MM-DD                                           │
│    • Height: ft/in → cm (feet * 30.48 + inches * 2.54)               │
│    • Weight: lbs → kg (lbs / 2.20462)                                │
│  Output: onNext callback with canonical keys                          │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PatientDataPart2 (useAppState.ts)                                     │
│ {                                                                       │
│   date_of_birth: "1990-01-15"                                        │
│   sex: "male"                                                          │
│   height_cm: 177.8                                                     │
│   weight_kg: 81.65                                                     │
│ }                                                                       │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ onboardingHandlers.ts - handleMedicalQuestionsNext()                  │
│ Consolidates:                                                           │
│   • PatientDataPart1 (name, email, phone)                            │
│   • PatientDataPart2 (date_of_birth, sex, height_cm, weight_kg)      │
│   • PatientDataMedical (has_ckd_esrd, last_gfr)                      │
│ Calls: apiService.createPatient(patientData)                         │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                 ┌───────────┴────────────┐
                 │                        │
                 ▼                        ▼
        [Dev Logging]         [API Request]
        ✓ Payload format      POST /api/v1/patients
        ✓ All canonical keys  JSON body with canonical keys
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ api.ts - createPatient()                                              │
│ HTTP Request:                                                           │
│   POST /api/v1/patients                                              │
│   Content-Type: application/json                                       │
│                                                                         │
│ Request Payload:                                                       │
│ {                                                                       │
│   "name": "John Doe",                                                │
│   "email": "john@example.com",                                       │
│   "phone": "+1234567890",                                            │
│   "date_of_birth": "1990-01-15",                                    │
│   "sex": "male",                                                     │
│   "height_cm": 177.8,                                               │
│   "weight_kg": 81.65,                                               │
│   "has_ckd_esrd": false,                                            │
│   "last_gfr": 45,                                                   │
│   "has_referral": false                                             │
│ }                                                                       │
│                                                                         │
│ Response (Backend echoes same format):                                │
│ {                                                                       │
│   "id": "patient-uuid-123",                                         │
│   "name": "John Doe",                                               │
│   "date_of_birth": "1990-01-15",                                   │
│   "sex": "male",                                                    │
│   "height_cm": 177.8,                                              │
│   "weight_kg": 81.65,                                              │
│   ...other fields                                                   │
│ }                                                                       │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Persistence Verification (Dev Mode Only)                             │
│                                                                         │
│ Step 1: Compare POST response against sent values                     │
│   ✓ dobMatches = (response.date_of_birth === request.date_of_birth) │
│   ✓ sexMatches = (response.sex === request.sex)                     │
│   ✓ heightMatches = |response.height_cm - request.height_cm| < 0.1 │
│   ✓ weightMatches = |response.weight_kg - request.weight_kg| < 0.01│
│                                                                         │
│ Step 2: Round-trip GET verification                                   │
│   GET /api/v1/patients                                              │
│   Compare retrieved values against original request                   │
│   Ensures data persisted in backend storage                          │
│                                                                         │
│ Step 3: Prediction feature verification                              │
│   GET /api/v1/patient-status (with optional ?debug=true)            │
│   Compare ML input features against canonical payload                │
│   Verify contraindications computed using correct values             │
│                                                                         │
│ Output:                                                                │
│ [Onboarding][Dev] ✅ Data flow verified - canonical keys              │
│                       persisted and predictions computed              │
│                                                                         │
│ OR                                                                      │
│                                                                         │
│ [Onboarding][Dev] ⚠️  Data flow issues detected:                      │
│                      - DOB mismatch                                    │
│                      - Height mismatch                                 │
│                      - ML features mismatch                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Canonical Keys Reference

| Field | Type | Notes | Validation |
|-------|------|-------|-----------|
| `date_of_birth` | string (ISO) | YYYY-MM-DD format | Must be past date, age ≤ 120 years |
| `sex` | string | 'male' or 'female' | Required, must be exact string |
| `height_cm` | number | Centimeters, decimal allowed | Converted from ft/in, must be > 0 |
| `weight_kg` | number | Kilograms, decimal allowed | Converted from lbs, range 50-700 lbs input |

---

## Frontend → Backend Conversion

### Date of Birth
```typescript
// Input (UI)
dateOfBirth: Date object (e.g., Mon Jan 15 1990 00:00:00)

// Conversion (handleNext in PatientDetailsScreen2)
const date = formData.dateOfBirth;
const date_of_birth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Output
date_of_birth: "1990-01-15"
```

### Sex
```typescript
// Input (UI)
sex: "male" | "female" (from button selection)

// No conversion needed - already canonical

// Output
sex: "male"
```

### Height
```typescript
// Input (UI)
heightFeet: "5" (dropdown)
heightInches: "10" (dropdown)

// Conversion (handleNext)
const feet = parseFloat(formData.heightFeet) || 0;
const inches = parseFloat(formData.heightInches) || 0;
const heightInCm = feet * 30.48 + inches * 2.54;

// Output
height_cm: 177.8
```

### Weight
```typescript
// Input (UI)
weightLbs: "180" (text input)

// Conversion (handleNext)
const weightLbs = formData.weightLbs ? parseFloat(formData.weightLbs) : undefined;
const weightInKg = weightLbs ? weightLbs / 2.20462 : undefined;

// Output
weight_kg: 81.65
```

---

## Acceptance Criteria: ✅ Complete

### 1. Canonical Payload ✅
- [x] `date_of_birth` (not `dob`)
- [x] `sex` (not `sex_assigned_at_birth`)
- [x] `height_cm` (not `height`)
- [x] `weight_kg` (not `weight`)
- [x] No alias keys in request
- [x] No mixed units

**Files Updated:**
- `PatientDetailsScreen2.tsx` - onNext callback signature
- `useAppState.ts` - PatientDataPart2 type
- `api.ts` - Patient type definition

### 2. Conversion Logic ✅
- [x] Height: ft/in → cm (`feet * 30.48 + inches * 2.54`)
- [x] Weight: lbs → kg (`lbs / 2.20462`)
- [x] DOB: Date picker → ISO string (`YYYY-MM-DD`)
- [x] Dev logging shows both input and output

**File:** `PatientDetailsScreen2.tsx` handleNext()

### 3. Persistence Verification ✅
- [x] POST response includes canonical keys
- [x] Response values match request values (within tolerance)
- [x] Round-trip GET confirms persistence
- [x] Dev logging for each step

**File:** `onboardingHandlers.ts` handleMedicalQuestionsNext()

### 4. Prediction Verification ✅
- [x] Calls `apiService.getPatientStatusDebug()`
- [x] Extracts ML input features from response
- [x] Compares ML features against canonical payload
- [x] Consolidated ✅/⚠️ summary message

**Files Updated:**
- `api.ts` - new `getPatientStatusDebug()` method
- `onboardingHandlers.ts` - prediction debug verification

---

## Console Output: Dev Flow Verification

### When Successful:
```
[PersonalDetails][Dev] Form Data Conversion:
  Input:
    • DOB selected: Mon Jan 15 1990
    • Sex selected: male
    • Height entered: 5 ft 10 in
    • Weight entered: 180 lbs
  Output:
    • DOB (ISO): 1990-01-15
    • Sex: male
    • Height (cm): 177.80
    • Weight (kg): 81.65

[Onboarding][Dev] Personal Details Payload Mapping:
  • DOB (ISO): 1990-01-15
  • Sex: male
  • Height (cm): 177.8
  • Weight (kg): 81.65

[API][Dev] createPatient payload:
  {
    date_of_birth: "1990-01-15",
    sex: "male",
    height_cm: 177.8,
    weight_kg: 81.65,
    ...
  }

[API][Dev] createPatient response:
  {
    id: "patient-uuid-123",
    date_of_birth: "1990-01-15",
    sex: "male",
    height_cm: 177.8,
    weight_kg: 81.65
  }

[Onboarding][Dev] Persistence Verification:
  ✓ Saved DOB: 1990-01-15
  ✓ Saved Sex: male
  ✓ Saved Height (cm): 177.8
  ✓ Saved Weight (kg): 81.65

[Onboarding][Dev] Performing round-trip GET...
[Onboarding][Dev] Retrieved patient data: {
  date_of_birth: "1990-01-15",
  sex: "male",
  height_cm: 177.8,
  weight_kg: 81.65
}

[Onboarding][Dev] Verifying prediction features...
[Onboarding][Dev] Prediction features in status: {
  has_absolute: false,
  has_relative: true,
  absolute_count: 0,
  relative_count: 2,
  ml_features: {
    date_of_birth: "1990-01-15",
    sex: "male",
    height_cm: 177.8,
    weight_kg: 81.65
  }
}

[Onboarding][Dev] ✅ Data flow verified - canonical keys persisted and predictions computed
```

### When Issues Detected:
```
[Onboarding][Dev] ⚠️ Data flow issues detected:
  - Height mismatch
  - Round-trip persistence mismatch
  - ML features mismatch
```

---

## QA Verification Checklist

### Test 1: Payload Format
```
✅ POST /api/v1/patients request contains:
  - date_of_birth (YYYY-MM-DD)
  - sex ('male' or 'female')
  - height_cm (number)
  - weight_kg (number)
✅ No legacy keys (height, weight, dob, sex_assigned_at_birth)
✅ All values are correct type (string, number)
```

### Test 2: Unit Conversion
```
Input: Height 5'10", Weight 180 lbs, DOB 1990-01-15
Expected:
  • height_cm: 177.8
  • weight_kg: 81.65
  • date_of_birth: "1990-01-15"

✅ Verify exact values in console logs
✅ Verify rounding: cm to 2 decimals, kg to 5 decimals
```

### Test 3: Persistence
```
✅ POST response echoes canonical keys
✅ GET /api/v1/patients returns same values
✅ No data loss or type coercion
✅ Console shows ✅ verification message
```

### Test 4: Predictions
```
Initial data: Age 36, Height 177.8cm, Weight 81.65kg, Male
✅ Contraindications computed
✅ ML features match input

Change weight to 250 lbs (113.4 kg):
✅ Contraindications change
✅ ML features show new weight
```

---

## Code Changes Summary

### Files Modified:
1. **PatientDetailsScreen2.tsx**
   - Updated onNext callback signature: `height` → `height_cm`, `weight` → `weight_kg`
   - Updated initialData parsing to use new keys
   - Conversion logic unchanged (still produces canonical format)

2. **useAppState.ts (PatientDataPart2)**
   - Updated type: `height?: number` → `height_cm?: number`
   - Updated type: `weight?: number` → `weight_kg?: number`

3. **api.ts (Patient type)**
   - Updated type: `height?: number` → `height_cm?: number`
   - Updated type: `weight?: number` → `weight_kg?: number`
   - Updated createPatient() logging to use new keys
   - Added new method: `getPatientStatusDebug()` for ML feature verification

4. **onboardingHandlers.ts**
   - Updated payload consolidation to use canonical keys
   - Enhanced verification with ML feature comparison
   - Added consolidated ✅/⚠️ summary message
   - Removed old height/weight conversion (now handled in Screen2)

### No Breaking Changes:
- All type changes are internal
- Frontend-to-backend contract now explicit and consistent
- Backend must handle canonical keys only

---

## Deployment Checklist

- [ ] All files compile without errors
- [ ] Dev logging outputs canonical keys
- [ ] Backend API expects canonical keys
- [ ] Backend response uses canonical keys
- [ ] Prediction endpoint available (with optional ?debug=true)
- [ ] QA verified all 4 test scenarios
- [ ] No console warnings about key mismatches
