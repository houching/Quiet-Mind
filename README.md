# Quiet Mind (ស្ងប់ចិត្ត / 静心) 🧘‍♂️✨

A beautiful, lightweight, and offline-first ambient sound mixer designed to help you focus, relax, or sleep. Specifically tailored for Khmer intranet/internal workspaces, it supports English, Khmer, and Chinese languages natively and features a premium, mobile-first design.

---

## 🚀 Quick Start

Get the application running locally in less than 5 minutes.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

1. **Clone the repository** and navigate to the project directory:
   ```bash
   cd quiet-mind
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000` (or the port specified in `vite.config.ts`).

---

## ✨ Features

- **25 Ambient Soundscapes:** High-quality loops ranging from natural rain, wind, and waves to brown noise, fan hums, and singing bowls.
- **🌐 Tri-Language Support (i18n):** Native, one-tap switching between **English (Inter/Montserrat)**, **Khmer (Kantumruy Pro)**, and **Chinese** translations.
- **🎲 Meander Mode (លម្អៀង / 漫游):** Dynamically fluctuates active sounds over time to mimic real-world ambient changes and prevent auditory fatigue.
  - **Drift Patterns:** Supports *Sine Wave*, *Random Walk (Brownian drift)*, and *Pulse* patterns.
  - **Intensity Control:** Choose between *Gentle* (drift range 0.10), *Medium* (drift range 0.33), and *Wild* (drift range 0.60).
  - **Granular Toggle:** Selectively enable/disable meander for individual tracks, or apply the same pattern to all tracks.
- **⏱️ Advanced Sleep Timers:** Set a timer to start, stop, fade in, or fade out sounds smoothly over a customizable duration (configured in hours and minutes).
- **💾 Custom Mix Presets:** 
  - **Built-in Presets:** Includes 8 default preset mixes (*Relaxing Rain, Forest Walk, Cozy Cafe, Deep Focus, Ocean Breeze, Summer Night, Cabin Retreat, Stormy Sleep*).
  - **My Mixes:** Save your favorite volume combinations locally to your browser via `localStorage`.
  - **Shortcode URL Share:** Share mixes instantly with others using shortcode parameters (e.g., `?m=rno50thn20&autoplay=1&meander=1&mi=w`).
- **📱 Mobile-First PWA Layout:** Touch targets greater than `44px` and support for full-screen dynamic viewports (`dvh`) on iOS and Android.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** React 18 (TypeScript)
- **Bundler & Server:** Vite
- **Styling:** Vanilla CSS (Tailored HSL theme with a premium glassmorphic dark mode layout)
- **Audio Engine:** 
  - Uses a **Double HTML5 Audio Element Loop** (`main` and `glue` audio elements) to achieve a smooth, gapless looping experience.
  - Dynamically manages loading states, base volumes, and cross-fading durations to mimic professional ambient player behaviors.
- **State Management & Persistence:** 
  - **URL Search Params:** Acts as the shareable source of truth for loading pre-configured mixes, meander patterns, and autoplay status.
  - **Local Storage:** Client-side persistence for the active sound keys, saved user mixes, global volume, and language preference.

```
quiet-mind/
├── .agent/              # Agent configuration, rules, and workflows
├── public/              # Static assets (audio tracks, icons)
├── src/
│   ├── assets/          # Shared visual assets (e.g., spinner.gif)
│   ├── components/      # Reusable React components
│   │   └── SoundPlayer.tsx # Controls individual sound states, preloads, & web audio loops
│   ├── App.tsx          # Main dashboard, UI layout, i18n, & state coordinator
│   ├── index.css        # Core design system, glassmorphism, & theme stylesheets
│   ├── types.ts         # Sound definitions, translations, and configs
│   └── main.tsx         # Application mount point
├── index.html           # HTML5 entrypoint & Google Fonts preconnect
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
