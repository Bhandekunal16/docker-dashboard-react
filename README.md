# Docker Dashboard

A modern, production-quality web-based Docker management dashboard built with React, TypeScript, Vite, Tailwind CSS, TanStack Query, and Lucide Icons.

The application connects directly to the Docker REST API backend to monitor host workloads, manage container lifecycles, inspect container logs in real time, and manage cached Docker images.

---

## Features

- **Resource Dashboard**
  - Instant host statistics: Total containers, Running containers, Stopped containers, Total images
  - Lifecycle distribution overview
  - Quick action shortcuts
  - Recent containers table with live actions
- **Containers Management**
  - Complete list of Docker containers with ID, name, image, status, and port mappings
  - Actions: **Start**, **Stop**, **Restart**, and **Remove** containers
  - Destructive action confirmation dialogs
  - Real-time status badges (Running, Stopped, Paused, Restarting)
  - Search and filter by status (All, Running, Stopped)
- **Terminal Container Logs**
  - Monospace dark terminal modal
  - Controls for log line tail limits (50, 100, 200, 500, 1000 lines)
  - Timestamp prefix toggle
  - Live auto-refresh / streaming mode (3s interval)
  - Copy to clipboard & clear logs
- **Images Management**
  - Full table of cached Docker images with ID, Repository/Tag, Size, Shared/Unique Size, Container references, Creation time, and Digest
  - Multi-select capability for batch operations
  - Single image removal (`POST /remove/image`)
  - Batch image removal (`POST /remove/images`)
  - Fast search, sorting (by Tag, Size, Containers, Created Date), and order toggle
- **Global Keyboard Navigation & Shortcuts**
  - Instant chord and hotkey routing: `1` or `G+D` (Dashboard), `2` or `G+C` (Containers), `3` or `G+I` (Images)
  - `?` or `Shift+/`: Interactive Keyboard Shortcuts Helper modal with direct click-to-action capabilities
  - `R`: Refresh all container/image queries and ping connection
  - `S`: Quick access to API Settings modal
  - `Esc`: Close any open drawer or modal
- **API Configuration & Health Status**
  - Dynamic API Base URL configuration with live test-ping connection tester
  - Live connection status indicator (Connected, Error, Checking) in the top header
  - Centralized error handling with user-friendly diagnostics

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **State & Caching**: [TanStack Query (React Query)](https://tanstack.com/query)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Project Structure

```text
src/
├── api/                   # Centralized API service layer
│   ├── client.ts          # Axios instance, base URL configuration & error parser
│   ├── containers.ts      # Endpoints for containers (get, start, stop, restart, rm)
│   ├── images.ts          # Endpoints for images (get, remove single, remove multiple)
│   └── logs.ts            # Endpoint for container logs
├── components/
│   ├── common/            # Reusable UI primitives (Badge, Button, Card, Dialog, Toast, Skeletons)
│   ├── containers/        # Container table, card, filter, and row components
│   ├── dashboard/         # Stat cards, status distribution, quick actions, recent table
│   ├── images/            # Image table, card, filter, and row components
│   ├── layout/            # Layout shell, Sidebar, Header, API Config Modal
│   └── logs/              # Terminal container logs viewer modal
├── context/
│   └── ConfigContext.tsx  # Dynamic base URL, toasts, connection state & logs modal context
├── hooks/
│   ├── useContainers.ts   # Container query & mutation hooks with cache invalidation
│   ├── useContainerLogs.ts# Container logs query hook with streaming support
│   └── useImages.ts       # Docker images query & mutation hooks
├── pages/
│   ├── Containers.tsx     # Dedicated Containers page
│   ├── Dashboard.tsx      # Overview Dashboard
│   └── Images.tsx         # Docker Images page
├── types/                 # Strict TypeScript interface definitions
│   ├── api.ts             # API errors, connection states, toast types
│   ├── container.ts       # Container entity and mutation payloads
│   ├── image.ts           # DockerImage entity and mutation payloads
│   └── logs.ts            # Log request and response schemas
├── utils/
│   └── formatters.ts      # Status parsing, port mappings, IDs & date formatting
├── App.tsx                # App entry point with Router and Providers
├── index.css              # Tailwind CSS styles and custom scrollbars
└── main.tsx               # DOM root mount
```

---

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL where the Docker REST API server is listening | `http://0.0.0.0:5000` |

You can specify this in your `.env` or `.env.local` file:

```env
VITE_API_BASE_URL=http://0.0.0.0:5000
```

> **Note**: You can also change the API endpoint at runtime directly from the UI by clicking the server badge or Settings icon in the header. Quick presets include `http://0.0.0.0:5000`, `http://localhost:5000`, `http://127.0.0.1:5000`, and `http://localhost:3000`.

---

## UI/UX Principles Compliance

- **Hick’s Law**: Streamlined choices through segmented status filters (`All`, `Running`, `Stopped`), quick endpoint preset pills, and straightforward action menus to minimize decision time.
- **Fitts’s Law**: Generously padded buttons, ≥36–44px clickable target areas for table controls, prominent primary actions, and sticky headers for immediate reach.
- **Jakob’s Law**: Implemented familiar Docker & cloud console mental models (standard left sidebar navigation, top connection status bar, terminal logs drawer, and standard start/stop/restart/remove iconography).
- **Miller’s Law**: Chunked information into digestible sets (4 top metric cards, 6 primary table columns, grouped metadata pills) to prevent cognitive overload.
- **Gestalt Law of Proximity**: Grouped related items with consistent spacing, unified search & filter bars, encapsulated cards, and clearly grouped action buttons.
- **Aesthetic-Usability Effect**: High-contrast dark theme, crisp typography pairing (`Plus Jakarta Sans` and `Fira Code`), smooth micro-interactions, and live status badges.

---

## Installation & Running

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

The application will be accessible at:
```text
http://localhost:3000
```

### 3. Build for production

```bash
npm run build
```

The production-ready static assets will be compiled into the `dist/` directory.

---

## API Specification Reference

This frontend adheres strictly to the documented REST API contract:

| Method | Endpoint | Description | Request Body |
| --- | --- | --- | --- |
| `GET` | `/get/all/containers` | List all Docker containers | — |
| `POST` | `/start/container` | Start a stopped container | `{ "containerId": string }` |
| `POST` | `/stop/container` | Stop a running container | `{ "containerId": string }` |
| `POST` | `/restart/container` | Restart a container | `{ "containerId": string }` |
| `POST` | `/remove/container` | Remove a container | `{ "containerId": string }` |
| `POST` | `/logs/container` | Fetch container stdout/stderr logs | `{ "containerId": string, "timestamps"?: boolean, "tail"?: number }` |
| `GET` | `/get/all/images` | List cached Docker images | — |
| `POST` | `/remove/image` | Remove a single image | `{ "imageId": string }` |
| `POST` | `/remove/images` | Remove multiple images | `{ "imageIds": string[] }` |

---

## Available Pages

1. **Dashboard (`/`)**: High-level telemetry, status breakdown, container health, quick navigation.
2. **Containers (`/containers`)**: Comprehensive container inspector and lifecycle management controls.
3. **Images (`/images`)**: Multi-select image browser, size diagnostics, and removal management.
