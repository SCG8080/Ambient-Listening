# VITAS Ambient Capture — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade React Native + Expo voice recording app with Clean Architecture, Deep Navy UI, and structured ambient recording sessions for VITAS healthcare professionals.

**Architecture:** Clean Architecture Approach A (Thin Domain, Service-Heavy) — UI screens call hooks, hooks call use-case functions, use cases call injected service/repository dependencies. Expo AV is hidden behind an `IRecordingService` interface; the Zustand store is hidden behind an `IRecordingRepository` interface. Navigation and side effects (timers, haptics) live exclusively in the hook layer.

**Tech Stack:** Expo SDK 52 + Expo Router v4, React Native, TypeScript strict, Zustand, NativeWind v4, **expo-audio** (not expo-av), expo-haptics, Jest (jest-expo)

---

## ⚠️ Expo Skill Constraints (apply to every task)

| Rule | Detail |
|---|---|
| `expo-audio` not `expo-av` | Recording: `useAudioRecorder`, `AudioModule`, `setAudioModeAsync`. Playback: `useAudioPlayer` |
| `NativeTabs` not `Tabs` | `import { NativeTabs } from 'expo-router/unstable-native-tabs'`. SF Symbols for icons (`sf="mic.fill"`) |
| Inline styles only | No `StyleSheet.create` — use plain JS objects `style={{ ... }}` |
| No `SafeAreaView` from RN | Use `ScrollView contentInsetAdjustmentBehavior="automatic"` |
| `ThemeProvider` | Wrap root in `<ThemeProvider theme={DarkTheme}>` from `@react-navigation/native` |
| Kebab-case filenames | `recording-screen.tsx` not `RecordingScreen.tsx` — applies to all new files |
| `expo-image` for SF Symbols | In screens/components use `<Image source="sf:mic.fill" />` from `expo-image` |
| `AudioRecorderAdapter` | Because `useAudioRecorder` is a hook, wrap it in an adapter class that implements `IRecordingService`. Create in `src/data/services/audio-recorder-adapter.ts` |

---

## File Map

### Config / Root
| File | Purpose |
|---|---|
| `package.json` | Dependencies + jest config |
| `tsconfig.json` | Strict mode + path alias `@/*` → `src/*` |
| `babel.config.js` | NativeWind babel preset |
| `metro.config.js` | NativeWind metro wrapper |
| `tailwind.config.js` | Deep Navy palette + content paths |
| `global.css` | Tailwind directives |
| `app.json` | Permissions: microphone (iOS + Android) |

### App (Expo Router)
| File | Purpose |
|---|---|
| `app/_layout.tsx` | Root Stack, imports global.css |
| `app/(tabs)/_layout.tsx` | Tab navigator: List / Record / Review |
| `app/(tabs)/index.tsx` | Renders RecordingsListScreen |
| `app/(tabs)/record.tsx` | Renders RecordingScreen |
| `app/(tabs)/review.tsx` | Renders ReviewScreen |

### Domain
| File | Purpose |
|---|---|
| `src/domain/entities/SessionContext.ts` | SessionContext interface |
| `src/domain/entities/Recording.ts` | PauseEvent, UploadStatus, Recording interfaces |
| `src/domain/usecases/startRecording.ts` | Requests permission → starts service → calls storeStart |
| `src/domain/usecases/pauseRecording.ts` | Pauses service → logs pause event |
| `src/domain/usecases/resumeRecording.ts` | Resumes service → logs resume event |
| `src/domain/usecases/stopRecording.ts` | Stops service → builds Recording → saves to repository |
| `src/domain/usecases/uploadRecording.ts` | Calls upload service → updates status in repository |

### Data
| File | Purpose |
|---|---|
| `src/data/services/IRecordingService.ts` | Interface: start/pause/resume/stop/getCurrentPosition |
| `src/data/services/IUploadService.ts` | Interface: upload(recording) |
| `src/data/repositories/IRecordingRepository.ts` | Interface: save/updateStatus/getById |
| `src/data/services/RecordingService.ts` | Expo AV implementation of IRecordingService |
| `src/data/services/MockUploadService.ts` | 2-second delay mock |
| `src/data/repositories/RecordingRepository.ts` | Zustand bridge implementation |
| `src/data/services/recordingServiceInstance.ts` | Shared singleton export |
| `src/data/repositories/recordingRepositoryInstance.ts` | Shared singleton export |

### Store
| File | Purpose |
|---|---|
| `src/store/sessionStore.ts` | SessionContext (hardcoded Phase 1 values) |
| `src/store/recordingStore.ts` | Active session: isRecording, isPaused, elapsed, pauseEvents |
| `src/store/recordingsStore.ts` | Completed recordings map + activeReviewId |

### Hooks
| File | Purpose |
|---|---|
| `src/hooks/useRecorder.ts` | Orchestrates recording use cases, timer, haptics, navigation |
| `src/hooks/usePlayback.ts` | Expo AV Sound playback for review |
| `src/hooks/useAppState.ts` | AppState listener → auto-pause on background |

### Utils
| File | Purpose |
|---|---|
| `src/utils/formatTime.ts` | seconds → "mm:ss" string |
| `src/utils/permissions.ts` | requestMicrophonePermission() |

### Presentation — Components
| File | Purpose |
|---|---|
| `src/presentation/components/RecordingIndicator.tsx` | Animated 11-bar waveform + pulse ring |
| `src/presentation/components/RecordingTimer.tsx` | Monospace mm:ss display |
| `src/presentation/components/RecordingControls.tsx` | Start / Pause / Resume / Stop buttons |
| `src/presentation/components/PlaybackControls.tsx` | Play / Pause for review |
| `src/presentation/components/PauseTimeline.tsx` | Timeline bar with pause/resume markers |
| `src/presentation/components/RecordingListItem.tsx` | List row: duration, status badge, pause count |

### Presentation — Screens
| File | Purpose |
|---|---|
| `src/presentation/screens/RecordingsListScreen.tsx` | Scrollable recording list + new recording button |
| `src/presentation/screens/RecordingScreen.tsx` | Indicator + timer + controls + session header |
| `src/presentation/screens/ReviewScreen.tsx` | Playback + timeline + metadata + upload button |

### Tests
| File | Purpose |
|---|---|
| `src/__tests__/utils/formatTime.test.ts` | Pure function unit tests |
| `src/__tests__/domain/usecases/startRecording.test.ts` | Mock service + store actions |
| `src/__tests__/domain/usecases/pauseRecording.test.ts` | Mock service + store actions |
| `src/__tests__/domain/usecases/stopRecording.test.ts` | Mock service + repository |

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `global.css`, `tailwind.config.js`, `expo-env.d.ts`

- [ ] **Step 1: Initialize Expo project with tabs template**

```bash
cd "/home/sandy/src/expo"
npx create-expo-app@latest "VITAS Ambient Listening" --template tabs
```

If the directory already exists and complains, initialize inside it:
```bash
cd "/home/sandy/src/expo/VITAS Ambient Listening"
npx create-expo-app@latest . --template tabs
# Answer 'y' if prompted about existing directory
```

- [ ] **Step 2: Install project dependencies**

```bash
cd "/home/sandy/src/expo/VITAS Ambient Listening"
npx expo install expo-av expo-haptics expo-router react-native-safe-area-context react-native-screens
npx expo install zustand
npx expo install nativewind@^4.0.0 tailwindcss react-native-reanimated
npx expo install @expo/vector-icons
```

- [ ] **Step 3: Configure TypeScript strict mode with path alias**

