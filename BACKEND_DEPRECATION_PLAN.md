# Backend Deprecation Plan: Alias Key Migration

## Overview

This document outlines a gradual, non-breaking migration strategy from alias keys (height, weight, dob, sex_assigned_at_birth) to canonical keys (height_cm, weight_kg, date_of_birth, sex).

**Goal:** Phase out old key names without breaking existing clients during transition period.

---

## Current State

### Supported Request Keys (Before)
```json
POST /api/v1/patients
{
  "height": 177.8,                  // ❌ Old key (no unit clarity)
  "weight": 81.65,                  // ❌ Old key (no unit clarity)
  "dob": "1990-01-15",              // ❌ Old key (abbreviation)
  "sex_assigned_at_birth": "male"   // ❌ Old key (verbose)
}
```

### Desired State (After)
```json
POST /api/v1/patients
{
  "height_cm": 177.8,               // ✅ Canonical (unit explicit)
  "weight_kg": 81.65,               // ✅ Canonical (unit explicit)
  "date_of_birth": "1990-01-15",    // ✅ Canonical (full term)
  "sex": "male"                     // ✅ Canonical (short, clear)
}
```

---

## Migration Strategy: 3 Phases

### Phase 1: Deprecation Period (Current) ⚠️

**Duration:** Now → 6 months (or next major version)

**Behavior:**
- ✅ **Accept both** old and canonical keys
- ✅ **Prefer canonical** in response
- ⚠️ **Warn clients** about deprecated keys
- 📧 **Send deprecation headers** in HTTP response
- 📝 **Log usage** of old keys (server-side, non-PHI)

**Request Handling:**
```python
# Backend pseudocode (Python/FastAPI example)

@app.post("/api/v1/patients")
async def create_patient(request: Request, data: PatientCreate):
    # Accept both old and new keys
    height_cm = data.height_cm or data.height  # New key takes priority
    weight_kg = data.weight_kg or data.weight
    date_of_birth = data.date_of_birth or data.dob
    sex = data.sex or data.sex_assigned_at_birth
    
    # Track deprecated key usage
    deprecated_keys = []
    if data.height is not None and data.height_cm is None:
        deprecated_keys.append("height")
    if data.weight is not None and data.weight_kg is None:
        deprecated_keys.append("weight")
    if data.dob is not None and data.date_of_birth is None:
        deprecated_keys.append("dob")
    if data.sex_assigned_at_birth is not None and data.sex is None:
        deprecated_keys.append("sex_assigned_at_birth")
    
    # Log deprecation (non-PHI)
    if deprecated_keys:
        logger.warning(f"Deprecated keys used in request: {deprecated_keys}")
    
    # Always respond with canonical keys
    response = {
        "id": patient_id,
        "date_of_birth": date_of_birth,
        "sex": sex,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        # ... other fields
    }
    
    # Add deprecation header if old keys were used
    response_headers = {}
    if deprecated_keys:
        response_headers["X-Deprecated-Fields-Used"] = ",".join(deprecated_keys)
        response_headers["Deprecation"] = "true"
        response_headers["Sunset"] = "2026-07-15"  # Sunset date
    
    return JSONResponse(content=response, headers=response_headers)
```

**Response Headers (Phase 1):**
```
HTTP/1.1 200 OK
Content-Type: application/json
X-Deprecated-Fields-Used: height,weight,dob
Deprecation: true
Sunset: Sun, 15 Jul 2026 00:00:00 GMT
Warning: 299 - "Deprecated request keys used. See documentation for canonical keys."

{
  "id": "patient-uuid",
  "date_of_birth": "1990-01-15",
  "sex": "male",
  "height_cm": 177.8,
  "weight_kg": 81.65
}
```

**Server-Side Logging (Non-PHI):**
```
2026-01-15 10:30:45 WARNING [api.patients] Deprecated keys used:
  deprecated_keys: ["height", "weight"]
  source_ip: 192.168.1.100
  client_version: 1.2.3
  timestamp: 2026-01-15T10:30:45Z
```

**Metrics:**
- Track: % of requests using deprecated keys
- Goal: Reduce to < 5% by end of Phase 1
- Action: Send migration notices to clients with high usage

---

