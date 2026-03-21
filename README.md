# my-counter-app

A minimal personal finance tracker for Android and iOS. Track multiple independent running totals — savings goals, spending categories, anything with a number — using a stack of tappable index cards.

## Features

- **Multiple trackers** — create as many as you need, each with its own total and action buttons
- **Action buttons** — define custom +/− buttons (e.g. "Solo Starbucks −$4.50") and tap them to update the total instantly
- **Undo & clear** — step back one action at a time, or reset a total to zero
- **Persistent storage** — all data saved locally on-device via SQLite; nothing leaves your phone
- **Card stack UI** — trackers displayed as a physical stack; tap to expand full-screen, swipe down or press ← to dismiss

## Tech Stack

- [Expo](https://expo.dev) ~54 / React Native 0.81
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) for local persistence
- No backend, no accounts, no network requests

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [Expo Go](https://expo.dev/client) on your phone, or an Android/iOS simulator

### Run locally

```bash
git clone <your-repo-url>
cd my-counter-app
npm install
npm start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

## Building for Distribution

### Sideload APK (Android, no Play Store needed)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

Download the `.apk` from the link EAS provides, transfer it to your device, and install it. You'll need to allow installation from unknown sources in your Android settings.

### App Store / Google Play

```bash
eas build --platform all --profile production
eas submit --platform all
```

Requires an Apple Developer account ($99/year) and a Google Play Developer account ($25 one-time).

## Project Structure

```
my-counter-app/
├── App.js                        # Root — DB init, tracker state, overlay render
├── src/
│   ├── db.js                     # SQLite schema, migrations, all CRUD functions
│   ├── StackScreen.js            # Home screen — card stack view
│   ├── CardDetailScreen.js       # Full-screen single tracker view
│   └── components/
│       ├── StackCard.js          # One card in the stack (presentational)
│       ├── ActionButton.js       # Tappable +/− action tile
│       └── ButtonModal.js        # Sheet modal for creating a new action button
└── assets/                       # Icons and splash screen images
```

## Data Model

All data is stored locally in a SQLite database (`counter.db`).

```
trackers  — id, name, value, sort_order
actions   — id, label, amount, tracker_id
```

No data is ever sent off-device.
