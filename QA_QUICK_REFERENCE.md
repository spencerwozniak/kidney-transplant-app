# Personal Details Flow: QA Quick Reference

## What Changed?

The app now uses **canonical field names** everywhere:
- `height_cm` (was `height`)
- `weight_kg` (was `weight`)

**No legacy keys.** Clean, consistent data flow.

---

## Testing Checklist (5 minutes)

### ✅ Visual Check
- [ ] Fill out Personal Details screen
- [ ] Enter: DOB, Sex, Height (5'10"), Weight (180 lbs)
- [ ] Hit Next → Medical Questions screen

### ✅ Console Verification (Dev Builds Only)

**Look for these 3 messages:**

1. **Form Conversion** (PatientDetailsScreen2)
```
[PersonalDetails][Dev] Form Data Conversion:
  Height (cm): 177.80
  Weight (kg): 81.65
```

2. **Payload Mapping** (onboardingHandlers)
```
[Onboarding][Dev] Personal Details Payload Mapping:
  • Height (cm): 177.8
  • Weight (kg): 81.65
```

3. **Data Flow Verified** (Final summary)
```
[Onboarding][Dev] ✅ Data flow verified - canonical keys persisted and predictions computed
```

**If you see ⚠️ instead of ✅:**
- Check console for specific issues (mismatch types)
- Verify backend is returning canonical keys

---

## Change Predictor Values Test

### Scenario: Increase Weight

**Step 1:** Complete onboarding with:
- Height: 5'10" (177.8 cm)
- Weight: 180 lbs (81.65 kg)
- Result: `relative_count: 2` (has relative contraindications)

**Step 2:** Edit patient (or create new):
- Same height, weight: 250 lbs (113.4 kg)
- Expected result: `relative_count: 3 or higher` (added BMI contraindication)

**Verification:**
```
Console shows:
  height_cm: 177.8 (unchanged)
  weight_kg: 113.4 (changed)
  ml_features.weight_kg: 113.4 (predicted with new value)
```

---

## Payload Inspection

### To inspect the actual JSON sent to backend:

**Network Tab:**
1. Open DevTools → Network tab
2. Complete Personal Details form
3. Look for POST request to `/api/v1/patients`
4. Click → Request → Body
5. Should see:
```json
{
  "date_of_birth": "YYYY-MM-DD",
  "sex": "male",
  "height_cm": 177.8,
  "weight_kg": 81.65,
  ...
}
```

**No** `height`, `weight`, or `dob` keys. **Only** canonical keys.

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Console shows ⚠️ mismatch | Backend returned old keys | Update backend API to return canonical keys |
| Weight not affecting predictions | ML model not receiving weight | Check ML features in debug response |
| Round-trip GET fails | Patient retrieval broke | Verify GET /api/v1/patients endpoint |
| Console shows no ✅ or ⚠️ | Dev mode disabled | Enable `__DEV__` or `IS_DEBUG` in build |

---

## Files to Monitor

- `src/pages/onboarding/PatientDetailsScreen2.tsx` - Input conversion
- `src/navigation/handlers/onboardingHandlers.ts` - Payload consolidation
- `src/services/api.ts` - Request/response logging
- Backend: `/api/v1/patients` POST endpoint
- Backend: `/api/v1/patient-status` GET endpoint

---

## Success Criteria

✅ All fields captured with correct units
✅ Console shows Form → Payload → Response verification
✅ GET returns same values as POST request
✅ Prediction features reflect input values
✅ No type mismatches or coercion errors

---

**Status:** Ready for QA Testing
**Environment:** Dev builds (full logging)
**Expectation:** Zero console errors, clear verification messages
