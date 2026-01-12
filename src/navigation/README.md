# Navigation Architecture

This directory contains the refactored navigation system for the kidney transplant app. The navigation logic has been broken down into manageable, well-organized modules.

## Structure

```
navigation/
├── types.ts                    # Screen types and navigation constants
├── useAppState.ts              # App-wide state management hook
├── ScreenRouter.tsx            # Screen rendering component
├── handlers/                   # Navigation handlers organized by flow
│   ├── index.ts
│   ├── onboardingHandlers.ts   # Onboarding flow (3 screens)
│   ├── assessmentHandlers.ts   # Transplant assessment flow
│   ├── financialHandlers.ts    # Financial assessment flow
│   ├── checklistHandlers.ts    # Checklist management flow
│   └── patientHandlers.ts      # Patient management actions
└── README.md                   # This file
```

## App Flow Overview

### 1. Onboarding Flow
**Screens:** `onboarding` → `patient-details-1` → `patient-details-2` → `medical-questions` → `assessment-intro`

- Collects patient information in 3 steps
- Saves patient data to backend
- Automatically creates checklist on backend
- Navigates to assessment intro after completion

**Handler:** `onboardingHandlers.ts`

### 2. Assessment Flow
**Screens:** `assessment-intro` → `questionnaire` → `financial-intro`

- Introduces transplant eligibility assessment
- Collects questionnaire answers
- Computes status on backend
- Navigates to financial assessment after completion

**Handler:** `assessmentHandlers.ts`

### 3. Financial Flow
**Screens:** `financial-intro` → `financial-questionnaire` → `home`

- Introduces financial assessment
- Collects financial profile data
- Supports both first-time and edit flows
- Navigates to home after completion

**Handler:** `financialHandlers.ts`

### 4. Checklist Flow
**Screens:** `checklist-timeline` → `checklist-item-edit` → `checklist-documents`

- Displays checklist timeline
- Allows editing individual checklist items
- Manages documents for checklist items
- Can navigate back to home

**Handler:** `checklistHandlers.ts`

### 5. Referral Flow
**Screens:** `transplant-access-navigator` → `referral-view`

- Helps find nearby transplant centers
- Guides through referral process
- Views referral status

**Handler:** Handled directly in ScreenRouter (no separate handler needed)

### 6. Main App
**Screens:** `home` (with `pathway` and `settings` tabs) → `results-detail`

- Home screen with two tabs (pathway/settings)
- Displays patient status and results
- Provides navigation to all major features

**Handler:** `patientHandlers.ts`

## Key Components

### `useAppState.ts`
Centralized state management hook that provides:
- Current screen navigation state
- Patient data
- Temporary form data during onboarding
- UI state (loading, tabs, checklist editing)

### `ScreenRouter.tsx`
Renders the appropriate screen component based on `currentScreen`. All screen rendering logic is centralized here, making it easy to see the complete app flow.

### Handler Modules
Each handler module exports a factory function that creates handlers for a specific flow. Handlers receive the app state and return functions that handle navigation and data flow for that section.

## Usage Example

```typescript
// In App.tsx
const appState = useAppState();
const onboardingHandlers = createOnboardingHandlers(appState);
const assessmentHandlers = createAssessmentHandlers(appState);
// ... etc

return (
  <ScreenRouter
    state={appState}
    onboardingHandlers={onboardingHandlers}
    assessmentHandlers={assessmentHandlers}
    // ... etc
  />
);
```

## Benefits

1. **Clear Separation of Concerns**: Each flow has its own handler module
2. **Easy to Understand**: ScreenRouter shows the complete app flow at a glance
3. **Maintainable**: Adding new screens or modifying flows is straightforward
4. **Type-Safe**: All navigation is typed with TypeScript
5. **Testable**: Handlers can be tested independently

## Adding a New Screen

1. Add the screen name to `types.ts` in the `Screen` type
2. Add the screen rendering logic to `ScreenRouter.tsx`
3. If the screen is part of a flow, add handlers to the appropriate handler module
4. If it's a standalone screen, add navigation logic directly in ScreenRouter