### Phase 1.5: Strict Mode Available (Config Flag)

**Duration:** At any point during Phase 1

**Introduction:** Optional strict mode for early adopters

```python
# Environment variable or config file
STRICT_CANONICAL_INPUTS = False  # Default: allow aliases

@app.post("/api/v1/patients")
async def create_patient(request: Request, data: PatientCreate):
    if STRICT_CANONICAL_INPUTS:
        # Check for alias keys
        if data.height or data.weight or data.dob or data.sex_assigned_at_birth:
            raise HTTPException(
                status_code=422,
                detail={
                    "error": "Deprecated keys not allowed in strict mode",
                    "message": "Use canonical keys: height_cm, weight_kg, date_of_birth, sex",
                    "deprecated_keys": ["height", "weight", "dob", "sex_assigned_at_birth"],
                    "documentation": "https://docs.example.com/api/migration"
                }
            )
    
    # ... rest of logic (accepts both if not strict)
```

**Response (Strict Mode Enabled):**
```
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "error": "Deprecated keys not allowed in strict mode",
  "message": "Use canonical keys: height_cm, weight_kg, date_of_birth, sex",
  "deprecated_keys": ["height", "weight"],
  "documentation": "https://docs.example.com/api/migration",
  "example_request": {
    "date_of_birth": "1990-01-15",
    "sex": "male",
    "height_cm": 177.8,
    "weight_kg": 81.65
  }
}
```

**Benefits:**
- Allows teams to opt-in early
- Helps identify clients still using old keys
- Enables parallel testing of strict mode

---

### Phase 2: Strict Mode by Default (Major Version Release)

**Duration:** Next major version → 3 months after release

**Behavior:**
- ❌ **Reject alias keys** by default
- ✅ **Accept only canonical keys**
- ⚠️ **Return 422 with helpful error** showing canonical format
- 📧 **Provide migration guide** in error response

**Request Handling:**
```python
# Major version v2.0+
STRICT_CANONICAL_INPUTS = True  # Default: strict mode

@app.post("/api/v1/patients")
async def create_patient(request: Request, data: PatientCreate):
    # Validate: only accept canonical keys
    if data.height or data.weight or data.dob or data.sex_assigned_at_birth:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "API v2 requires canonical keys",
                "message": "Please update your client to use: height_cm, weight_kg, date_of_birth, sex",
                "migration_deadline": "2026-10-15",
                "support": "https://support.example.com/api-migration"
            }
        )
    
    # Required: must be canonical
    if not data.height_cm or not data.weight_kg or not data.date_of_birth or not data.sex:
        raise HTTPException(status_code=422, detail="Missing required canonical fields")
    
    # ... process with canonical keys only
```

**Migration Path for Clients:**
```
Before (using alias keys):
  POST /api/v1/patients
  {
    "height": 177.8,
    "weight": 81.65,
    "dob": "1990-01-15",
    "sex_assigned_at_birth": "male"
  }

After (using canonical keys):
  POST /api/v2/patients  # or /api/v1/patients in v2.0+
  {
    "height_cm": 177.8,
    "weight_kg": 81.65,
    "date_of_birth": "1990-01-15",
    "sex": "male"
  }
```

---

### Phase 3: Cleanup (Deferred)

**Duration:** 3+ months after Phase 2 release

**Behavior:**
- ✅ **Remove alias key code** entirely
- ✅ **Remove deprecation checks**
- ✅ **Remove legacy endpoints** (if separate)
- 📝 **Update documentation** to show only canonical

**Code Cleanup:**
```python
# Remove all alias handling
# Before:
height_cm = data.height_cm or data.height  # ❌ Remove this
weight_kg = data.weight_kg or data.weight  # ❌ Remove this
date_of_birth = data.date_of_birth or data.dob  # ❌ Remove this
sex = data.sex or data.sex_assigned_at_birth  # ❌ Remove this

# After:
height_cm = data.height_cm  # ✅ Canonical only
weight_kg = data.weight_kg
date_of_birth = data.date_of_birth
sex = data.sex

# Remove deprecation header code
# Remove strict mode config flag
# Remove deprecated metrics tracking
```

---

## Implementation Roadmap

### Immediate (Now) - Phase 1