Replace `tsconfig.json` entirely:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.d.ts",
    "expo-env.d.ts"
  ]
}
```

- [ ] **Step 4: Configure NativeWind babel**

Replace `babel.config.js` entirely:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

- [ ] **Step 5: Configure NativeWind metro**

Replace `metro.config.js` entirely:
```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
```

- [ ] **Step 6: Create Tailwind config with Deep Navy palette**

Create `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#091422",
          900: "#0F1B2D",
          700: "#1A3A5C",
          500: "#2E6DB4",
        },
        accent: {
          DEFAULT: "#4A9EFF",
          light: "#5CB8FF",
        },
        clinical: {
          text: "#E8F4FF",
          secondary: "#A8C4E0",
          muted: "#6B8BAA",
        },
      },
      fontFamily: {
        mono: ["SpaceMono", "monospace"],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 7: Create global CSS**

Create `global.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Add Jest config to package.json**

Open `package.json` and add/merge the `jest` key:
```json
"jest": {
  "preset": "jest-expo",
  "testMatch": [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.test.tsx"
  ],
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind)"
  ]
}
```

- [ ] **Step 9: Create src directory structure**

```bash
mkdir -p src/domain/entities src/domain/usecases
mkdir -p src/data/services src/data/repositories
mkdir -p src/store src/hooks src/utils
mkdir -p src/presentation/components src/presentation/screens
mkdir -p src/__tests__/utils src/__tests__/domain/usecases
```

- [ ] **Step 10: Verify project runs**

```bash
npx expo start --clear
```

Expected: Metro bundler starts, QR code shown. Press `q` to quit.

- [ ] **Step 11: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Expo project with NativeWind, Zustand, and strict TypeScript"
```

---

## Task 2: Domain Entities

**Files:**
- Create: `src/domain/entities/SessionContext.ts`
- Create: `src/domain/entities/Recording.ts`

- [ ] **Step 1: Create SessionContext entity**

Create `src/domain/entities/SessionContext.ts`:
```typescript
export interface SessionContext {
  patientName: string
  teamCode: string
  programCode: string
  source?: 'deeplink' | 'manual'
}
```

- [ ] **Step 2: Create Recording entity**

Create `src/domain/entities/Recording.ts`:
```typescript
export interface PauseEvent {
  type: 'pause' | 'resume'
  timestamp: number
}

export type UploadStatus = 'draft' | 'uploading' | 'uploaded' | 'error'

export interface Recording {
  id: string
  uri: string
  durationSeconds: number
  pauseEvents: PauseEvent[]
  session: import('./SessionContext').SessionContext
  uploadStatus: UploadStatus
  createdAt: number
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/domain/entities/
git commit -m "feat: add domain entities - Recording, PauseEvent, SessionContext"
```

---

## Task 3: Service & Repository Interfaces

**Files:**
- Create: `src/data/services/IRecordingService.ts`
- Create: `src/data/services/IUploadService.ts`
- Create: `src/data/repositories/IRecordingRepository.ts`

- [ ] **Step 1: Create IRecordingService**

Create `src/data/services/IRecordingService.ts`:
```typescript
export interface IRecordingService {
  start(): Promise<void>
  pause(): Promise<number>
  resume(): Promise<void>
  stop(): Promise<{ uri: string; durationSeconds: number }>
  getCurrentPosition(): Promise<number>
}
```

- [ ] **Step 2: Create IUploadService**

Create `src/data/services/IUploadService.ts`:
```typescript
import type { Recording } from '../../domain/entities/Recording'

export interface IUploadService {
  upload(recording: Recording): Promise<void>
}
```

- [ ] **Step 3: Create IRecordingRepository**

Create `src/data/repositories/IRecordingRepository.ts`:
```typescript
import type { Recording, UploadStatus } from '../../domain/entities/Recording'

export interface IRecordingRepository {
  save(recording: Recording): void
  updateStatus(id: string, status: UploadStatus): void
  getById(id: string): Recording | undefined
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/data/
git commit -m "feat: add service and repository interfaces"
```

---

## Task 4: formatTime Utility (TDD)

**Files:**
- Create: `src/__tests__/utils/formatTime.test.ts`
- Create: `src/utils/formatTime.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/utils/formatTime.test.ts`:
```typescript
import { formatTime } from '../../utils/formatTime'

describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats seconds only', () => {
    expect(formatTime(45)).toBe('00:45')
  })

  it('formats one minute exactly', () => {
    expect(formatTime(60)).toBe('01:00')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('02:05')
  })

  it('formats large values', () => {
    expect(formatTime(3661)).toBe('61:01')
  })

  it('floors fractional seconds', () => {
    expect(formatTime(90.9)).toBe('01:30')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx jest --testPathPattern="formatTime" --passWithNoTests=false
```

Expected: FAIL — `Cannot find module '../../utils/formatTime'`

- [ ] **Step 3: Implement formatTime**

Create `src/utils/formatTime.ts`:
```typescript
export function formatTime(seconds: number): string {
  const total = Math.floor(seconds)
  const mm = Math.floor(total / 60).toString().padStart(2, '0')
  const ss = (total % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx jest --testPathPattern="formatTime"
```

Expected: PASS — 6 tests passing

- [ ] **Step 5: Create permissions utility**

Create `src/utils/permissions.ts`:
```typescript
import { Audio } from 'expo-av'

export async function requestMicrophonePermission(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync()
  return status === 'granted'
}
```

- [ ] **Step 6: Commit**

```bash
git add src/utils/ src/__tests__/utils/
git commit -m "feat: add formatTime utility and microphone permission helper"
```

---

## Task 5: Zustand Stores

**Files:**
- Create: `src/store/sessionStore.ts`
- Create: `src/store/recordingStore.ts`
- Create: `src/store/recordingsStore.ts`

- [ ] **Step 1: Create sessionStore**

Create `src/store/sessionStore.ts`:
```typescript
import { create } from 'zustand'
import type { SessionContext } from '../domain/entities/SessionContext'

interface SessionState {
  context: SessionContext
  setContext: (ctx: SessionContext) => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  context: {
    patientName: 'John Doe',
    teamCode: 'T00',
    programCode: 'P10',
    source: 'manual',
  },
  setContext: (ctx) => set({ context: ctx }),
}))
```

- [ ] **Step 2: Create recordingStore**

Create `src/store/recordingStore.ts`:
```typescript
import { create } from 'zustand'
import type { PauseEvent } from '../domain/entities/Recording'

interface ActiveRecordingState {
  isRecording: boolean
  isPaused: boolean
  elapsedSeconds: number
  pauseEvents: PauseEvent[]
  start: () => void
  pause: () => void
  resume: () => void
  setElapsed: (s: number) => void
  addPauseEvent: (e: PauseEvent) => void
  reset: () => void
}

const initialState = {
  isRecording: false,
  isPaused: false,
  elapsedSeconds: 0,
  pauseEvents: [] as PauseEvent[],
}

export const useRecordingStore = create<ActiveRecordingState>()((set) => ({
  ...initialState,
  start: () => set({ isRecording: true, isPaused: false, elapsedSeconds: 0, pauseEvents: [] }),
  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
  setElapsed: (elapsedSeconds) => set({ elapsedSeconds }),
  addPauseEvent: (e) => set((state) => ({ pauseEvents: [...state.pauseEvents, e] })),
  reset: () => set(initialState),
}))
```

- [ ] **Step 3: Create recordingsStore**

