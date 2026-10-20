# Firebase setup for C Trader

Firebase adds email/password account creation and sign-in, plus private cloud sync for a user's **demo** balance, holdings and recent trade history.

## 1. Create/configure Firebase

1. Open the Firebase Console and create or select a project.
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. In **Project settings → Your apps**, register a Web app and copy its web configuration values.
4. In **Firestore Database**, create a database.
5. From the repository root, publish the included owner-only rules using the Firebase CLI: `firebase deploy --only firestore:rules` after selecting your project, or paste `firestore.rules` into the Firestore Rules editor and publish.

## 2. Configure the web build

Copy `frontend-web/.env.example` to `frontend-web/.env` for local builds, then fill in `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID` from the Firebase web app config.

For a hosted build, configure the same variables in the hosting provider's build environment and rebuild. These Firebase web-app values are client configuration, not server credentials; Firestore Security Rules and Firebase Authentication enforce access. Do not put service-account JSON or private keys in frontend variables.

## 3. What it does

- Email/password registration and login.
- Sign-out.
- Loads and saves the signed-in user's demo balance, holdings and up to 200 recent trades under `userWorkspaces/{uid}`.
- Firestore rules restrict each workspace to its owner.

## Important live-trading boundary

Firebase login and the demo workspace are not yet a complete multi-user live-trading authorization system. The live order API still uses the separately configured backend bearer token and server-side exchange credentials. Do not expose that token in a public production app or give all users a shared trading token. Before enabling multi-user live orders, add Firebase Admin ID-token verification on the backend, per-user authorization, per-user exchange credential isolation, order limits, idempotency, audit logging and reconciliation. Live trading remains disabled by default.