**1. Update Request Validation**
```python
class PatientCreate(BaseModel):
    # Canonical keys (required)
    date_of_birth: str  # YYYY-MM-DD
    sex: str            # 'male' | 'female'
    height_cm: float    # Centimeters
    weight_kg: float    # Kilograms
    
    # Legacy keys (optional, deprecated)
    dob: Optional[str] = None
    sex_assigned_at_birth: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
```

**2. Add Deprecation Logic**
```python
# In request handler
deprecated_keys = []
if dob and not date_of_birth:
    date_of_birth = dob
    deprecated_keys.append("dob")
# ... repeat for other keys

# Log if deprecated
if deprecated_keys:
    logger.warning(f"Deprecated keys in request: {deprecated_keys}")
    response.headers["X-Deprecated-Fields-Used"] = ",".join(deprecated_keys)
```

**3. Ensure Canonical Response**
```python
# Always respond with canonical keys only
response = {
    "date_of_birth": date_of_birth,
    "sex": sex,
    "height_cm": height_cm,
    "weight_kg": weight_kg
}
# Never include old keys in response
```

**4. Add Metrics**
```python
# Track deprecated key usage for analytics
metrics.increment("api.deprecated_keys", tags={
    "endpoint": "/patients",
    "keys": deprecated_keys,
    "client_version": request.headers.get("User-Agent")
})
```

---

### Mid-Phase 1 (Month 3) - Enable Strict Mode Option

**1. Add Config Flag**
```python
# config/settings.py
STRICT_CANONICAL_INPUTS = os.getenv("STRICT_CANONICAL_INPUTS", "false").lower() == "true"
```

**2. Implement Strict Validation**
```python
if STRICT_CANONICAL_INPUTS:
    if dob or sex_assigned_at_birth or height or weight:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "Deprecated keys not allowed (strict mode enabled)",
                "deprecated_keys": ["dob", "sex_assigned_at_birth", "height", "weight"],
                "use_instead": ["date_of_birth", "sex", "height_cm", "weight_kg"]
            }
        )
```

**3. Document in README**
```markdown
# API Deprecation Notice

## Canonical Keys Migration

### Phase 1: Deprecation Period (Current)
Old keys are accepted but deprecated:
- `height` → use `height_cm`
- `weight` → use `weight_kg`
- `dob` → use `date_of_birth`
- `sex_assigned_at_birth` → use `sex`

Response headers will include `X-Deprecated-Fields-Used` if old keys are detected.

### Strict Mode (Optional)
To enforce canonical keys:
```bash
export STRICT_CANONICAL_INPUTS=true
```

### Migration Guide
See [MIGRATION.md](./MIGRATION.md) for step-by-step instructions.
```

---

### End of Phase 1 (Month 6) - Release Major Version

**1. Update Version**
```python
API_VERSION = "2.0.0"
```

**2. Set Strict Mode Default**
```python
STRICT_CANONICAL_INPUTS = os.getenv("STRICT_CANONICAL_INPUTS", "true").lower() == "true"
```

**3. Send Migration Notices**
- Email clients: "API v2.0 requires canonical keys"
- Include: Examples, migration guide, support channel

**4. Monitor Compliance**
- Track: % of requests failing due to old keys
- Action: Proactive support for struggling clients

---

## Client Migration Guide

### For Frontend Clients

**Before (Old Keys):**
```typescript
const payload = {
  height: 177.8,                  // ❌ Old
  weight: 81.65,                  // ❌ Old
  dob: "1990-01-15",              // ❌ Old
  sex_assigned_at_birth: "male"   // ❌ Old
};
await fetch('/api/v1/patients', {
  method: 'POST',
  body: JSON.stringify(payload)
});
```

**After (Canonical Keys):**
```typescript
const payload = {
  height_cm: 177.8,               // ✅ New
  weight_kg: 81.65,               // ✅ New
  date_of_birth: "1990-01-15",    // ✅ New
  sex: "male"                     // ✅ New
};
await fetch('/api/v1/patients', {
  method: 'POST',
  body: JSON.stringify(payload)
});
```