Create `src/store/recordingsStore.ts`:
```typescript
import { create } from 'zustand'
import type { Recording, UploadStatus } from '../domain/entities/Recording'

interface RecordingsState {
  recordings: Record<string, Recording>
  activeReviewId: string | null
  addRecording: (r: Recording) => void
  updateStatus: (id: string, status: UploadStatus) => void
  setActiveReview: (id: string) => void
}

export const useRecordingsStore = create<RecordingsState>()((set) => ({
  recordings: {},
  activeReviewId: null,
  addRecording: (r) =>
    set((state) => ({ recordings: { ...state.recordings, [r.id]: r } })),
  updateStatus: (id, status) =>
    set((state) => ({
      recordings: {
        ...state.recordings,
        [id]: { ...state.recordings[id], uploadStatus: status },
      },
    })),
  setActiveReview: (id) => set({ activeReviewId: id }),
}))
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/store/
git commit -m "feat: add Zustand stores for session, active recording, and recordings list"
```

---

## Task 6: startRecording Use Case (TDD)

**Files:**
- Create: `src/__tests__/domain/usecases/startRecording.test.ts`
- Create: `src/domain/usecases/startRecording.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/domain/usecases/startRecording.test.ts`:
```typescript
import { startRecording } from '../../../domain/usecases/startRecording'
import type { IRecordingService } from '../../../data/services/IRecordingService'

const mockService: IRecordingService = {
  start: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(0),
  resume: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue({ uri: 'file://test.m4a', durationSeconds: 0 }),
  getCurrentPosition: jest.fn().mockResolvedValue(0),
}

describe('startRecording', () => {
  const mockStoreStart = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('returns success when permission is granted', async () => {
    const requestPermission = jest.fn().mockResolvedValue(true)
    const result = await startRecording(mockService, mockStoreStart, requestPermission)
    expect(result).toEqual({ success: true })
    expect(mockService.start).toHaveBeenCalledTimes(1)
    expect(mockStoreStart).toHaveBeenCalledTimes(1)
  })

  it('returns permission_denied when permission is not granted', async () => {
    const requestPermission = jest.fn().mockResolvedValue(false)
    const result = await startRecording(mockService, mockStoreStart, requestPermission)
    expect(result).toEqual({ success: false, error: 'permission_denied' })
    expect(mockService.start).not.toHaveBeenCalled()
    expect(mockStoreStart).not.toHaveBeenCalled()
  })

  it('returns unknown error when service throws', async () => {
    const requestPermission = jest.fn().mockResolvedValue(true)
    ;(mockService.start as jest.Mock).mockRejectedValueOnce(new Error('Audio failure'))
    const result = await startRecording(mockService, mockStoreStart, requestPermission)
    expect(result).toEqual({ success: false, error: 'unknown' })
    expect(mockStoreStart).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx jest --testPathPattern="startRecording"
```

Expected: FAIL — `Cannot find module '../../../domain/usecases/startRecording'`

- [ ] **Step 3: Implement startRecording**

Create `src/domain/usecases/startRecording.ts`:
```typescript
import type { IRecordingService } from '../../data/services/IRecordingService'

export type StartRecordingResult =
  | { success: true }
  | { success: false; error: 'permission_denied' | 'unknown' }

export async function startRecording(
  service: IRecordingService,
  storeStart: () => void,
  requestPermission: () => Promise<boolean>
): Promise<StartRecordingResult> {
  const granted = await requestPermission()
  if (!granted) {
    return { success: false, error: 'permission_denied' }
  }
  try {
    await service.start()
    storeStart()
    return { success: true }
  } catch {
    return { success: false, error: 'unknown' }
  }
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx jest --testPathPattern="startRecording"
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/domain/usecases/startRecording.ts src/__tests__/domain/usecases/startRecording.test.ts
git commit -m "feat: add startRecording use case with permission handling"
```

---

## Task 7: pauseRecording & resumeRecording Use Cases (TDD)

**Files:**
- Create: `src/__tests__/domain/usecases/pauseRecording.test.ts`
- Create: `src/domain/usecases/pauseRecording.ts`
- Create: `src/domain/usecases/resumeRecording.ts`

- [ ] **Step 1: Write the failing test for pauseRecording**

Create `src/__tests__/domain/usecases/pauseRecording.test.ts`:
```typescript
import { pauseRecording } from '../../../domain/usecases/pauseRecording'
import { resumeRecording } from '../../../domain/usecases/resumeRecording'
import type { IRecordingService } from '../../../data/services/IRecordingService'
import type { PauseEvent } from '../../../domain/entities/Recording'

const makeService = (overrides: Partial<IRecordingService> = {}): IRecordingService => ({
  start: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(12.4),
  resume: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue({ uri: 'file://test.m4a', durationSeconds: 0 }),
  getCurrentPosition: jest.fn().mockResolvedValue(18.2),
  ...overrides,
})

describe('pauseRecording', () => {
  it('logs a pause event with the timestamp returned by the service', async () => {
    const service = makeService()
    const storePause = jest.fn()
    const addPauseEvent = jest.fn()

    await pauseRecording(service, storePause, addPauseEvent)

    expect(service.pause).toHaveBeenCalledTimes(1)
    expect(addPauseEvent).toHaveBeenCalledWith<[PauseEvent]>({ type: 'pause', timestamp: 12.4 })
    expect(storePause).toHaveBeenCalledTimes(1)
  })
})

describe('resumeRecording', () => {
  it('logs a resume event with the position after resuming', async () => {
    const service = makeService()
    const storeResume = jest.fn()
    const addPauseEvent = jest.fn()

    await resumeRecording(service, storeResume, addPauseEvent)

    expect(service.resume).toHaveBeenCalledTimes(1)
    expect(service.getCurrentPosition).toHaveBeenCalledTimes(1)
    expect(addPauseEvent).toHaveBeenCalledWith<[PauseEvent]>({ type: 'resume', timestamp: 18.2 })
    expect(storeResume).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx jest --testPathPattern="pauseRecording"
```

Expected: FAIL — Cannot find module

- [ ] **Step 3: Implement pauseRecording**

Create `src/domain/usecases/pauseRecording.ts`:
```typescript
import type { IRecordingService } from '../../data/services/IRecordingService'
import type { PauseEvent } from '../entities/Recording'

export async function pauseRecording(
  service: IRecordingService,
  storePause: () => void,
  addPauseEvent: (e: PauseEvent) => void
): Promise<void> {
  const timestamp = await service.pause()
  addPauseEvent({ type: 'pause', timestamp })
  storePause()
}
```

- [ ] **Step 4: Implement resumeRecording**

Create `src/domain/usecases/resumeRecording.ts`:
```typescript
import type { IRecordingService } from '../../data/services/IRecordingService'
import type { PauseEvent } from '../entities/Recording'

export async function resumeRecording(
  service: IRecordingService,
  storeResume: () => void,
  addPauseEvent: (e: PauseEvent) => void
): Promise<void> {
  await service.resume()
  const timestamp = await service.getCurrentPosition()
  addPauseEvent({ type: 'resume', timestamp })
  storeResume()
}
```

- [ ] **Step 5: Run test to confirm it passes**

```bash
npx jest --testPathPattern="pauseRecording"
```

Expected: PASS — 2 tests passing

- [ ] **Step 6: Commit**

```bash
git add src/domain/usecases/pauseRecording.ts src/domain/usecases/resumeRecording.ts src/__tests__/domain/usecases/pauseRecording.test.ts
git commit -m "feat: add pauseRecording and resumeRecording use cases"
```

---

## Task 8: stopRecording Use Case (TDD)

