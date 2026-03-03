# Understandify

## Current State
The app starts with a SplashScreen (animated logo) and then goes straight into ChildMode. There is no login/welcome screen. Parent access is gated behind a PIN modal triggered from within the app header.

## Requested Changes (Diff)

### Add
- A LoginScreen component that appears immediately after the SplashScreen dismisses (before ChildMode or ParentMode is shown).
- The LoginScreen lets the user choose: "I'm a Child" or "I'm a Parent".
  - "I'm a Child" goes directly into ChildMode.
  - "I'm a Parent" opens the PIN entry modal (same flow as the existing parent mode switch).
- The login screen should be visually themed (space/stars) and show the Understandify logo and name prominently.
- After successful login (child or parent), store the chosen mode in state and show the appropriate mode.

### Modify
- App.tsx: Add a new app stage "login" between splash and main. After splash dismisses, show LoginScreen instead of going directly to the main app. Once user picks a role (child or parent with correct PIN), proceed to the main app with the chosen mode.
- The existing "Parent" button in the header (child mode) and the three-dots "Exit Parent Mode" remain functional as before.

### Remove
- Nothing removed, only the initial flow is extended.

## Implementation Plan
1. Create `src/frontend/src/components/LoginScreen.tsx` — a full-screen welcome/login page with two big buttons: "I'm a Child 🚀" and "I'm a Parent 🔐". Show the logo (half-body: `/assets/generated/understandify-logo-half.dim_512x512.png`) and the app name. Space themed background.
2. Modify `App.tsx` to add a `stage` state with values `"splash" | "login" | "app"`. After splash, show LoginScreen. From LoginScreen, child click → stage="app" mode="child". Parent click → open PIN modal; on success → stage="app" mode="parent".
3. Add `data-ocid` markers on the two login buttons: `login.child_button` and `login.parent_button`.
