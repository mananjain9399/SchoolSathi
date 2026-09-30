# SchoolSathi — Setup Guide

Complete instructions to clone, configure, and run SchoolSathi locally.

---

## Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| **Node.js** | v18.0+ | `node -v` |
| **npm** | v9.0+ | `npm -v` |
| **Git** | Any | `git --version` |
| **Browser** | Chrome / Edge (for Speech Recognition) | — |

> **Note:** Speech Recognition (`webkitSpeechRecognition`) only works in Chromium-based browsers (Chrome, Edge, Brave). Firefox and Safari do not support it.

---

## 1. Clone the Repository

```bash
git clone https://github.com/mananjain9399/SchoolSathi.git
cd SchoolSathi
```

---

## 2. Install Dependencies

```bash
npm install
```

This installs all production and dev dependencies including:

- **React 19** + **React DOM**
- **Vite 8** (dev server & build tool)
- **TypeScript 6**
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **Lucide React** (icon library)
- **canvas-confetti** (celebration animations)

---

## 3. Environment Configuration

Copy the example env file:

```bash
cp .env.example .env
```

On Windows (Command Prompt):
```cmd
copy .env.example .env
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_AI_API_KEY` | Optional | *(empty)* | API key for external AI provider (e.g., OpenAI) |
| `VITE_AI_MODEL` | Optional | `gpt-4o-mini` | AI model name |
| `VITE_AI_ENDPOINT` | Optional | `https://api.openai.com/v1/chat/completions` | AI endpoint URL |

### Server-side TTS Keys (Optional)

These are read by the Vite dev server plugin (not exposed to the browser):

| Variable | Description |
|----------|-------------|
| `TTS_API_KEY` | Generic TTS provider key |
| `ELEVENLABS_API_KEY` | ElevenLabs neural voice key |
| `AZURE_TTS_KEY` | Azure Cognitive Services key |
| `GOOGLE_TTS_KEY` | Google Cloud TTS key |

> **Important:** Without any API keys configured, SchoolSathi runs fully offline using built-in mock school data and the browser's native `SpeechSynthesis` for text-to-speech. No external services are required for the demo.

---

## 4. Run the Dev Server

```bash
npm run dev
```

This starts Vite on **http://localhost:5173** with:
- Hot Module Replacement (HMR)
- Built-in TTS proxy server endpoint at `/api/tts`
- Tailwind CSS JIT compilation