**Files:**
- Create: `src/__tests__/domain/usecases/stopRecording.test.ts`
- Create: `src/domain/usecases/stopRecording.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/domain/usecases/stopRecording.test.ts`:
```typescript
import { stopRecording } from '../../../domain/usecases/stopRecording'
import type { IRecordingService } from '../../../data/services/IRecordingService'
import type { IRecordingRepository } from '../../../data/repositories/IRecordingRepository'
import type { SessionContext } from '../../../domain/entities/SessionContext'
import type { PauseEvent } from '../../../domain/entities/Recording'

const mockService: IRecordingService = {
  start: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  stop: jest.fn().mockResolvedValue({ uri: 'file://rec.m4a', durationSeconds: 47.3 }),
  getCurrentPosition: jest.fn(),
}

const mockRepository: IRecordingRepository = {
  save: jest.fn(),
  updateStatus: jest.fn(),
  getById: jest.fn(),
}

const session: SessionContext = {
  patientName: 'John Doe',
  teamCode: 'T00',
  programCode: 'P10',
  source: 'manual',
}

const pauseEvents: PauseEvent[] = [
  { type: 'pause', timestamp: 12.4 },
  { type: 'resume', timestamp: 18.2 },
]

describe('stopRecording', () => {
  beforeEach(() => jest.clearAllMocks())

  it('stops the service, saves the recording, and returns an id', async () => {
    const id = await stopRecording(mockService, mockRepository, session, pauseEvents)

    expect(mockService.stop).toHaveBeenCalledTimes(1)
    expect(mockRepository.save).toHaveBeenCalledTimes(1)

    const saved = (mockRepository.save as jest.Mock).mock.calls[0][0]
    expect(saved.id).toBe(id)
    expect(saved.uri).toBe('file://rec.m4a')
    expect(saved.durationSeconds).toBe(47.3)
    expect(saved.pauseEvents).toEqual(pauseEvents)
    expect(saved.session).toEqual(session)
    expect(saved.uploadStatus).toBe('draft')
    expect(typeof saved.createdAt).toBe('number')
  })

  it('returns a non-empty string id', async () => {
    const id = await stopRecording(mockService, mockRepository, session, [])
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx jest --testPathPattern="stopRecording"
```

Expected: FAIL — Cannot find module

- [ ] **Step 3: Implement stopRecording**

Create `src/domain/usecases/stopRecording.ts`:
```typescript
import type { IRecordingService } from '../../data/services/IRecordingService'
import type { IRecordingRepository } from '../../data/repositories/IRecordingRepository'
import type { Recording, PauseEvent } from '../entities/Recording'
import type { SessionContext } from '../entities/SessionContext'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function stopRecording(
  service: IRecordingService,
  repository: IRecordingRepository,
  session: SessionContext,
  pauseEvents: PauseEvent[]
): Promise<string> {
  const { uri, durationSeconds } = await service.stop()
  const recording: Recording = {
    id: generateId(),
    uri,
    durationSeconds,
    pauseEvents,
    session,
    uploadStatus: 'draft',
    createdAt: Date.now(),
  }
  repository.save(recording)
  return recording.id
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx jest --testPathPattern="stopRecording"
```

Expected: PASS — 2 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/domain/usecases/stopRecording.ts src/__tests__/domain/usecases/stopRecording.test.ts
git commit -m "feat: add stopRecording use case"
```

---

## Task 9: uploadRecording Use Case

**Files:**
- Create: `src/domain/usecases/uploadRecording.ts`

- [ ] **Step 1: Implement uploadRecording**

Create `src/domain/usecases/uploadRecording.ts`:
```typescript
import type { IUploadService } from '../../data/services/IUploadService'
import type { IRecordingRepository } from '../../data/repositories/IRecordingRepository'

export async function uploadRecording(
  uploadService: IUploadService,
  repository: IRecordingRepository,
  recordingId: string
): Promise<void> {
  const recording = repository.getById(recordingId)
  if (!recording) {
    throw new Error(`Recording ${recordingId} not found`)
  }
  repository.updateStatus(recordingId, 'uploading')
  try {
    await uploadService.upload(recording)
    repository.updateStatus(recordingId, 'uploaded')
  } catch (err) {
    repository.updateStatus(recordingId, 'error')
    throw err
  }
}
```

- [ ] **Step 2: Run all tests**

```bash
npx jest --passWithNoTests
```

Expected: PASS — all previous tests still passing

- [ ] **Step 3: Commit**

```bash
git add src/domain/usecases/uploadRecording.ts
git commit -m "feat: add uploadRecording use case"
```

---

## Task 10: Data Layer Implementations

**Files:**
- Create: `src/data/services/RecordingService.ts`
- Create: `src/data/services/MockUploadService.ts`
- Create: `src/data/repositories/RecordingRepository.ts`
- Create: `src/data/services/recordingServiceInstance.ts`
- Create: `src/data/repositories/recordingRepositoryInstance.ts`

- [ ] **Step 1: Implement RecordingService (Expo AV)**

Create `src/data/services/RecordingService.ts`:
```typescript
import { Audio } from 'expo-av'
import type { IRecordingService } from './IRecordingService'

export class RecordingService implements IRecordingService {
  private recording: Audio.Recording | null = null

  async start(): Promise<void> {
    if (this.recording) {
      throw new Error('Recording already in progress')
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    })
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    )
    this.recording = recording
  }

  async pause(): Promise<number> {
    if (!this.recording) throw new Error('No active recording')
    const status = await this.recording.getStatusAsync()
    const timestamp = status.isLoaded ? (status.durationMillis ?? 0) / 1000 : 0
    await this.recording.pauseAsync()
    return timestamp
  }

  async resume(): Promise<void> {
    if (!this.recording) throw new Error('No active recording')
    await this.recording.startAsync()
  }

  async stop(): Promise<{ uri: string; durationSeconds: number }> {
    if (!this.recording) throw new Error('No active recording')
    const status = await this.recording.getStatusAsync()
    const durationSeconds = status.isLoaded ? (status.durationMillis ?? 0) / 1000 : 0
    await this.recording.stopAndUnloadAsync()
    const uri = this.recording.getURI() ?? ''
    this.recording = null
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false })
    return { uri, durationSeconds }
  }

  async getCurrentPosition(): Promise<number> {
    if (!this.recording) return 0
    const status = await this.recording.getStatusAsync()
    return status.isLoaded ? (status.durationMillis ?? 0) / 1000 : 0
  }
}
```

- [ ] **Step 2: Implement MockUploadService**

Create `src/data/services/MockUploadService.ts`:
```typescript
import type { IUploadService } from './IUploadService'
import type { Recording } from '../../domain/entities/Recording'

export class MockUploadService implements IUploadService {
  async upload(_recording: Recording): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 2000))
  }
}
```

- [ ] **Step 3: Implement RecordingRepository**

Create `src/data/repositories/RecordingRepository.ts`:
```typescript
import type { IRecordingRepository } from './IRecordingRepository'
import type { Recording, UploadStatus } from '../../domain/entities/Recording'
import { useRecordingsStore } from '../../store/recordingsStore'

export class RecordingRepository implements IRecordingRepository {
  save(recording: Recording): void {
    useRecordingsStore.getState().addRecording(recording)
  }

  updateStatus(id: string, status: UploadStatus): void {
    useRecordingsStore.getState().updateStatus(id, status)
  }

  getById(id: string): Recording | undefined {
    return useRecordingsStore.getState().recordings[id]
  }
}
```

- [ ] **Step 4: Create shared singleton instances**

Create `src/data/services/recordingServiceInstance.ts`:
```typescript
import { RecordingService } from './RecordingService'

