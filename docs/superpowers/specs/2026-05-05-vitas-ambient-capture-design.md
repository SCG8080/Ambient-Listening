# VITAS Ambient Capture — Design Spec
**Date:** 2026-05-05  
**Phase:** 1 (core recording functionality)  
**Author:** Sundeep Singh

---

## Overview

A professional-grade React Native + Expo mobile app for structured ambient audio recording sessions used by VITAS healthcare professionals. Phase 1 delivers the full recording workflow with a premium clinical UI. Deep linking (Phase 2) is not implemented but the architecture is fully prepared for it.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Expo (latest stable) + React Native |
| Language | TypeScript (strict mode) |
| Styling | NativeWind v4 |
| State | Zustand |
| Audio | expo-av |
| Navigation | Expo Router (file-based, tabs) |

---

## Visual Direction

**Deep Navy / Clinical Blue**

- Background: `#0F1B2D`
- Tab bar / surfaces: `#091422`
- Card / elevated surfaces: `#1A3A5C`
- Primary accent: `#4A9EFF`
- Secondary accent: `#5CB8FF`
- Text primary: `#E8F4FF`
- Text secondary: `#A8C4E0`
- Muted / disabled: `#6B8BAA`
- Recording indicator: red pulse `#E53935` when recording; frozen when paused
- Typography: monospace for timer, system sans-serif for labels

Feel: ICU-monitor focus. High contrast. No playfulness.

---

## Architecture

**Pattern:** Clean Architecture — Approach A (Thin Domain, Service-Heavy)

### Layers

```
UI screens → hooks → use cases → services/repository → Zustand store
```

- UI screens contain zero business logic
- Hooks orchestrate use cases and expose state to screens
- Use cases are plain functions; dependencies injected as parameters
- Services implement interfaces (domain depends on abstractions, not Expo AV directly)
- Repository bridges use cases to the Zustand store

### Folder Structure

```
src/
├── domain/
│   ├── entities/
│   │   ├── Recording.ts
│   │   └── SessionContext.ts
│   └── usecases/
│       ├── startRecording.ts
│       ├── pauseRecording.ts
│       ├── resumeRecording.ts
│       ├── stopRecording.ts
│       └── uploadRecording.ts
│
├── data/
│   ├── services/
│   │   ├── RecordingService.ts       # Expo AV implementation of IRecordingService
│   │   └── UploadService.ts          # Mock implementation of IUploadService
│   └── repositories/
│       └── RecordingRepository.ts    # Thin bridge to Zustand store
│
├── presentation/
│   ├── screens/
│   │   ├── RecordingsListScreen.tsx
│   │   ├── RecordingScreen.tsx
│   │   └── ReviewScreen.tsx
│   └── components/
│       ├── RecordingIndicator.tsx    # Animated pulse + waveform
│       ├── RecordingTimer.tsx        # mm:ss display
│       ├── RecordingControls.tsx     # Start / Pause / Resume / Stop
│       ├── PlaybackControls.tsx      # Play / Pause for review
│       ├── PauseTimeline.tsx         # Pause/resume markers on a timeline bar
│       └── RecordingListItem.tsx     # Row in the recordings list
│
├── store/
│   ├── sessionStore.ts               # SessionContext (hardcoded; Phase 2: deep link)
│   ├── recordingStore.ts             # Active session state
│   └── recordingsStore.ts            # Completed recordings + upload status
│
├── hooks/
│   ├── useRecorder.ts                # Orchestrates recording use cases
│   ├── usePlayback.ts                # Playback controls for review
│   └── useAppState.ts                # Background detection → auto-pause
│
└── utils/
    ├── formatTime.ts                 # seconds → mm:ss
    └── permissions.ts               # Microphone permission helper
```

---

## Domain Layer

### Entities

```typescript
// SessionContext.ts
interface SessionContext {
  patientName: string
  teamCode: string
  programCode: string
  source?: 'deeplink' | 'manual'   // Phase 2: set to 'deeplink' when parsed from URL
}

// Recording.ts
interface PauseEvent {
  type: 'pause' | 'resume'
  timestamp: number              // seconds elapsed at the moment of the event
}

type UploadStatus = 'draft' | 'uploading' | 'uploaded' | 'error'

interface Recording {
  id: string
  uri: string                    // local file URI from Expo AV
  durationSeconds: number
  pauseEvents: PauseEvent[]
  session: SessionContext
  uploadStatus: UploadStatus
  createdAt: number              // unix milliseconds
}
```

### Use Cases

Each use case is a plain async function. Dependencies are passed as parameters so they can be replaced with mocks in tests.

| Use Case | Inputs | Responsibility |
|---|---|---|
| `startRecording` | service, store | Request mic permission → start Expo AV recording → initialise active session |
| `pauseRecording` | service, store | Pause Expo AV → read current position → push `{type:'pause', timestamp}` |
| `resumeRecording` | service, store | Resume Expo AV → push `{type:'resume', timestamp}` |
| `stopRecording` | service, repository, sessionCtx, pauseEvents | Stop Expo AV → get URI + duration → build `Recording` → save to repository → return `Recording` id |
| `uploadRecording` | uploadService, repository, id | Set status `uploading` → call upload → set `uploaded` or `error` |

---

## Data Layer

### Service Interfaces

```typescript
interface IRecordingService {
  start(): Promise<void>
  pause(): Promise<number>      // returns position in seconds for pause event timestamp
  resume(): Promise<void>
  stop(): Promise<{ uri: string; durationSeconds: number }>
  getCurrentPosition(): Promise<number>
}

interface IUploadService {
  upload(recording: Recording): Promise<void>
}
```

### RecordingService (Expo AV implementation)

