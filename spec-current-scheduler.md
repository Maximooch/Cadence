# Current Scheduler (HTML/JSX) - Technical Specification

## Overview
A static daily schedule visualizer built with React (via CDN) and Tailwind CSS. Displays a hardcoded task timeline with wake/sleep time constraints.

## Current Implementation

### Tech Stack
- **Runtime**: React 18 (UMD build via CDN)
- **Transpilation**: Babel standalone (in-browser)
- **Styling**: Tailwind CSS (via CDN)
- **Format**: Single HTML file with embedded JSX

### Data Model

```typescript
interface Task {
  id: number | string;           // -1 for review, 0+ for tasks, '∞' for optional
  name: string;
  duration: number;               // In hours (e.g., 0.5 = 30min)
  color: string;                  // Hex color for UI
}

interface ScheduleBlock extends Task {
  startTime: number;              // Decimal hour (e.g., 8.5 = 8:30am)
  endTime: number;
}
```

### Configuration (Hardcoded)
- **Wake time**: 8:30am (8.5 hours)
- **Sleep time**: 11:00pm (23 hours)
- **Available hours**: 14.5 hours

### Core Components

#### 1. Time Formatting
- `formatHour(hour)`: Converts decimal hour to 12-hour format (e.g., 8.5 → "8:30am")
- `format24Hour(hour)`: Converts to 24-hour format (e.g., 8.5 → "0830")

#### 2. Schedule Generation
```javascript
// Sequential allocation - no dependencies or priorities
let currentTime = wakeTime;
tasks.forEach((task) => {
  schedule.push({
    ...task,
    startTime: currentTime,
    endTime: currentTime + task.duration,
  });
  currentTime += task.duration;
});
```

#### 3. UI Sections

**Header Stats**
- Wake/sleep times
- Available hours
- Scheduled hours
- Buffer/overage
- Note about organic Pomodoro breaks

**24-Hour Clock Grid**
- Morning (0-11) and afternoon (12-23) sections
- Highlights active hours (8:30am - 11:00pm)
- Shows both 24-hour and 12-hour formats

**Timeline View**
- Horizontal bar visualization
- Color-coded task blocks
- Task IDs displayed on blocks
- Hour grid lines
- Hover tooltips with full task details

**Task Schedule Table**
- Columns: # (color badge), Task, Start, End, Duration
- Alternating row colors
- Duration formatted as "Xh Ym" or "Xm"

**Optional/Parallel Tasks**
- Separate section for non-sequential tasks
- Dashed border container
- Note about parallel execution

**Summary Stats**
- 4-card grid: Available Time, Scheduled, Buffer/Over, Tasks
- Color-coded values (green, blue, yellow/red, purple)

**Overrun Warning**
- Red alert box when schedule exceeds available time
- Shows actual end time
- Suggests trimming or extending day

### Current Task List (Hardcoded)
| ID | Task | Duration | Color |
|----|------|----------|-------|
| -1 | Review | 0.5h | #6b7280 (gray) |
| 0 | Holy Study (Orthodox + Bible) | 3h | #7c3aed (purple) |
| 1 | Wrap up SipScout | 3h | #2563eb (blue) |
| 2 | Penguin Context | 0.75h | #0891b2 (cyan) |
| 3 | roadmap.md (Company + Penguin + Link) | 1h | #059669 (green) |
| 4 | features.md (Company + Penguin + Link) | 1h | #65a30d (lime) |
| 5 | Penguin Kanban Tracks | 1.5h | #ca8a04 (yellow) |
| 6 | Link brainstorming.md | 2h | #ea580c (orange) |
| 7 | FE/Stack Exploration | 0.5h | #dc2626 (red) |
| ∞ | Research & Backlog (parallel/optional) | 1h | #a855f7 (magenta) |

### Total Schedule
- **Scheduled time**: 12.25 hours
- **Available time**: 14.5 hours
- **Buffer**: 2.25 hours

## Limitations (Current State)

1. **No dynamic task input** - All tasks hardcoded
2. **No dependencies** - Tasks scheduled sequentially regardless of relationships
3. **No priorities** - Order determined by array position only
4. **Fixed wake/sleep times** - No configuration UI
5. **No persistence** - Changes lost on refresh
6. **No API integration** - Pure client-side rendering
7. **No energy awareness** - Doesn't adapt to daily capacity
8. **No context-switch penalties** - Ignores cognitive cost of task switching
9. **No deadline tracking** - Tasks have no due dates
10. **No rebalancing** - Can't regenerate after task completion

## Design Decisions

- **Single-file architecture**: For quick prototyping and easy deployment
- **CDN dependencies**: No build step required
- **Dark mode default**: Matches developer preferences
- **Color coding**: Quick visual identification of task types
- **Organic breaks**: Explicitly stated that Pomodoro breaks are not scheduled but taken between blocks

## Next Steps (To Reach Cadence Vision)

1. Extract to proper React project with build system
2. Add task CRUD operations with local storage
3. Implement wake/sleep time configuration
4. Add task dependencies and priorities
5. Integrate scheduling algorithm (DAG + topological sort)
6. Add energy tier selection
7. Connect to backend API for advanced scheduling
8. Add persistence and sync across devices