export const recordingService = new RecordingService()
```

Create `src/data/repositories/recordingRepositoryInstance.ts`:
```typescript
import { RecordingRepository } from './RecordingRepository'
import { MockUploadService } from '../services/MockUploadService'

export const recordingRepository = new RecordingRepository()
export const uploadService = new MockUploadService()
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/data/
git commit -m "feat: add RecordingService, MockUploadService, and RecordingRepository implementations"
```

---

## Task 11: useRecorder Hook

**Files:**
- Create: `src/hooks/useRecorder.ts`

- [ ] **Step 1: Implement useRecorder**

Create `src/hooks/useRecorder.ts`:
```typescript
import { useRef } from 'react'
import { Alert, Linking } from 'react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useRecordingStore } from '../store/recordingStore'
import { useRecordingsStore } from '../store/recordingsStore'
import { useSessionStore } from '../store/sessionStore'
import { startRecording } from '../domain/usecases/startRecording'
import { pauseRecording } from '../domain/usecases/pauseRecording'
import { resumeRecording } from '../domain/usecases/resumeRecording'
import { stopRecording } from '../domain/usecases/stopRecording'
import { recordingService } from '../data/services/recordingServiceInstance'
import { recordingRepository } from '../data/repositories/recordingRepositoryInstance'
import { requestMicrophonePermission } from '../utils/permissions'

export function useRecorder() {
  const isTransitioning = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isRecording = useRecordingStore((s) => s.isRecording)
  const isPaused = useRecordingStore((s) => s.isPaused)
  const elapsedSeconds = useRecordingStore((s) => s.elapsedSeconds)
  const storeStart = useRecordingStore((s) => s.start)
  const storePause = useRecordingStore((s) => s.pause)
  const storeResume = useRecordingStore((s) => s.resume)
  const storeReset = useRecordingStore((s) => s.reset)
  const setElapsed = useRecordingStore((s) => s.setElapsed)
  const addPauseEvent = useRecordingStore((s) => s.addPauseEvent)
  const setActiveReview = useRecordingsStore((s) => s.setActiveReview)

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsed(useRecordingStore.getState().elapsedSeconds + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const start = async () => {
    if (isTransitioning.current || isRecording) return
    isTransitioning.current = true
    try {
      const result = await startRecording(
        recordingService,
        storeStart,
        requestMicrophonePermission
      )
      if (!result.success) {
        if (result.error === 'permission_denied') {
          Alert.alert(
            'Microphone Access Required',
            'Please allow microphone access in Settings to record.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          )
        }
        return
      }
      startTimer()
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } finally {
      isTransitioning.current = false
    }
  }

  const pause = async () => {
    if (isTransitioning.current || !isRecording || isPaused) return
    isTransitioning.current = true
    try {
      stopTimer()
      await pauseRecording(recordingService, storePause, addPauseEvent)
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } finally {
      isTransitioning.current = false
    }
  }

  const resume = async () => {
    if (isTransitioning.current || !isRecording || !isPaused) return
    isTransitioning.current = true
    try {
      await resumeRecording(recordingService, storeResume, addPauseEvent)
      startTimer()
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } finally {
      isTransitioning.current = false
    }
  }

  const stop = async () => {
    if (isTransitioning.current || !isRecording) return
    isTransitioning.current = true
    try {
      stopTimer()
      const currentPauseEvents = useRecordingStore.getState().pauseEvents
      const currentContext = useSessionStore.getState().context
      const id = await stopRecording(
        recordingService,
        recordingRepository,
        currentContext,
        currentPauseEvents
      )
      storeReset()
      setActiveReview(id)
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      router.push('/(tabs)/review')
    } finally {
      isTransitioning.current = false
    }
  }

  return { isRecording, isPaused, elapsedSeconds, start, pause, resume, stop }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useRecorder.ts
git commit -m "feat: add useRecorder hook orchestrating all recording use cases"
```

---

## Task 12: useAppState & usePlayback Hooks

**Files:**
- Create: `src/hooks/useAppState.ts`
- Create: `src/hooks/usePlayback.ts`

- [ ] **Step 1: Implement useAppState**

Create `src/hooks/useAppState.ts`:
```typescript
import { useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { useRecordingStore } from '../store/recordingStore'
import { pauseRecording } from '../domain/usecases/pauseRecording'
import { recordingService } from '../data/services/recordingServiceInstance'

export function useAppState() {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      const { isRecording, isPaused, pause: storePause, addPauseEvent } =
        useRecordingStore.getState()

      if (
        appStateRef.current === 'active' &&
        nextState === 'background' &&
        isRecording &&
        !isPaused
      ) {
        try {
          await pauseRecording(recordingService, storePause, addPauseEvent)
        } catch {
          // Recording may have already stopped; ignore
        }
      }
      appStateRef.current = nextState
    })

    return () => subscription.remove()
  }, [])
}
```

- [ ] **Step 2: Implement usePlayback**

Create `src/hooks/usePlayback.ts`:
```typescript
import { useState, useRef, useEffect } from 'react'
import { Audio } from 'expo-av'
import { useRecordingsStore } from '../store/recordingsStore'
import type { Recording } from '../domain/entities/Recording'

export function usePlayback() {
  const [isPlaying, setIsPlaying] = useState(false)
  const soundRef = useRef<Audio.Sound | null>(null)

  const activeReviewId = useRecordingsStore((s) => s.activeReviewId)
  const recordings = useRecordingsStore((s) => s.recordings)
  const recording: Recording | null = activeReviewId ? recordings[activeReviewId] ?? null : null

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync()
    }
  }, [activeReviewId])

  const play = async () => {
    if (!recording) return
    if (soundRef.current) {
      await soundRef.current.playAsync()
      setIsPlaying(true)
      return
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    })
    const { sound } = await Audio.Sound.createAsync(
      { uri: recording.uri },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false)
        }
      }
    )
    soundRef.current = sound
    setIsPlaying(true)
  }

  const pause = async () => {
    if (!soundRef.current) return
    await soundRef.current.pauseAsync()
    setIsPlaying(false)
  }

  return { recording, isPlaying, play, pause }
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAppState.ts src/hooks/usePlayback.ts
git commit -m "feat: add useAppState (auto-pause on background) and usePlayback hooks"
```

---

## Task 13: RecordingIndicator & RecordingTimer Components

**Files:**
- Create: `src/presentation/components/RecordingIndicator.tsx`
- Create: `src/presentation/components/RecordingTimer.tsx`

- [ ] **Step 1: Implement RecordingIndicator**

Create `src/presentation/components/RecordingIndicator.tsx`:
```tsx
import { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'

interface Props {
  isRecording: boolean
  isPaused: boolean
}

const BAR_COUNT = 11

export function RecordingIndicator({ isRecording, isPaused }: Props) {
  const barAnims = useRef(
    Array.from({ length: BAR_COUNT }, (_, i) => new Animated.Value(i % 2 === 0 ? 0.5 : 0.3))
  ).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (isRecording && !isPaused) {
      const loopAnims = barAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 280 + i * 35,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.15,
              duration: 280 + i * 35,
              useNativeDriver: false,
            }),
          ])
        )
      )
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.35, duration: 850, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 850, useNativeDriver: true }),
        ])
      )
      loopAnims.forEach((a) => a.start())
      pulse.start()
      return () => {
        loopAnims.forEach((a) => a.stop())
        pulse.stop()
      }
    } else {
      barAnims.forEach((anim) =>
        Animated.timing(anim, { toValue: 0.35, duration: 250, useNativeDriver: false }).start()
      )
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 250, useNativeDriver: true }).start()
    }
  }, [isRecording, isPaused])

  const isActive = isRecording && !isPaused

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: isActive ? 0.25 : 0,
          },
        ]}
      />
      <View style={styles.waveform}>
        {barAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                height: anim.interpolate({ inputRange: [0, 1], outputRange: [4, 36] }),
                backgroundColor: isPaused ? '#2E6DB4' : '#4A9EFF',
              },
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#4A9EFF',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 44,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
})
```

- [ ] **Step 2: Implement RecordingTimer**

Create `src/presentation/components/RecordingTimer.tsx`:
```tsx
import { Text, View } from 'react-native'
import { formatTime } from '../../utils/formatTime'