- Holds a single `Audio.Recording` instance — enforces one recording at a time
- Configures audio mode on start: `allowsRecordingIOS: true`, appropriate Android audio category
- `pause()` calls `getStatusAsync()` to read `durationMillis` before pausing — ensures accurate timestamps
- `stop()` calls `stopAndUnloadAsync()`, reads the URI, resets internal instance

### MockUploadService

- `upload()` returns a resolved promise after a 2-second artificial delay
- Simulates realistic loading state without a real backend

### RecordingRepository

Thin bridge — use cases call `repository.save()` and `repository.updateStatus()` rather than touching the Zustand store directly:

```typescript
interface IRecordingRepository {
  save(recording: Recording): void
  updateStatus(id: string, status: UploadStatus): void
  getById(id: string): Recording | undefined
}
```

---

## State Management (Zustand)

### sessionStore

Holds `SessionContext`. Hardcoded in Phase 1. In Phase 2, `setContext()` is called by the deep link handler — no other code changes.

```typescript
interface SessionState {
  context: SessionContext
  setContext: (ctx: SessionContext) => void
}
// Phase 1 initial value:
// { patientName: 'John Doe', teamCode: 'T00', programCode: 'P10', source: 'manual' }
```

### recordingStore

Active recording session only. Reset to initial state when `stopRecording` completes.

```typescript
interface ActiveRecordingState {
  isRecording: boolean
  isPaused: boolean
  elapsedSeconds: number
  pauseEvents: PauseEvent[]
  setElapsed: (s: number) => void
  addPauseEvent: (e: PauseEvent) => void
  reset: () => void
}
```

### recordingsStore

Persisted list of completed recordings, normalised by id.

```typescript
interface RecordingsState {
  recordings: Record<string, Recording>
  activeReviewId: string | null
  addRecording: (r: Recording) => void
  updateStatus: (id: string, status: UploadStatus) => void
  setActiveReview: (id: string) => void
}
```

**Selector pattern:** all components subscribe with a selector function (`useStore(s => s.field)`) to prevent unnecessary re-renders.

---

## Navigation

**Expo Router** file-based tabs:

```
app/
├── _layout.tsx        # Root layout + tab bar (deep navy theme)
└── (tabs)/
    ├── index.tsx      # Recordings List tab
    ├── record.tsx     # Record tab
    └── review.tsx     # Review tab
```

- Review tab is visually disabled (greyed icon, non-tappable) until `activeReviewId` is set
- After `stopRecording` succeeds: `useRecorder` hook receives the returned id, calls `setActiveReview(id)`, then calls `router.push('/(tabs)/review')` — navigation stays in the hook layer, not the use case
- Tapping a recording in the list: calls `setActiveReview(id)` then navigates to Review tab

---

## Screens

### RecordingsListScreen
- Reads `recordingsStore.recordings` (selector)
- Each row: `RecordingListItem` showing duration, upload status badge, pause count
- "New Recording" button navigates to Record tab
- Empty state: "No recordings yet" message

### RecordingScreen
- Renders `RecordingIndicator` + `RecordingTimer` + `RecordingControls`
- All state from `useRecorder()` hook — zero direct store access
- Displays session metadata (patient name, team code, program code) from `sessionStore`

### ReviewScreen
- Reads active recording via `recordingsStore.activeReviewId`
- `PlaybackControls`: play/pause the recording file
- `PauseTimeline`: horizontal bar with coloured markers at each pause/resume timestamp
- Session metadata panel: patient name, team/program codes, duration
- Upload button: calls `useUpload().upload(id)`, shows loading/success/error state

---

## Key UX Flows

### Background Auto-Pause
`useAppState` subscribes to `AppState.change`:
- `background` → if `isRecording && !isPaused` → calls `pauseRecording` use case
- `active` → no action (user must resume manually)

### Permission Denied
`startRecording` returns `{ error: 'permission_denied' }`. `useRecorder` shows an Alert with a link to Settings. Record button remains inert.

### Rapid Tap Guard
`useRecorder` holds a `isTransitioning` ref. All control buttons are `disabled` while `isTransitioning === true`. Set `true` at the start of each async operation, `false` in `finally`.

### Recording Indicator Animation
- **Recording (active):** 11-bar waveform with staggered `Animated.loop` timing + outer pulsing ring glow
- **Paused:** bars freeze at mid-height, ring glow extinguishes, label reads "PAUSED"
- **Stopped:** component unmounts / replaced by static icon

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Mic permission denied | Alert + link to Settings; record button disabled |
| Rapid pause/resume taps | `isTransitioning` ref disables buttons during async ops |
| App backgrounded while recording | Auto-pause via `useAppState`; user must manually resume |
| Recording interrupted (call, etc.) | Expo AV fires an interruption event → treat as background pause |
| Multiple simultaneous recordings | `RecordingService` holds one `Audio.Recording` instance; throws if `start()` called while active |

---

## Phase 2 Readiness

Everything that will change in Phase 2 deep linking:

1. **`sessionStore`** — `setContext()` is called by the deep link handler instead of the hardcoded initialiser. No other store changes.
2. **`app/_layout.tsx`** — add `Linking` config and call `sessionStore.setContext()` from the URL parser.
3. **`SessionContext.source`** — set to `'deeplink'` instead of `'manual'`.

Nothing in the domain, data, presentation, or hooks layers needs to change.

---

## Bonus Features (preferred)

- **Haptic feedback:** light impact on pause/resume, medium on stop
- **Dark mode:** already dark-native; light mode not required in Phase 1
- **Subtle animations:** waveform, timer fade-in, list item slide-in
- **Unit test examples:** `startRecording.test.ts` and `pauseRecording.test.ts` with mocked service and store
