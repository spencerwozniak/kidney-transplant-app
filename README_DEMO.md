Demo Notes — Kidney Transplant App

Small fixes were applied to ensure reliable demo behavior. Summary:

- API base URL: the app now uses the environment variable EXPO_PUBLIC_API_URL when present and falls back to http://127.0.0.1:8000 for local development. This lets Expo Go (physical devices) hit your machine by setting the LAN IP in .env.
- Logging: API requests and response statuses are logged to the JS console to make network activity visible during demos.
- Checklist document picker: fixed handling of expo-document-picker responses so selected files are uploaded correctly.
- Delete patient (web): fixed confirmation so delete runs in web builds (uses window.confirm on web and Alert.alert on native).
- .env ignore: added .env to .gitignore to avoid leaking local API URLs.
- Dependency alignment: bumped a few Expo-related package versions to match expected SDK compatibility. If you encounter peer dependency issues, run npm install --legacy-peer-deps.

Quick demo run (recommended):

1. Ensure backend is running locally on port 8000 (or set a different host in .env).
2. In the project root, set the API URL (for physical device use your machine LAN IP):

```bash
# macOS / zsh example (physical device on same LAN)
export EXPO_PUBLIC_API_URL=http://192.168.1.208:8000
# or for iOS simulator (localhost)
export EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

3. Start Expo (clear cache):

```bash
npx expo start -c
```

4. Open the app on your target device (press `i` for iOS simulator, scan QR for Expo Go on iPhone).

5. Demo flow to exercise integrations:
  - Create patient (onboarding)
  - Complete assessment(s)
  - View status on Home
  - Open checklist item → Upload Documents
  - Delete patient (Settings or Home danger zone)

If you want me to commit these README changes or the code fixes, tell me and I will create a commit. Otherwise these files remain uncommitted for your review.
