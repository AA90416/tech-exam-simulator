# Tech Exam Simulator — Project Plan

## Overview

Tech Exam Simulator is a fully client-side React + TypeScript web app that lets users practice and simulate certification exams. It runs in the browser with no backend — all data is stored locally. It is designed to be installable on iPhones and Android devices as a Progressive Web App (PWA).

---

## Features

| Feature | Status |
|---------|--------|
| Multiple choice exams (AWS, Kubernetes, custom) | ✅ Live |
| Practice Mode (answers shown as you go) | ✅ Live |
| Real Exam Mode (timed, results at end) | ✅ Live |
| AI Exam Generation (OpenAI GPT-4o-mini) | ✅ Live |
| Manual Exam Builder (add/edit/delete questions) | ✅ Live |
| Per-user login with password hashing (SHA-256) | ✅ Live |
| Admin panel for API key + user management | ✅ Live |
| Per-user exam history (Recent Activity) | ✅ Live |
| PWA — installable on iPhone/Android | ✅ Live |
| Mobile-responsive UI (all iPhone sizes) | ✅ Live |
| SEO meta tags + Open Graph | ✅ Live |

---

## User Access Model

Access is **restricted to chosen users only**. There is no public registration.

### How it works
1. On first launch, the app prompts the admin to create the first account (admin role).
2. The admin can log in to `/admin` → **User Management** to add or remove users.
3. Each user has a username, hashed password, and role (`admin` or `user`).
4. Users are stored in `localStorage` (persists across sessions).
5. Sessions are stored in `sessionStorage` (cleared when the browser tab closes).

### Roles
| Role | Can do |
|------|--------|
| `admin` | Add/remove users, manage API key, access `/admin` settings |
| `user` | Take exams, view own history, create custom exams |

### Security
- Passwords are hashed client-side using **Web Crypto API (SHA-256)** with a salt before storage.
- No plaintext passwords are ever stored.
- Session tokens contain only the username and are validated against the user list on every load.

---

## Per-User Profiles (Exam History)

Each user has an isolated history of completed exams stored in `localStorage` under the key `exam-results-{username}`.

### History entry structure
```typescript
interface ExamHistory {
  id: string;
  examId: string;
  examTitle: string;
  score: number;          // percentage 0-100
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;      // seconds
  completedAt: string;    // ISO date
  mode: 'practice' | 'real';
}
```

- History is saved automatically when any exam finishes.
- Up to 50 entries per user (oldest auto-discarded).
- The **Home page** shows the 5 most recent entries as "Recent Activity" with a green/red score badge.
- Each user only sees their own history — completely isolated.

---

## PWA — Install on iPhone / Android

The app is configured as a Progressive Web App. Users can install it to their home screen:

### On iPhone (Safari)
1. Open the app URL in Safari
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add**

The app will appear as "ExamSim" with a purple icon and open full-screen (no browser chrome).

### PWA configuration
| File | Purpose |
|------|---------|
| `public/manifest.json` | App name, icon, theme color, display mode |
| `public/icon.svg` | Purple ✓ icon used for home screen and browser tab |
| `index.html` | `<link rel="manifest">`, Apple meta tags, Open Graph |

### Key manifest settings
```json
{
  "name": "Tech Exam Simulator",
  "short_name": "ExamSim",
  "display": "standalone",
  "theme_color": "#6366f1",
  "background_color": "#6366f1"
}
```

---

## Mobile UI Design

The app is fully responsive and tested for all iPhone sizes (SE through Pro Max).

### Key mobile decisions
- `font-size: 16px` on all inputs/selects — prevents iOS Safari zoom on focus
- `min-height: 100dvh` — accounts for Safari URL bar height changes
- `viewport-fit=cover` + `env(safe-area-inset-bottom)` — avoids iPhone home indicator overlap
- All touch targets are minimum **44px** tall (Apple HIG recommendation)
- `-webkit-tap-highlight-color: transparent` — removes grey flash on tap
- `clamp()` for font sizes — smooth scaling from small to large screens
- All flex/grid layouts wrap on narrow screens

---

## Technical Architecture

```
src/
├── context/
│   ├── AuthContext.tsx      — Users, sessions, login/logout
│   ├── ExamContext.tsx      — Active exam state, history saving
│   └── SettingsContext.tsx  — API key, defaults
├── pages/
│   ├── Home.tsx             — Exam list + Recent Activity
│   ├── Login.tsx            — Auth gate (first setup + normal login)
│   ├── ExamPage.tsx         — Active exam (practice + real modes)
│   ├── Results.tsx          — Score display with answer review
│   ├── CreateExam.tsx       — AI and manual exam builder
│   └── Admin.tsx            — Settings + user management
├── services/
│   └── openai.ts            — GPT-4o-mini question generation
├── types/
│   └── exam.ts              — All TypeScript interfaces
└── data/
    └── exams.ts             — Built-in sample exams
```

### localStorage keys

| Key | Contents |
|-----|---------|
| `exam-simulator-users` | All registered users (hashed passwords) |
| `exam-simulator-settings` | OpenAI API key, default question count/difficulty |
| `custom-exams` | User-created exams |
| `exam-results-{username}` | Per-user exam history (one key per user) |

### sessionStorage keys

| Key | Contents |
|-----|---------|
| `exam-simulator-session` | Active session `{ username }` |

---

## Promotion Roadmap (Free Channels)

### Phase 1 — Deploy (Day 1)
- [ ] Deploy to **Vercel** or **Netlify** (free tier, connect GitHub repo)
- [ ] Get a public URL (e.g. `tech-exam-sim.vercel.app`)
- [ ] Verify "Add to Home Screen" works on iPhone

### Phase 2 — SEO (Week 1)
- [ ] Submit URL to **Google Search Console** (free)
- [ ] Target keywords: "AWS Cloud Practitioner practice exam free", "Kubernetes practice test", "free tech cert simulator"
- [ ] The meta description already targets these terms in `index.html`

### Phase 3 — Communities (Week 1-2)
Post in these Reddit communities (free, high engagement for free tools):
- `r/AWSCertifications` — "I built a free AWS practice exam with AI generation"
- `r/kubernetes` — "Free K8s practice exam tool"
- `r/devops` — general tech cert study
- `r/sysadmin` — IT career focus
- `r/ITCareerQuestions` — studying for certs

### Phase 4 — Dev Platforms (Week 2)
- [ ] Write a post on **Dev.to** or **Hashnode**: "I built a free AI-powered tech cert simulator"
- [ ] Submit to **Product Hunt** (Tuesday or Wednesday morning for best visibility)

### Phase 5 — Sharing (Ongoing)
- [ ] Share the PWA install flow — users who install it are more likely to return and share
- [ ] The app is self-contained — no account creation required for new users (admin adds them)

---

## Configuration Guide (For Admin)

### First time setup
1. Open the app URL
2. You'll see a "Create Admin Account" screen — enter a username and password
3. You are now the admin

### Adding users
1. Log in as admin
2. Go to **Settings** (top right button)
3. Scroll to **User Management**
4. Enter username, password, and role → click **Add User**
5. Share the URL and credentials with the user

### Setting up AI exam generation
1. Go to **Settings**
2. Under **OpenAI API Configuration**, paste your OpenAI API key (`sk-...`)
3. Click **Save Key**
4. Return to Home → **Create Exam with AI** → choose AI Generated mode

---

## Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 7 | Build tool + dev server |
| React Router DOM | 7 | Client-side routing |
| Web Crypto API | native | Password hashing |
| OpenAI API | gpt-4o-mini | AI question generation |

No backend. No database. No server costs.
