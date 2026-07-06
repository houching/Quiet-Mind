# Quiet Mind (ស្ងប់ចិត្ត) 🧘‍♂️✨

A beautiful, lightweight, and offline-first ambient sound mixer designed to help you focus, relax, or sleep. Specifically tailored for Khmer intranet/internal workspaces, it supports both English and Khmer languages natively and features a mobile-first design.

---

## 🚀 Quick Start

Get the application running locally in less than 5 minutes.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd quiet-mind
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

---

## ✨ Features

- **25 Ambient Soundscapes:** High-quality loops ranging from natural rain, wind, and waves to brown noise, fan hums, and singing bowls.
- **🌐 Dual-Language Support (i18n):** Native, one-tap switching between **English (Inter)** and **Khmer (Kantumruy Pro)** translations.
- **🎲 Meander Mode (លម្អៀង):** Dynamically and randomly fluctuates volumes of active sounds over time to mimic real-world ambient changes and prevent auditory fatigue.
- **⏱️ Advanced Sleep Timers:** Set a timer to start, stop, fade in, or fade out sounds smoothly over a customizable duration.
- **💾 Custom Mix Presets:** Save your favorite volume combinations locally to your browser or share them with others instantly via generated shortcode URLs.
- **📱 Mobile-First PWA Layout:** Touch targets greater than `44px` and support for full-screen viewports (`dvh`) on iOS and Android.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** React 18 (TypeScript)
- **Bundler & Server:** Vite
- **Styling:** Vanilla CSS (Tailored HSL theme with a premium glassmorphic dark mode layout)
- **Local Storage:** Client-side persistence for current mix, language preference, and custom presets.

```
quiet-mind/
├── .agent/              # Agent configuration, rules, and workflows
├── public/              # Static assets (audio tracks, icons)
├── src/
│   ├── assets/          # Shared visual assets
│   ├── components/      # Reusable React components
│   │   └── SoundPlayer  # Controls individual sound states & web audio APIs
│   ├── App.tsx          # Main application dashboard & state coordinator
│   ├── index.css        # Core design system & theme stylesheets
│   ├── types.ts         # Sound models, i18n dictionaries, and shortcodes
│   └── main.tsx         # Application mount point
├── index.html           # HTML5 entrypoint
├── package.json         # Scripts and dependencies
└── tsconfig.json        # TypeScript configuration
```

---

## ⚙️ Configuration

Development settings can be customized in the [vite.config.ts] file:

| Property | Description | Default |
|---|---|---|
| `port` | Development server port | `3000` |
| `open` | Automatically open browser on start | `true` |
| `base` | Base URL path for assets | `./` |

---

## 📄 License

This project is open-source and available under the **MIT License**.