interface Props {
  seconds: number
  isRecording: boolean
  isPaused: boolean
}

export function RecordingTimer({ seconds, isRecording, isPaused }: Props) {
  const label = !isRecording ? 'READY' : isPaused ? 'PAUSED' : 'RECORDING'
  const labelColor = !isRecording ? '#6B8BAA' : isPaused ? '#2E6DB4' : '#4A9EFF'

  return (
    <View className="items-center gap-2">
      <Text
        style={{
          color: labelColor,
          fontSize: 11,
          letterSpacing: 3,
          fontFamily: 'SpaceMono',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: '#E8F4FF',
          fontSize: 56,
          fontWeight: '200',
          letterSpacing: 4,
          fontFamily: 'SpaceMono',
        }}
      >
        {formatTime(seconds)}
      </Text>
    </View>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/presentation/components/RecordingIndicator.tsx src/presentation/components/RecordingTimer.tsx
git commit -m "feat: add RecordingIndicator (animated waveform) and RecordingTimer components"
```

---

## Task 14: RecordingControls Component

**Files:**
- Create: `src/presentation/components/RecordingControls.tsx`

- [ ] **Step 1: Implement RecordingControls**

Create `src/presentation/components/RecordingControls.tsx`:
```tsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  isRecording: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export function RecordingControls({
  isRecording,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
}: Props) {
  if (!isRecording) {
    return (
      <View style={styles.row}>
        <TouchableOpacity style={styles.primaryButton} onPress={onStart} activeOpacity={0.8}>
          <Ionicons name="mic" size={28} color="#E8F4FF" />
          <Text style={styles.primaryLabel}>START RECORDING</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.secondaryButton} onPress={onStop} activeOpacity={0.8}>
        <Ionicons name="stop" size={22} color="#A8C4E0" />
        <Text style={styles.secondaryLabel}>STOP</Text>
      </TouchableOpacity>

      {isPaused ? (
        <TouchableOpacity style={styles.primaryButton} onPress={onResume} activeOpacity={0.8}>
          <Ionicons name="play" size={28} color="#E8F4FF" />
          <Text style={styles.primaryLabel}>RESUME</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.accentButton} onPress={onPause} activeOpacity={0.8}>
          <Ionicons name="pause" size={28} color="#0F1B2D" />
          <Text style={styles.accentLabel}>PAUSE</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A3A5C',
    borderRadius: 14,
    paddingVertical: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: '#2E6DB4',
  },
  accentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A9EFF',
    borderRadius: 14,
    paddingVertical: 18,
    gap: 10,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A3A5C',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1E3A5A',
  },
  primaryLabel: { color: '#E8F4FF', fontSize: 12, letterSpacing: 2, fontWeight: '600' },
  accentLabel: { color: '#0F1B2D', fontSize: 12, letterSpacing: 2, fontWeight: '600' },
  secondaryLabel: { color: '#A8C4E0', fontSize: 12, letterSpacing: 2, fontWeight: '600' },
})
```

- [ ] **Step 2: Commit**

```bash
git add src/presentation/components/RecordingControls.tsx
git commit -m "feat: add RecordingControls component"
```

---

## Task 15: Remaining Components

**Files:**
- Create: `src/presentation/components/RecordingListItem.tsx`
- Create: `src/presentation/components/PauseTimeline.tsx`
- Create: `src/presentation/components/PlaybackControls.tsx`

- [ ] **Step 1: Implement RecordingListItem**

Create `src/presentation/components/RecordingListItem.tsx`:
```tsx
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Recording } from '../../domain/entities/Recording'
import { formatTime } from '../../utils/formatTime'

interface Props {
  recording: Recording
  onPress: () => void
}

const STATUS_CONFIG = {
  draft: { label: 'DRAFT', color: '#6B8BAA', bg: '#1A3A5C' },
  uploading: { label: 'UPLOADING', color: '#4A9EFF', bg: '#1A3A5C' },
  uploaded: { label: 'UPLOADED', color: '#34D399', bg: '#0D3320' },
  error: { label: 'ERROR', color: '#F87171', bg: '#3B0D0D' },
}

export function RecordingListItem({ recording, onPress }: Props) {
  const status = STATUS_CONFIG[recording.uploadStatus]
  const pauseCount = recording.pauseEvents.filter((e) => e.type === 'pause').length
  const date = new Date(recording.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Ionicons name="mic-outline" size={20} color="#4A9EFF" />
        </View>
        <View style={styles.meta}>
          <Text style={styles.duration}>{formatTime(recording.durationSeconds)}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
      </View>
      <View style={styles.right}>
        {pauseCount > 0 && (
          <Text style={styles.pauseCount}>{pauseCount} pause{pauseCount > 1 ? 's' : ''}</Text>
        )}
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#6B8BAA" />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A3A5C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F1B2D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { gap: 2 },
  duration: { color: '#E8F4FF', fontSize: 18, fontWeight: '300', fontFamily: 'SpaceMono' },
  date: { color: '#6B8BAA', fontSize: 11 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pauseCount: { color: '#6B8BAA', fontSize: 11 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, letterSpacing: 1, fontWeight: '600' },
})
```

- [ ] **Step 2: Implement PauseTimeline**

Create `src/presentation/components/PauseTimeline.tsx`:
```tsx
import { View, Text, StyleSheet } from 'react-native'
import type { PauseEvent } from '../../domain/entities/Recording'
import { formatTime } from '../../utils/formatTime'

interface Props {
  pauseEvents: PauseEvent[]
  durationSeconds: number
}

export function PauseTimeline({ pauseEvents, durationSeconds }: Props) {
  if (durationSeconds === 0) return null

  return (
    <View style={styles.container}>
      <Text style={styles.label}>TIMELINE</Text>
      <View style={styles.track}>
        <View style={styles.rail} />
        {pauseEvents.map((event, i) => {
          const position = (event.timestamp / durationSeconds) * 100
          return (
            <View
              key={i}
              style={[
                styles.marker,
                {
                  left: `${Math.min(position, 98)}%` as any,
                  backgroundColor: event.type === 'pause' ? '#F59E0B' : '#34D399',
                },
              ]}
            >
              <Text style={styles.markerLabel}>{formatTime(event.timestamp)}</Text>
            </View>
          )
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Pause</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#34D399' }]} />
          <Text style={styles.legendText}>Resume</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  label: { color: '#6B8BAA', fontSize: 11, letterSpacing: 2 },
  track: { height: 32, justifyContent: 'center', position: 'relative' },
  rail: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2E6DB4',
    borderRadius: 1,
  },
  marker: {
    position: 'absolute',
    width: 2,
    height: 16,
    borderRadius: 1,
    bottom: 8,
    alignItems: 'center',
  },
  markerLabel: {
    position: 'absolute',
    bottom: 18,
    color: '#A8C4E0',
    fontSize: 9,
    width: 36,
    textAlign: 'center',
    left: -17,
  },
  legend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#6B8BAA', fontSize: 11 },
})
```

- [ ] **Step 3: Implement PlaybackControls**

Create `src/presentation/components/PlaybackControls.tsx`:
```tsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatTime } from '../../utils/formatTime'

interface Props {
  isPlaying: boolean
  durationSeconds: number
  onPlay: () => void
  onPause: () => void
}

export function PlaybackControls({ isPlaying, durationSeconds, onPlay, onPause }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.durationRow}>
        <Ionicons name="time-outline" size={14} color="#6B8BAA" />
        <Text style={styles.duration}>{formatTime(durationSeconds)}</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={isPlaying ? onPause : onPlay}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={26}
          color="#0F1B2D"
        />
        <Text style={styles.label}>{isPlaying ? 'PAUSE' : 'PLAY'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12, alignItems: 'center' },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  duration: { color: '#A8C4E0', fontSize: 13, fontFamily: 'SpaceMono' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A9EFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 36,
    gap: 10,
  },
  label: { color: '#0F1B2D', fontSize: 13, letterSpacing: 2, fontWeight: '700' },
})
```

- [ ] **Step 4: Commit**

```bash
git add src/presentation/components/
git commit -m "feat: add RecordingListItem, PauseTimeline, and PlaybackControls components"
```

---

## Task 16: Screens

**Files:**
- Create: `src/presentation/screens/RecordingsListScreen.tsx`
- Create: `src/presentation/screens/RecordingScreen.tsx`
- Create: `src/presentation/screens/ReviewScreen.tsx`

- [ ] **Step 1: Implement RecordingsListScreen**

Create `src/presentation/screens/RecordingsListScreen.tsx`:
```tsx
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useRecordingsStore } from '../../store/recordingsStore'
import { useRecordingStore } from '../../store/recordingStore'
import { RecordingListItem } from '../components/RecordingListItem'

