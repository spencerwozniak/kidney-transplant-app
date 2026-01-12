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
cd nodesian/kidney-transplant-app
npm install
```

or if you're using yarn:

```bash
yarn install
```

### 2. Start the Development Server

Run the Expo development server:

```bash
npm start
```

or:

```bash
expo start
```

This will:

- Start the Metro bundler
- Display a QR code in your terminal
- Open the Expo DevTools in your browser

---

## Running on Your Phone

### Method 1: Using Expo Go (Recommended for Development)

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

### Method 2: Using Development Build

If you need native modules or want to test a production-like build:

```bash
# For Android
npm run android

# For iOS (requires macOS and Xcode)
npm run ios
```

### Method 3: Using Tunnel (Different Networks)

If your phone and computer are on different networks, use tunnel mode:

```bash
expo start --tunnel
```

This uses Expo's tunnel service to connect your devices over the internet.

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
my-expo-app/
├── src/
|   ├── App.tsx
│   ├── pages/           # Full page/screen components
│   │   ├── TransplantQuestionnaire.tsx
│   │   └── StyleExamples.tsx
│   ├── components/      # Reusable UI/UX components
│   │   ├── Container.tsx
│   │   ├── EditScreenInfo.tsx
│   │   └── ScreenContent.tsx
│   └── styles/          # Theme and style definitions
│       ├── global.css
│       ├── theme.ts
│       ├── index.ts
│       └── README.md
├── app.json
├── metro.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```
