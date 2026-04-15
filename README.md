# Defect Containment Board

This project is prepared for the AI Test Automation training. The main goal is to have a simple only web application that will be used for testing purposes.

## Tech Stack

- **React 19** — UI framework
- **Vite 8** — Build tool and dev server
- **Tailwind CSS 3** — Utility-first CSS framework
- **Lucide React** — Icon library
- **localStorage** — Client-side data persistence (no backend)

## Getting Started

### Prerequisites

- Node.js (v18+)

### Installation

```bash
npm install
```

### Running the App

```bash
npm run dev
```

The app starts at `http://localhost:5173` by default.

### Other Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start development server     |
| `npm run build`   | Create production build      |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                   |

## Application Overview

The Defect Containment Board (DCB) is a single-page application for managing software defects. It features a dark-themed UI with neon accents and uses browser localStorage for data persistence — no backend or database is required.

### Authentication

The app opens with a login screen. Any non-empty username and password combination is accepted (there is no real authentication). After login, the user is taken to the Dashboard.

### Pages

#### Dashboard

Displays summary statistics:

- **Total Contained Defects** — count of all defects
- **Critical** — count of defects with `Critical` severity
- **Containment Rate** — a static value of 98.7%

#### Defect List

Shows all defects in a table with columns: ID, Title, Severity, and Actions. Each defect can be resolved (removed) via a button. An empty state is displayed when no defects exist.

#### Report Defect

A form to create new defects with the following fields:

- **Title** (required)
- **Description**
- **Severity** — `Critical`, `Major`, or `Minor`

Submitting the form adds the defect and navigates to the Defect List.

Contains a "Legacy Module" easter egg — a checkbox that moves away when hovered.

### Navigation

Navigation is state-based (no routing library). The Navbar provides links to Dashboard, Defect List, and Report Defect, plus a Logout button.

### Footer

Contains a "Reset Data" button that restores the default seed defects and displays a version string.

## Data Model

Defects are stored as an array in localStorage under the key `"defects"`.

### Defect Object

| Field         | Type   | Description                          |
| ------------- | ------ | ------------------------------------ |
| `id`          | Number | Auto-incremented unique identifier   |
| `title`       | String | Defect title                         |
| `description` | String | Defect description                   |
| `severity`    | String | One of: `Critical`, `Major`, `Minor` |

### Seed Data

The app ships with three pre-loaded defects:

1. "Button runs away when hovered" — Critical
2. "Database returns emojis instead of IDs" — Major
3. "404 page actually found something" — Minor

## Project Structure

```
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS theme (custom colors, glows)
├── postcss.config.js       # PostCSS with Tailwind and Autoprefixer
├── eslint.config.js        # ESLint flat config
├── src/
│   ├── main.jsx            # Entry point, mounts App
│   ├── App.jsx             # Root component, state-based routing
│   ├── index.css           # Tailwind imports, glass/neon/glitch styles
│   ├── components/
│   │   ├── Navbar.jsx      # Top navigation bar with page links
│   │   └── Footer.jsx      # Footer with reset button and version
│   ├── data/
│   │   └── defects.js      # localStorage CRUD and seed data
│   ├── hooks/
│   │   └── useDefects.js   # Custom hook for defect state management
│   └── pages/
│       ├── Login.jsx       # Login screen
│       ├── Dashboard.jsx   # Stats overview and easter egg
│       ├── DefectList.jsx  # Defect table with resolve actions
│       └── ReportDefect.jsx# Form to create new defects
└── public/                 # Static assets
```