export function RecordingsListScreen() {
  const recordings = useRecordingsStore((s) => s.recordings)
  const setActiveReview = useRecordingsStore((s) => s.setActiveReview)
  const isRecording = useRecordingStore((s) => s.isRecording)
  const list = Object.values(recordings).sort((a, b) => b.createdAt - a.createdAt)

  const handleOpen = (id: string) => {
    setActiveReview(id)
    router.push('/(tabs)/review')
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Recordings</Text>
          <Text style={styles.subtitle}>{list.length} session{list.length !== 1 ? 's' : ''}</Text>
        </View>
        {!isRecording && (
          <TouchableOpacity
            style={styles.newButton}
            onPress={() => router.push('/(tabs)/record')}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={18} color="#E8F4FF" />
            <Text style={styles.newLabel}>NEW</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {list.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="mic-off-outline" size={48} color="#2E6DB4" />
            <Text style={styles.emptyTitle}>No recordings yet</Text>
            <Text style={styles.emptySubtitle}>Tap NEW to start your first session</Text>
          </View>
        ) : (
          list.map((rec) => (
            <RecordingListItem key={rec.id} recording={rec} onPress={() => handleOpen(rec.id)} />
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F1B2D', paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: { color: '#E8F4FF', fontSize: 28, fontWeight: '300', letterSpacing: 1 },
  subtitle: { color: '#6B8BAA', fontSize: 13, marginTop: 2 },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A3A5C',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2E6DB4',
  },
  newLabel: { color: '#E8F4FF', fontSize: 12, letterSpacing: 2, fontWeight: '600' },
  list: { paddingBottom: 32 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { color: '#A8C4E0', fontSize: 18, fontWeight: '300' },
  emptySubtitle: { color: '#6B8BAA', fontSize: 13, textAlign: 'center' },
})
```

- [ ] **Step 2: Implement RecordingScreen**

Create `src/presentation/screens/RecordingScreen.tsx`:
```tsx
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { useRecorder } from '../../hooks/useRecorder'
import { useAppState } from '../../hooks/useAppState'
import { useSessionStore } from '../../store/sessionStore'
import { RecordingIndicator } from '../components/RecordingIndicator'
import { RecordingTimer } from '../components/RecordingTimer'
import { RecordingControls } from '../components/RecordingControls'

export function RecordingScreen() {
  useAppState()
  const { isRecording, isPaused, elapsedSeconds, start, pause, resume, stop } = useRecorder()
  const session = useSessionStore((s) => s.context)

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.sessionHeader}>
          <Text style={styles.patientName}>{session.patientName}</Text>
          <View style={styles.codes}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Team {session.teamCode}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Program {session.programCode}</Text>
            </View>
          </View>
        </View>

        <View style={styles.indicatorArea}>
          <RecordingIndicator isRecording={isRecording} isPaused={isPaused} />
        </View>

        <RecordingTimer
          seconds={elapsedSeconds}
          isRecording={isRecording}
          isPaused={isPaused}
        />

        <View style={styles.controlsArea}>
          <RecordingControls
            isRecording={isRecording}
            isPaused={isPaused}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onStop={stop}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1B2D' },
  screen: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingBottom: 32 },
  sessionHeader: { paddingTop: 24, gap: 10 },
  patientName: { color: '#E8F4FF', fontSize: 22, fontWeight: '300', letterSpacing: 0.5 },
  codes: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: '#1A3A5C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#2E6DB4',
  },
  chipText: { color: '#A8C4E0', fontSize: 12, letterSpacing: 1 },
  indicatorArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  controlsArea: { gap: 16 },
})
```

- [ ] **Step 3: Implement ReviewScreen**

Create `src/presentation/screens/ReviewScreen.tsx`:
```tsx
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { usePlayback } from '../../hooks/usePlayback'
import { useRecordingsStore } from '../../store/recordingsStore'
import { uploadRecording } from '../../domain/usecases/uploadRecording'
import { recordingRepository, uploadService } from '../../data/repositories/recordingRepositoryInstance'
import { PlaybackControls } from '../components/PlaybackControls'
import { PauseTimeline } from '../components/PauseTimeline'
import { formatTime } from '../../utils/formatTime'

export function ReviewScreen() {
  const { recording, isPlaying, play, pause } = usePlayback()

  if (!recording) {
    return (
      <View style={styles.empty}>
        <Ionicons name="headset-outline" size={56} color="#2E6DB4" />
        <Text style={styles.emptyTitle}>No recording to review</Text>
        <Text style={styles.emptySubtitle}>Stop a recording to review it here</Text>
      </View>
    )
  }

  const handleUpload = async () => {
    if (recording.uploadStatus === 'uploaded' || recording.uploadStatus === 'uploading') return
    try {
      await uploadRecording(uploadService, recordingRepository, recording.id)
    } catch {
      // status is set to 'error' by the use case
    }
  }

  const uploadLabel = {
    draft: 'UPLOAD RECORDING',
    uploading: 'UPLOADING...',
    uploaded: 'UPLOADED',
    error: 'RETRY UPLOAD',
  }[recording.uploadStatus]

  const uploadColor = recording.uploadStatus === 'uploaded' ? '#34D399' : '#4A9EFF'
  const isUploading = recording.uploadStatus === 'uploading'

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Review</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>SESSION</Text>
          <Text style={styles.patientName}>{recording.session.patientName}</Text>
          <View style={styles.row}>
            <Text style={styles.metaItem}>Team {recording.session.teamCode}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaItem}>Program {recording.session.programCode}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaItem}>{formatTime(recording.durationSeconds)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PLAYBACK</Text>
          <PlaybackControls
            isPlaying={isPlaying}
            durationSeconds={recording.durationSeconds}
            onPlay={play}
            onPause={pause}
          />
        </View>

        {recording.pauseEvents.length > 0 && (
          <View style={styles.card}>
            <PauseTimeline
              pauseEvents={recording.pauseEvents}
              durationSeconds={recording.durationSeconds}
            />
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.uploadButton,
            recording.uploadStatus === 'uploaded' && styles.uploadButtonDone,
          ]}
          onPress={handleUpload}
          disabled={isUploading || recording.uploadStatus === 'uploaded'}
          activeOpacity={0.8}
        >
          {isUploading ? (
            <ActivityIndicator color="#0F1B2D" size="small" />
          ) : (
            <Ionicons
              name={recording.uploadStatus === 'uploaded' ? 'checkmark-circle' : 'cloud-upload-outline'}
              size={20}
              color={recording.uploadStatus === 'uploaded' ? '#0F1B2D' : '#0F1B2D'}
            />
          )}
          <Text style={[styles.uploadLabel, { color: '#0F1B2D' }]}>{uploadLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1B2D' },
  empty: { flex: 1, backgroundColor: '#0F1B2D', alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { color: '#A8C4E0', fontSize: 18, fontWeight: '300' },
  emptySubtitle: { color: '#6B8BAA', fontSize: 13 },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  screenTitle: { color: '#E8F4FF', fontSize: 28, fontWeight: '300', letterSpacing: 1, marginBottom: 4 },
  card: {
    backgroundColor: '#1A3A5C',
    borderRadius: 14,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2E5A8A',
  },
  cardLabel: { color: '#6B8BAA', fontSize: 11, letterSpacing: 2 },
  patientName: { color: '#E8F4FF', fontSize: 20, fontWeight: '300' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { color: '#A8C4E0', fontSize: 13 },
  metaDot: { color: '#6B8BAA', fontSize: 13 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A9EFF',
    borderRadius: 14,
    paddingVertical: 18,
    gap: 10,
    marginTop: 8,
  },
  uploadButtonDone: { backgroundColor: '#34D399' },
  uploadLabel: { fontSize: 13, letterSpacing: 2, fontWeight: '700' },
})
```

- [ ] **Step 4: Commit**

```bash
git add src/presentation/screens/
git commit -m "feat: add RecordingsListScreen, RecordingScreen, and ReviewScreen"
```

---

## Task 17: Navigation Layout

**Files:**
- Modify: `app/_layout.tsx`
- Create: `app/(tabs)/_layout.tsx`
- Modify: `app/(tabs)/index.tsx`
- Create: `app/(tabs)/record.tsx`
- Create: `app/(tabs)/review.tsx`

- [ ] **Step 1: Update root layout**

Replace `app/_layout.tsx` entirely:
```tsx
import { Stack } from 'expo-router'
import '../global.css'

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F1B2D' } }} />
  )
}
```

- [ ] **Step 2: Create tabs layout**

Create `app/(tabs)/_layout.tsx`:
```tsx
import { Tabs } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRecordingsStore } from '../../src/store/recordingsStore'

