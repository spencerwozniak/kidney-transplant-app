# Kidney Transplant Navigation — Mobile App

Patient-facing mobile app that helps dialysis patients understand, track, and navigate the kidney transplant pathway using **patient-owned data**, **clear explanations**, and **actionable next steps**.

This app is designed to function independently of dialysis facilities and puts patients in control of their own health information.

> **Disclaimer**  
> This project is for educational and informational purposes only and does not provide medical advice.  
> It is intended to support patient understanding and navigation, not replace clinical judgment or professional care.

---

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo Go app** on your phone:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## Setup Instructions

### 1. Install Dependencies

Navigate to the project directory and install all required packages:

```bash
cd kidney-transplant-app
npm install
```

### 2. Start the Development Server

Run the Expo development server:

```bash
npm start
```

This will:

- Start the Metro bundler
- Display a QR code in your terminal
- Open the Expo DevTools in your browser

---

## Running on Your Phone

**For iOS:**

1. Open the **Expo Go** app on your iPhone
2. Scan the QR code displayed in your terminal using the Camera app
3. Tap the notification that appears to open the app in Expo Go

**For Android:**

1. Open the **Expo Go** app on your Android device
2. Tap "Scan QR code" in the app
3. Scan the QR code displayed in your terminal
4. The app will load automatically

**Note:** Your phone and computer must be on the same Wi-Fi network for this to work.
---

## Development Workflow

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator (macOS only)
- `npm run web` - Run in web browser
- `npm run start:clear` - Start with cleared cache
- `npm run lint` - Check code for linting errors
- `npm run format` - Format code with Prettier

### Hot Reloading

The app supports hot reloading by default. When you save changes to your code:

- The app will automatically reload on your phone
- You'll see updates without restarting the app

### Troubleshooting

**App won't load on phone:**

- Ensure both devices are on the same Wi-Fi network
- Try restarting the development server: `npm start --clear`
- Check that your firewall isn't blocking the connection

**Dependencies issues:**

- Clear cache and reinstall: `npm run clean:all`
- Delete `node_modules` and `package-lock.json`, then run `npm install`

**Metro bundler errors:**

- Clear Metro cache: `npm start --clear`
- Reset watchman: `watchman watch-del-all` (if installed)

---

## Directory Structure

```
kidney-transplant-app/
├── src/
|   ├── App.tsx
│   ├── pages/                     # Full page/screen components
│   │   ├── ChatScreen.tsx         # AI chat interface
│   │   ├── ResultsDetailScreen.tsx # Results detail view
│   │   ├── SettingsScreen.tsx     # Settings screen
│   │   ├── StyleExamples.tsx      # Style examples (dev)
│   │   ├── checklist/             # Checklist screens
│   │   │   ├── ChecklistTimelineScreen.tsx
│   │   │   ├── ChecklistItemEditScreen.tsx
│   │   │   └── ChecklistDocumentsScreen.tsx
│   │   ├── financial-assessment/  # Financial assessment screens
│   │   │   ├── FinancialIntroScreen.tsx
│   │   │   └── FinanceQuestionnaire.tsx
│   │   ├── onboarding/            # Onboarding flow screens
│   │   │   ├── OnboardingScreen.tsx
│   │   │   ├── PatientDetailsScreen1.tsx
│   │   │   ├── PatientDetailsScreen2.tsx
│   │   │   └── MedicalQuestionsScreen.tsx
│   │   ├── pathway/               # Pathway visualization screens
│   │   │   ├── PathwayScreen.tsx
│   │   │   ├── PathwayHeader.tsx
│   │   │   ├── StageCard.tsx
│   │   │   ├── StageDetailModal.tsx
│   │   │   ├── EvaluationProgress.tsx
│   │   │   ├── StageActions.tsx
│   │   │   ├── StageIndicatorDots.tsx
│   │   │   ├── icons/              # Pathway stage icons
│   │   │   ├── constants.ts
│   │   │   ├── pathwayStages.ts
│   │   │   └── types.ts
│   │   ├── referral/              # Referral management screens
│   │   │   ├── ReferralViewScreen.tsx
│   │   │   └── navigator/         # Transplant access navigator
│   │   │       ├── TransplantAccessNavigator.tsx
│   │   │       ├── CentersScreen.tsx
│   │   │       ├── CenterCard.tsx
│   │   │       ├── SelectedCenterInfo.tsx
│   │   │       ├── ProviderInfoForm.tsx
│   │   │       ├── ReferralPathwayScreen.tsx
│   │   │       ├── NextStepsScreen.tsx
│   │   │       ├── DetailedSteps.tsx
│   │   │       ├── PathwayGuidance.tsx
│   │   │       ├── ScriptCard.tsx
│   │   │       ├── ImportantReminder.tsx
│   │   │       ├── ReferralReceivedButton.tsx
│   │   │       └── types.ts
│   │   └── transplant-assessment/ # Transplant assessment screens
│   │       ├── AssessmentIntroScreen.tsx
│   │       └── TransplantQuestionnaire.tsx
│   ├── components/                # Reusable UI/UX components
│   │   ├── BottomTabBar.tsx
│   │   ├── Container.tsx
│   │   ├── EditScreenInfo.tsx
│   │   ├── InfoIcon.tsx
│   │   ├── KidneyIcon.tsx
│   │   ├── NavigationBar.tsx
│   │   ├── PathwayBackground.tsx
│   │   ├── ScreenContent.tsx
│   │   ├── WebScrollableFlatList.tsx
│   │   ├── WebScrollableScrollView.tsx
│   │   ├── WebWrapper.tsx
│   │   ├── WheelDatePicker.tsx
│   │   └── WheelPicker.tsx
│   ├── navigation/                # Navigation system
│   │   ├── ScreenRouter.tsx       # Screen rendering component
│   │   ├── types.ts               # Screen types and navigation constants
│   │   ├── useAppState.ts         # App-wide state management hook
│   │   ├── handlers/              # Navigation handlers organized by flow
│   │   │   ├── index.ts
│   │   │   ├── onboardingHandlers.ts
│   │   │   ├── assessmentHandlers.ts
│   │   │   ├── financialHandlers.ts
│   │   │   ├── checklistHandlers.ts
│   │   │   └── patientHandlers.ts
│   │   └── README.md
│   ├── services/                  # API and service layer
│   │   └── api.ts                 # API service client
│   ├── styles/                    # Theme and style definitions
│   │   ├── global.css
│   │   ├── theme.ts
│   │   ├── index.ts
│   │   └── README.md
│   ├── utils/                     # Utility functions
│   │   ├── enableWebMouseDrag.ts
│   │   ├── webStyles.ts
│   │   └── zipCodeLookup.ts
│   └── data/                      # Static data files
│       ├── documents-content.json
│       └── questions.json
├── assets/                        # Images and static assets
├── web/                           # Web-specific files
│   └── index.html
├── app.json                       # Expo app configuration
├── metro.config.js               # Metro bundler configuration
├── package.json
├── tailwind.config.js            # Tailwind CSS configuration
└── tsconfig.json                  # TypeScript configuration
```