**Automatic Migration (if needed):**
```typescript
// Compatibility layer (temporary)
function normalizePatientPayload(data) {
  return {
    date_of_birth: data.date_of_birth || data.dob,
    sex: data.sex || data.sex_assigned_at_birth,
    height_cm: data.height_cm || data.height,
    weight_kg: data.weight_kg || data.weight
  };
}

// Then use:
const payload = normalizePatientPayload(rawData);
await fetch('/api/v1/patients', {
  method: 'POST',
  body: JSON.stringify(payload)
});
```

### For Backend Clients (Mobile/Third-party)

**Step 1: Check Current Usage**
```bash
curl -X POST https://api.example.com/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "height": 177.8,
    "weight": 81.65,
    "dob": "1990-01-15",
    "sex_assigned_at_birth": "male"
  }'
```

**Result (Phase 1):**
```
HTTP/1.1 200 OK
X-Deprecated-Fields-Used: height,weight,dob,sex_assigned_at_birth
Deprecation: true
Sunset: Sun, 15 Jul 2026 00:00:00 GMT

{ "id": "...", "height_cm": 177.8, ... }
```

**Action:** Update to canonical keys
```bash
curl -X POST https://api.example.com/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "height_cm": 177.8,
    "weight_kg": 81.65,
    "date_of_birth": "1990-01-15",
    "sex": "male"
  }'
```

**Result (Future):**
```
HTTP/1.1 200 OK

{ "id": "...", "height_cm": 177.8, ... }
```

---

## Testing Strategy

### Unit Tests (Phase 1)

**Test 1: Accept Canonical Keys**
```python
def test_accept_canonical_keys():
    payload = {
        "date_of_birth": "1990-01-15",
        "sex": "male",
        "height_cm": 177.8,
        "weight_kg": 81.65
    }
    response = client.post("/api/v1/patients", json=payload)
    assert response.status_code == 201
    assert response.json()["height_cm"] == 177.8
```

**Test 2: Accept Deprecated Keys (Phase 1)**
```python
def test_accept_deprecated_keys_phase1():
    payload = {
        "dob": "1990-01-15",
        "sex_assigned_at_birth": "male",
        "height": 177.8,
        "weight": 81.65
    }
    response = client.post("/api/v1/patients", json=payload)
    assert response.status_code == 201
    assert response.headers.get("X-Deprecated-Fields-Used") is not None
    assert response.json()["date_of_birth"] == "1990-01-15"  # ← canonical in response
```

**Test 3: Strict Mode Rejects Old Keys**
```python
def test_strict_mode_rejects_deprecated():
    set_config("STRICT_CANONICAL_INPUTS", True)
    payload = {
        "height": 177.8,  # ❌ Old key
        "weight": 81.65,  # ❌ Old key
        "dob": "1990-01-15",
        "sex_assigned_at_birth": "male"
    }
    response = client.post("/api/v1/patients", json=payload)
    assert response.status_code == 422
    assert "canonical" in response.json()["message"].lower()
```

**Test 4: Response Always Canonical**
```python
def test_response_always_canonical(deprecated_request=True):
    # Whether request uses old or new keys
    payload = {...}  # old or new keys
    response = client.post("/api/v1/patients", json=payload)
    
    body = response.json()
    assert "height_cm" in body
    assert "weight_kg" in body
    assert "date_of_birth" in body
    assert "sex" in body
    assert "height" not in body  # No old keys in response
    assert "weight" not in body
    assert "dob" not in body
    assert "sex_assigned_at_birth" not in body
```

---

## Documentation Updates

### README.md Addition

```markdown
## API Deprecation: Key Names Migration

As of 2026-01, the API is transitioning to canonical field names for better clarity and consistency.

### New Canonical Keys (Preferred)
```json
{
  "date_of_birth": "1990-01-15",    // ✅ Use this
  "sex": "male",                    // ✅ Use this
  "height_cm": 177.8,               // ✅ Use this (centimeters)
  "weight_kg": 81.65                // ✅ Use this (kilograms)
}
```

### Deprecated Keys (Legacy, will be removed)
```json
{
  "dob": "1990-01-15",              // ❌ Use date_of_birth instead
  "sex_assigned_at_birth": "male",  // ❌ Use sex instead
  "height": 177.8,                  // ❌ Use height_cm instead
  "weight": 81.65                   // ❌ Use weight_kg instead
}
```

### Timeline
- **Phase 1 (Now - Jul 2026):** Old keys accepted, deprecated header sent
- **Phase 2 (Jul 2026+):** Old keys rejected (v2.0+), must use canonical
- **Phase 3 (Oct 2026+):** Legacy code removed

### Migration Examples
See [MIGRATION.md](./MIGRATION.md) for code examples in your language.

### Support
- Questions? Contact: [support@example.com](mailto:support@example.com)
- Documentation: [/docs/api/migration](/docs/api/migration)
```

