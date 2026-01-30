# Cadence Electron App

Native macOS app for the Cadence Scheduler.

## Quick Start

```bash
cd electron
npm install
npm start
```

## Build for Distribution

```bash
# Build DMG for macOS
npm run build-mac

# Or build and package
npm run dist
```

## Features

- **Native macOS app** — No browser needed, runs as standalone application
- **File system access** — Schedule stored in `~/Library/Application Support/Cadence/schedule.yml`
- **Auto-updates** — Modify schedule.yml directly, app reads on refresh
- **Menu bar integration** — Native macOS dock menu
- **All web features** — Drag-and-drop, day selection, time controls, etc.

## Architecture

```
electron/
├── main.js        # Electron main process
├── preload.js     # Secure IPC bridge
├── index.html     # App UI (same scheduler, adapted for Electron)
├── schedule.yml   # Default schedule (copied to user data on first run)
└── package.json   # Electron config
```

## Differences from Web Version

| Feature | Web | Electron |
|---------|-----|----------|
| Storage | LocalStorage + YAML fetch | Native file system |
| Schedule location | `layout-1/schedule.yml` | `~/Library/Application Support/Cadence/` |
| Server needed | Yes (`serve.py`) | No |
| Offline use | No | Yes |
| macOS integration | Limited | Full (dock, menu, etc.) |

## Modifying Your Schedule

Edit `~/Library/Application Support/Cadence/schedule.yml` directly, or use the in-app editing features.