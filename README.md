# Project Arise

> A gamified personal operating system built with React Native + Expo.

Project Arise merges disciplined self-management with a trading-focused workflow inside one unified progression loop. Switch between **MONARCH** (life system) and **SOVEREIGN** (finance system) protocols — every action earns XP, builds stats, and advances your rank.

---

## Why This App

Most productivity apps track tasks. Most trading journals track trades.  
Project Arise connects both:

- Complete real-life actions → earn XP and stat growth
- Log trades and prep economic events → grow your trader perception
- Level up your profile and unlock higher ranks
- Switch protocols with an animated system transition

The goal is to make consistency **visible**, **measurable**, and **motivating**.

---

## Protocols

### MONARCH Protocol — Life System

| Tab | Description |
|-----|-------------|
| **Today** | Mission control: daily progress, active objectives, habit snapshot, and quick journal preview |
| **Quests** | Rank-based quests with categories, XP rewards, progress tracking (%), filters, and swipe actions |
| **Habits** | Streak tracking, weekly view, calendar history, and XP per habit completion |
| **Journal** | Date-based entries with fast access to today's log |

### SOVEREIGN Protocol — Finance System

| Tab | Description |
|-----|-------------|
| **Pulse** | Market readiness dashboard and perception (PER) growth tracking |
| **Terminal** | Trade logger with entry/exit capture, pip preview, notes, and XP/Gold gain |
| **News** | Economic event checklist with prep toggles that award PER XP |
| **Vault** | Wins/losses/net pips summary and milestone-style finance snapshot |

### Profile + Progression

- Level system with dynamic XP thresholds
- Stat growth across `INT`, `PER`, `STR`, and `VIT`
- Rank progression from `E` → `D` → `C` → `B` → `A` → `S`
- Protocol switching with animated full-screen transition overlay
- Profile avatar customization via image picker
- **Settings** screen (accessible via gear icon on the Profile tab):
  - Theme picker: `Light`, `Dark`, `Auto` (follows device)
  - Notification toggles: Quest Reminders, Habit Alerts, Penalty Warnings
  - Data management: Reset Quests, Reset Habits, Clear Trade Logs
  - Danger Zone: Wipe All Data (with confirmation modal)
  - About modal: version, build info, and credits

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo (SDK 54) |
| Routing | Expo Router (file-based, typed routes) |
| Language | TypeScript |
| State | Zustand v5 + AsyncStorage persistence |
| Animation | React Native Reanimated 4 + Gesture Handler |
| Icons | Lucide React Native |
| Fonts | Inter, JetBrains Mono, Orbitron, Rajdhani (via Expo Google Fonts) |
| Images | Expo Image + Expo Image Picker |
| Haptics | Expo Haptics |
| Testing | Vitest |
| Architecture | New Architecture enabled, React Compiler experimental |

---

## Local-First Data Model

All state is persisted on-device with `AsyncStorage` via Zustand persistence middleware. No backend required.

**Tracked entities:**

- Quests and quest categories
- Habits and streak history
- Journal entries
- Trade logs
- Prepared economic events
- Profile, level, XP, stats, and rank
- Active protocol preference
- Inventory items

---

## Project Structure

```text
app/
  _layout.tsx            # Root layout + font loading + splash screen
  (tabs)/
    _layout.tsx          # Tab navigator + protocol-aware tab config
    index.tsx            # Today dashboard (MONARCH)
    quests.tsx           # Quest management (MONARCH)
    habits.tsx           # Habit tracking (MONARCH)
    journal.tsx          # Daily journal (MONARCH)
    pulse.tsx            # Market readiness (SOVEREIGN)
    terminal.tsx         # Trade logger (SOVEREIGN)
    news.tsx             # Economic events (SOVEREIGN)
    vault.tsx            # Performance summary (SOVEREIGN)
    stats.tsx            # Profile + protocol switch
    inventory.tsx        # Inventory module
    settings.tsx         # App settings (theme, notifications, data)

src/
  store/
    useSystemStore.ts    # Central Zustand store (all state + progression logic)
    systemUtils.ts       # XP/level utility helpers
    systemUtils.test.ts  # Unit tests (Vitest)
  theme/
    ThemeContext.tsx      # Theme provider + useTheme hook
    colors.ts            # Color tokens (light/dark + protocol accents)
    fonts.ts             # Font family constants
  components/
    LevelUpModal.tsx     # Animated level-up celebration modal
    ui/                  # Shared UI primitives
  features/
    habits/              # Habit-specific components
    quests/              # Quest-specific components
    stats/               # Stats/profile components
  utils/                 # General utility helpers

assets/
  images/                # App icons, splash, favicon
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm**
- **Expo Go** app (iOS / Android) for quick device testing, or use an emulator/simulator

### Install

```bash
npm install
```

### Run

```bash
npm run start
```

Scan the QR code in Expo Go, or press `a` (Android), `i` (iOS), or `w` (web) in the terminal.

### Useful Scripts

```bash
npm run start        # Start the Expo dev server
npm run android      # Launch on Android emulator/device
npm run ios          # Launch on iOS simulator/device
npm run web          # Launch in browser
npm run lint         # Run ESLint
npm run typecheck    # Type-check without emitting
npm run test         # Run Vitest unit tests
```

---

## Screenshots

> Add app screenshots or a screen recording here for your GitHub showcase.

Suggested captures:
- Today dashboard (MONARCH mode)
- Quests — add/edit + progress mode
- Habits — calendar + streaks
- Trade Terminal + Vault (SOVEREIGN mode)
- Profile tab + protocol switch overlay
- Settings screen

---

## Roadmap

- [ ] Cloud sync / account backup
- [ ] Push notifications (quest reminders, habit nudges, penalty alerts)
- [ ] Richer analytics: trend charts and performance breakdowns
- [ ] Calendar integrations
- [ ] Expanded finance metrics: risk/reward, drawdown tracking
- [ ] Notification persistence (currently UI-only toggles)
- [ ] Export journal and trade logs to PDF/CSV

---

## Contributing

Contributions, ideas, and UX improvements are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a pull request

---

## Author

**Usher Kielvin** — [@usherponce](https://github.com/usherponce)

---

## License

Add your preferred license file (`MIT`, `Apache-2.0`, etc.) and update this section accordingly.