### MIGRATION.md (New File)

```markdown
# API Migration Guide: Canonical Keys

This guide helps you migrate from deprecated keys to canonical keys.

## Quick Start

### Python (Requests)

**Before:**
```python
import requests

data = {
    "height": 177.8,
    "weight": 81.65,
    "dob": "1990-01-15",
    "sex_assigned_at_birth": "male"
}
response = requests.post(
    "https://api.example.com/api/v1/patients",
    json=data
)
```

**After:**
```python
import requests

data = {
    "height_cm": 177.8,
    "weight_kg": 81.65,
    "date_of_birth": "1990-01-15",
    "sex": "male"
}
response = requests.post(
    "https://api.example.com/api/v1/patients",
    json=data
)
```

### JavaScript

**Before:**
```javascript
const data = {
  height: 177.8,
  weight: 81.65,
  dob: "1990-01-15",
  sex_assigned_at_birth: "male"
};
fetch("https://api.example.com/api/v1/patients", {
  method: "POST",
  body: JSON.stringify(data)
});
```

**After:**
```javascript
const data = {
  height_cm: 177.8,
  weight_kg: 81.65,
  date_of_birth: "1990-01-15",
  sex: "male"
};
fetch("https://api.example.com/api/v1/patients", {
  method: "POST",
  body: JSON.stringify(data)
});
```

## What Changed

| Old Key | New Key | Type | Notes |
|---------|---------|------|-------|
| `height` | `height_cm` | float | Always in centimeters |
| `weight` | `weight_kg` | float | Always in kilograms |
| `dob` | `date_of_birth` | string | ISO format: YYYY-MM-DD |
| `sex_assigned_at_birth` | `sex` | string | 'male' or 'female' |

## Questions?

See [README.md#API-Deprecation](./README.md#api-deprecation) or contact support.
```

---

## Acceptance Criteria ✅

### Phase 1 (Deprecation Period)
- [x] Accept both old and canonical keys
- [x] Prefer canonical keys in response
- [x] Send X-Deprecated-Fields-Used header when old keys detected
- [x] Log deprecated key usage (non-PHI)
- [x] Document deprecation timeline
- [x] Provide migration guide to clients
- [x] Strict mode available via config flag
- [x] Tests cover both old and new keys

### Phase 2 (Strict Mode Default)
- [ ] Set STRICT_CANONICAL_INPUTS=true by default
- [ ] Reject old keys with 422 status + helpful error
- [ ] Return migration examples in error response
- [ ] Monitor compliance (% of failing requests)
- [ ] Send migration notices to high-usage clients
- [ ] Support team prepared for migration questions

### Phase 3 (Cleanup)
- [ ] Remove all legacy key handling code
- [ ] Remove deprecation checks
- [ ] Update documentation (canonical only)
- [ ] Clean up metrics/logging

---

## Rollback Plan

**If needed:** Support can temporarily re-enable old key acceptance:

```python
# In emergency
STRICT_CANONICAL_INPUTS = False
# Restart service
# Old keys will work again with deprecation header
```

---

## Questions & Support

**Who?**
- Backend team: API implementation
- DevOps: Deployment & config management
- Support: Client communication & migration help

**When?**
- Phase 1 start: Now
- Phase 1 end: Month 6 (milestone review)
- Phase 2 release: Next major version
- Phase 3: Month 9

**Metrics to Track:**
- % of requests using deprecated keys
- Error rate for strict mode (Phase 2)
- Client migration rate
- Support tickets related to migration

---

**Status:** ✅ Ready for Implementation
**Owner:** Backend Team
**Timeline:** 9+ months (3 phases)
**Risk Level:** Low (gradual, non-breaking migration)