Open [http://localhost:5173](http://localhost:5173) in Chrome or Edge.

---

## 5. Build for Production

```bash
npm run build
```

This runs TypeScript type-checking (`tsc -b`) followed by Vite production bundling. Output goes to the `dist/` folder.

To preview the production build locally:

```bash
npm run preview
```

---

## 6. Lint

```bash
npm run lint
```

Uses [Oxlint](https://oxc.rs) for fast linting with React and TypeScript rules.

---

## Project Structure

```
SchoolSathi/
├── public/                     # Static assets (favicon, icons SVG)
├── docs/
│   └── ERP_INTEGRATION_GUIDE.md  # School ERP integration docs
├── src/
│   ├── assets/                 # Images (hero.png, etc.)
│   ├── components/
│   │   ├── avatar/             # SathiBirdie, VeerBoy, AnanyaGirl avatars
│   │   ├── child/              # Child selector components
│   │   ├── common/             # Header, BottomNav, Button, LanguagePicker
│   │   └── voice/              # VoiceInputBar, SpeechResponseCard, VoiceSettings
│   ├── config/
│   │   └── languageConfig.ts   # 8-language configuration system
│   ├── data/
│   │   ├── languages.ts        # Supported language definitions
│   │   └── mockData.ts         # Demo school data (students, homework, exams)
│   ├── layouts/
│   │   └── AppLayout.tsx       # Shell layout with bottom navigation
│   ├── pages/
│   │   ├── MainCompanionScreen.tsx  # Main voice AI companion (hero screen)
│   │   ├── LoginScreen.tsx          # Parent login
│   │   ├── AddChildScreen.tsx       # Add child flow
│   │   ├── SettingsScreen.tsx       # Voice, language, persona settings
│   │   ├── HelpScreen.tsx           # FAQ & help
│   │   ├── ChildProfileScreen.tsx   # Individual child profile
│   │   └── admin/                   # Admin dashboard
│   ├── services/
│   │   ├── aiAssistantService.ts      # Intent detection + response generation
│   │   ├── schoolDataService.ts       # School data source of truth
│   │   ├── speechService.ts           # Speech recognition + TTS facade
│   │   ├── authService.ts             # Authentication service
│   │   ├── studentService.ts          # Student/child management
│   │   ├── speech/                    # STT & TTS engines
│   │   ├── voice/                     # VoiceService + provider architecture
│   │   ├── providers/                 # SchoolDataProvider implementations
│   │   ├── api/                       # Webhook & admin sync APIs
│   │   └── security/                  # Security service
│   ├── types/
│   │   └── index.ts            # All TypeScript types & interfaces
│   ├── App.tsx                 # Root component & screen router
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles & animations
├── .env.example                # Environment variable template
├── vite.config.ts              # Vite config with TTS server plugin
├── tsconfig.json               # TypeScript project references
├── tsconfig.app.json           # App TypeScript config
├── tsconfig.node.json          # Node/Vite TypeScript config
└── package.json                # Dependencies & scripts
```

---

## App Flow (Screens)

```
Welcome → Login → Language Selection → School Selection → Add Child
   → Child Verification → SchoolSathi Intro → Main Companion Screen
```

From the **Main Companion Screen**, navigate via bottom tabs to:
- 🏠 **Home** — Voice AI companion
- 👦 **Profile** — Child details & academic info
- ⚙️ **Settings** — Voice, language, persona preferences
- ❓ **Help** — FAQ & usage tips
- 🔧 **Admin** — Data sources & sync (via `/admin` URL)

---

## Voice Pipeline

```
Microphone Press → LISTENING → Speech Recognition
       ↓
   Transcript → THINKING → Intent Detection → School Data Retrieval
       ↓
   Response → SPEAKING → Text-to-Speech → Avatar Animation
       ↓
   HAPPY (1.5s) → IDLE
```

### Supported Languages

| Code | Language | Script |
|------|----------|--------|
| `hi` | Hindi | Devanagari |
| `en` | English | Latin |
| `mr` | Marathi | Devanagari |
| `pa` | Punjabi | Gurmukhi |
| `bn` | Bengali | Bengali |
| `ta` | Tamil | Tamil |
| `te` | Telugu | Telugu |
| `gu` | Gujarati | Gujarati |

---

## Browser Permissions

On first microphone use, the browser will prompt for microphone access. Grant permission for voice input to work.

If permission is denied, SchoolSathi shows:
> "Microphone access is required to talk to SchoolSathi."

You can reset permissions in Chrome via: **Settings → Privacy → Site Settings → Microphone**.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm install` fails | Ensure Node.js v18+ is installed. Delete `node_modules` and `package-lock.json`, then retry. |
| Speech recognition not working | Use Chrome or Edge. Firefox/Safari don't support `webkitSpeechRecognition`. |
| No voice output | Check browser volume. Some voices may not be available on all OS. Try switching voice gender in Settings. |
| Build fails with PowerShell `&&` error | Use `cmd /c "npm run build"` instead, or use Command Prompt. |
| Port 5173 already in use | Kill the existing process or run `npm run dev -- --port 3000`. |
| Microphone permission denied | Reset site permissions in browser settings and reload. |

---

## Demo Credentials

SchoolSathi ships with **mock data** for instant demo — no real school connection needed.

**Demo Parent:**
- Name: Priya Sharma
- Children: Rohan Sharma (5-A), Ananya Sharma (3-B)

Simply walk through the onboarding flow (Welcome → Login) and start asking questions like:
- *"Kal Rohan ka homework kya hai?"*
- *"What are Ananya's upcoming exams?"*
- *"Dono bachchon ki attendance batao"*

---

## ERP Integration (For Schools)

See [`docs/ERP_INTEGRATION_GUIDE.md`](docs/ERP_INTEGRATION_GUIDE.md) for the full integration guide covering:
- REST API contract
- CSV upload fallback
- Webhook real-time sync
- ShaalaDarpan / Tally ERP adapters

---

## License

This project is privately maintained. Contact the repository owner for licensing information.
