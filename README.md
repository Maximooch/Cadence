# Cadence Scheduler

> **"What should I work on today?"** — Answered automatically, respecting your energy, dependencies, and priorities.

## Quick Start

```bash
cd layout-1
python3 serve.py
# Open http://localhost:8000/index-1.html
```

## What is This?

**Now:** A lightweight daily scheduler (`index-1.html`) with drag-and-drop task reordering, day-specific schedules via YAML, and localStorage persistence.

**Vision:** An energy-aware scheduling system that scales to your actual capacity (not rigid demands). Rate your morning energy (1-10), get a schedule matched to your tier:

| Tier | Energy | Productive Hours | Expectation |
|------|--------|------------------|-------------|
| **0** | ≤30% | 0-2h | Crash day. Survival only. |
| **1** | 30-50% | 3-4h | Maintain minimums. |
| **2** | 50-70% | 6-8h | Standard day. |
| **3** | 70-100% | 8-10h | Full capacity. |

## Smart Scheduling

Uses DAG construction → priority scoring → topological sort → greedy bin packing. Respects dependencies, deadlines, and context-switch penalties (each switch costs more than the last).

## Repo Structure

```
layout-1/
├── index-1.html       # Working scheduler
├── schedule.yml       # Day-by-day config
├── serve.py           # Local server
└── spec-*.md          # Full specs

electron/              # macOS app (see below)
```

## Electron App

For a native macOS app, see the `electron/` directory.

---

*Built with the understanding that some days you conquer the world, other days you just survive.*