export default function TabLayout() {
  const activeReviewId = useRecordingsStore((s) => s.activeReviewId)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#091422',
          borderTopColor: '#1A3A5C',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#4A9EFF',
        tabBarInactiveTintColor: '#6B8BAA',
        tabBarLabelStyle: { fontSize: 10, letterSpacing: 1 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'SESSIONS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'RECORD',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mic-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'REVIEW',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="headset-outline"
              size={size}
              color={activeReviewId ? color : '#2E6DB4'}
            />
          ),
          tabBarButton: (props) =>
            activeReviewId ? (
              <TouchableOpacity {...(props as any)} />
            ) : (
              <TouchableOpacity {...(props as any)} disabled style={[props.style, { opacity: 0.4 }]} />
            ),
        }}
      />
    </Tabs>
  )
}
```

- [ ] **Step 3: Update index tab**

Replace `app/(tabs)/index.tsx` entirely:
```tsx
import { RecordingsListScreen } from '../../src/presentation/screens/RecordingsListScreen'

export default function ListTab() {
  return <RecordingsListScreen />
}
```

- [ ] **Step 4: Create record tab**

Create `app/(tabs)/record.tsx`:
```tsx
import { RecordingScreen } from '../../src/presentation/screens/RecordingScreen'

export default function RecordTab() {
  return <RecordingScreen />
}
```

- [ ] **Step 5: Create review tab**

Create `app/(tabs)/review.tsx`:
```tsx
import { ReviewScreen } from '../../src/presentation/screens/ReviewScreen'

export default function ReviewTab() {
  return <ReviewScreen />
}
```

- [ ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat: add Expo Router tab navigation with Deep Navy theme"
```

---

## Task 18: app.json Permissions & Final Integration

**Files:**
- Modify: `app.json`
- Modify: `app/(tabs)/_layout.tsx` (import path fix if needed)

- [ ] **Step 1: Add microphone permissions to app.json**

Open `app.json` and ensure the `expo` object includes:
```json
{
  "expo": {
    "name": "VITAS Ambient Capture",
    "slug": "vitas-ambient-capture",
    "plugins": [
      [
        "expo-av",
        {
          "microphonePermission": "VITAS Ambient Capture requires microphone access to record patient sessions."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "VITAS Ambient Capture requires microphone access to record patient sessions."
      }
    },
    "android": {
      "permissions": ["RECORD_AUDIO"]
    }
  }
}
```

- [ ] **Step 2: Run all tests to confirm nothing regressed**

```bash
npx jest --passWithNoTests
```

Expected: All tests PASS

- [ ] **Step 3: Type-check the entire project**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Start the app and verify it runs**

```bash
npx expo start --clear
```

Expected: Metro starts without errors. Open on a device/simulator and confirm:
- Deep Navy background on all screens
- Bottom tab bar shows SESSIONS / RECORD / REVIEW
- REVIEW tab is greyed and non-tappable initially
- Record tab shows session header (John Doe · Team T00 · Program P10)
- Tapping START RECORDING requests mic permission on first run
- Timer increments while recording
- Waveform animates while recording, freezes on pause
- Stopping a recording navigates to REVIEW tab
- Playback plays the recorded audio
- Upload button shows 2-second loading state then UPLOADED
- SESSIONS list shows the completed recording with duration and status

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete VITAS Ambient Capture Phase 1 - core recording workflow"
```

---

## Self-Review Checklist

| Requirement | Task |
|---|---|
| Start / Pause / Resume / Stop recording | Tasks 6-8, 11 |
| Timestamp tracking on pause/resume events | Tasks 7, 11 |
| Background auto-pause | Task 12 (useAppState) |
| Review screen with playback | Tasks 12, 16 |
| Pause/resume markers on timeline | Task 15 |
| Mock upload with status tracking | Tasks 9, 10 |
| Recordings list with duration + status | Tasks 15, 16 |
| Rapid tap guard (isTransitioning) | Task 11 |
| Permission denied handling | Task 6, 11 |
| SessionContext interface (Phase 2 ready) | Tasks 2, 5 |
| Zustand store with selectors | Task 5 |
| Deep Navy / Clinical Blue UI | Tasks 13-17 |
| Haptic feedback | Task 11 |
| Strict TypeScript | Tasks 1, all |
| Unit tests for use cases + utils | Tasks 4, 6, 7, 8 |
