# Project Arise

Project Arise is a gamified personal operating system built with React Native + Expo.
It combines disciplined self-management (quests, habits, journaling, streaks) with a trading-focused workflow (market pulse, trade journal, event prep, performance vault) inside one progression loop.

## Why This App

Most productivity apps track tasks, and most trading journals track trades.
Project Arise connects both:

- complete real-life actions
- earn XP and stat growth
- level up your profile
- switch between life protocol and trading protocol

The goal is to make consistency visible, measurable, and motivating.

## Core Experience

### MONARCH Protocol (Life System)

- `Today`: mission control with daily progress, active objectives, habit snapshot, and quick journal preview
- `Quests`: rank-based quests with categories, XP rewards, progress-based quests (% tracking), filters, and swipe actions
- `Habits`: streak tracking, weekly view, calendar history, and XP per habit completion
- `Journal`: date-based entries with fast access to today's log

### SOVEREIGN Protocol (Finance System)

- `Pulse`: market readiness dashboard and perception growth tracking
- `Terminal`: trade logger with entry/exit capture, pips preview, notes, and XP/Gold gain
- `News`: economic event checklist with prep toggles that award PER XP
- `Vault`: wins/losses/net pips summary and milestone-style finance snapshot

### Profile + Progression

- level system with dynamic XP thresholds
- stat growth across `INT`, `PER`, `STR`, and `VIT`
- rank progression from `E` to `S`
- protocol switching with animated transition
- profile avatar customization and theme mode controls (`light`, `dark`, `auto`)

## Tech Stack

- React Native + Expo (SDK 54)
- Expo Router (file-based routing)
- TypeScript
- Zustand + persisted local storage
- Reanimated + Gesture Handler
- NativeWind/Tailwind for utility styling where needed
- Vitest for logic testing

## Local-First Data Model

State is persisted on-device with AsyncStorage via Zustand persistence middleware.

Tracked entities include:

- quests and categories
- habits and streak history
- journal entries
- trade logs
- prepared economic events
- profile and protocol preferences

## Project Structure

```text
app/
  (tabs)/
    index.tsx      # Today dashboard
    quests.tsx     # Quest management
    habits.tsx     # Habit tracking
    journal.tsx    # Daily journal
    pulse.tsx      # Finance pulse
    terminal.tsx   # Trade journal
    news.tsx       # Economic events
    vault.tsx      # Performance summary
    stats.tsx      # Profile / protocol switch
src/
  store/           # Zustand state + progression logic
  theme/           # Theme tokens and provider
  components/      # Shared UI modules
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Expo Go app (optional for mobile testing)

### Install

```bash
npm install
```

### Run

```bash
npm run start
```

You can then launch on:

- Android emulator/device
- iOS simulator/device
- web

### Useful Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
npm run test
```

## Screenshots

Add app screenshots or screen recordings here for your GitHub showcase.

Suggested sections:

- Today dashboard
- Quests (add/edit + progress mode)
- Habits calendar + streaks
- Finance Terminal + Vault
- Profile + protocol switch overlay

## Roadmap

- cloud sync / account backup
- richer analytics and trend charts
- calendar integrations
- expanded finance metrics and risk tracking
- notification and reminder system

## Contributing

Contributions, ideas, and UX improvements are welcome.

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## License

Add your preferred license file (`MIT`, `Apache-2.0`, etc.) and update this section accordingly.
