# Cadence Scheduler

> **"What should I work on today?"** — Answered automatically, respecting your energy, dependencies, and priorities.

## 🎯 Overview

Cadence is an **energy-aware task scheduling system** designed for humans with variable capacity. It bridges the gap between rigid productivity systems and biological reality.

This repo contains two things:
1. **A working daily scheduler** (simple, functional, ready to use)
2. **A vision for the full Cadence system** (in development)

---

## ✅ Current: Simple Daily Scheduler

**File:** `index-1.html`

A lightweight, browser-based daily task scheduler with drag-and-drop reordering. No backend required — runs entirely in your browser with localStorage persistence.

### Features

- **📅 Day-by-day scheduling** — Different tasks for each day of the week
- **⏰ Time management** — Set wake/sleep times with quick presets
- **🎨 Visual timeline** — See your day at a glance
- **✏️ Full editing** — Add, edit, delete, and reorder tasks
- **🖱️ Drag & drop** — Reorder tasks by dragging rows
- **💾 Auto-save** — Changes persist in localStorage per day
- **⚡ Real-time updates** — Current time indicator, live schedule recalculation
- **📊 Stats dashboard** — Available, scheduled, buffer time, task count

### Quick Start

```bash
# Clone the repo
git clone https://github.com/Maximooch/Cadence.git
cd Cadence/layout-1

# Start local server (required for YAML loading)
python3 serve.py

# Open http://localhost:8000/index-1.html
```

### Configuration

Edit `schedule.yml` to set your default tasks for each day:

```yaml
wake_time: 8.5    # 8:30am
sleep_time: 23    # 11:00pm

# Default tasks for any day not specified
default_tasks:
  - id: 0
    name: "Deep Work"
    duration: 3
    color: "#2563eb"

# Day-specific overrides
days:
  friday:
    tasks:
      - id: 0
        name: "Weekly Review"
        duration: 2
        color: "#ea580c"
```

Changes to `schedule.yml` are loaded on page refresh. Use the **"Reset Day"** button to restore YAML defaults after editing.

---

## 🚀 Vision: Full Cadence System

The simple scheduler is a prototype for a more comprehensive system that **scales task allocation to your actual energy capacity** rather than demanding fixed output.

### The Problem with Traditional Scheduling

Standard productivity systems assume consistent daily capacity. For people with conditions like POTS/Dysautonomia, energy fluctuates 30-100% day-to-day. Cadence solves this with an **energy-based tier system**.

### Energy Tiers

Rate your energy each morning (1-10), then execute the matching template:

| Tier | Energy | Productive Hours | Expectation |
|------|--------|------------------|-------------|
| **0** | 1-3 (≤30%) | 0-2h | Crash day. Survival only. No guilt. |
| **1** | 4-5 (30-50%) | 3-4h | Maintain minimums. Don't push. |
| **2** | 6-7 (50-70%) | 6-8h | Standard productive day. |
| **3** | 8-10 (70-100%) | 8-10h | Full capacity. Don't overcook it. |

### Non-Negotiables (Every Tier)

These happen even at 20% energy:
- Wake at fixed time
- Light exposure (10 min)
- Morning prayer
- Supplements + salt/water
- Walk Austin (dog)
- Log sleep/energy

### Smart Scheduling Algorithm

The full system uses a sophisticated scheduling engine:

1. **DAG Construction** — Build dependency graph from task relationships
2. **Priority Scoring** — Calculate priority based on:
   - Base priority (low/medium/high/critical)
   - Deadline urgency (exponential decay as deadline approaches)
   - Dependency depth (tasks blocking others get priority boost)
3. **Topological Sort** — Ensure dependencies are always satisfied
4. **Greedy Bin Packing** — Allocate tasks to available hours, highest priority first
5. **Context-Switch Penalties** — Discourage fragmentation:
   - Switch #1: 20 min lost
   - Switch #2: 24 min lost
   - Switch #3: 29 min lost
   - Switch #4: 35 min lost
   - Switch #5+: 2× multiplier (excessive fragmentation penalty)

### Data Model

```typescript
interface Task {
  id: string;
  title: string;
  estimated_hours: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];  // Task IDs this depends on
  deadline?: Date;
  tags: string[];
  completed: boolean;
}

interface ScheduleConfig {
  tasks: Task[];
  available_hours: { date: Date; hours: number }[];
  context_switch_penalty_minutes: number;  // default: 20
  max_switches_per_day: number;            // default: 4
  min_task_block_hours: number;            // default: 1.0
}
```

### Roadmap

| Phase | Status | Features |
|-------|--------|----------|
| 1 | ✅ **Complete** | Core scheduler + Daily task list |
| 2 | 🔄 **In Progress** | Energy tier integration + Morning check-in |
| 3 | 📋 **Planned** | Calendar view + Gantt chart + Dependency visualization |
| 4 | 📋 **Planned** | Issue tracker integration (Linear/Jira/GitHub) |
| 5 | 📋 **Planned** | Team coordination + Shared task pools |
| 6 | 📋 **Planned** | Integration with Link PM system |

### Architecture

- **Backend:** FastAPI (Python) + NetworkX (graph algorithms)
- **Frontend:** React + TypeScript + TanStack Query + Tailwind CSS
- **Validation:** Pydantic models for data integrity
- **Storage:** JSON configs (prototype) → Database (production)

---

## 🧠 Philosophy

**Human-first scheduling** — The system acknowledges biological reality:

1. **Energy rating informs schedule generation** — Don't plan 8 hours of deep work on a 30% energy day
2. **Schedule execution produces outcomes** — Track what actually happened
3. **Daily review scores performance** — Score each domain (Spirit, Body, Mind, Relations, Work)
4. **Pattern tracking improves predictions** — Learn your rhythms over time

This creates a feedback loop that gets smarter about your capacity the more you use it.

**Strategic intent:** Validate scheduling logic as standalone → battle-test → integrate into Link's project management system. The scheduler becomes a reusable module across personal task management, team coordination, and AI agent task allocation (Penguin).

---

## 📁 Repo Structure

```
Cadence/
├── index-1.html              # Current working scheduler
├── schedule.yml              # Day-by-day task configuration
├── serve.py                  # Local development server
├── spec-current-scheduler.md # Technical spec for current implementation
├── spec-cadence-project.md   # Full project specification
├── scheduler.jsx             # React component (alternative)
└── README.md                 # This file
```

---

## 🙏 Acknowledgments

This project emerged from the intersection of:
- **Practical need** — Managing variable energy with POTS/Dysautonomia
- **Technical curiosity** — Can we build a scheduler that respects human limitations?
- **Faith** — "God bless us all!" — The prayer at the start of this project

**Chat references:**
- Scheduler design: https://claude.ai/chat/9f60ac79-0f6f-4164-8646-862a00331a0b
- Energy system: https://claude.ai/chat/1ef95b7e-63cf-4929-b11d-f6338791378e

---

## 🤝 Contributing

This is a personal project, but ideas and feedback are welcome! Open an issue if you have thoughts on:
- Energy tier calibration
- Scheduling algorithm improvements
- UI/UX enhancements
- Integration possibilities

---

*Built with ❤️, ☕, and the understanding that some days you can conquer the world, and other days you just need to survive.*