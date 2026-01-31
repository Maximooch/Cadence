God bless us all! 

January 24th 2026AD 1:26a


----


Now I have enough context. Let me compile a comprehensive overview of both systems:

---

# Cadence: Comprehensive Overview

## Part 1: Task Scheduling Engine (Oct 2025)

### Core Problem
Reduce cognitive load and planning ambiguity — answer "what should I work on today?" automatically by building a system that respects dependencies, priorities, and human focus limitations.

### Architecture

**Stack:**
- Backend: FastAPI + NetworkX (graph algorithms)
- Frontend: React + TypeScript + TanStack Query + Tailwind
- Data: JSON task configs with Pydantic validation

**Data Model:**

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  estimated_hours: number;      // >0
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];       // task IDs this depends on
  deadline?: date;
  tags: string[];
  completed: boolean;
}

interface ScheduleConfig {
  tasks: Task[];
  available_hours: { date: date, hours: number }[];
  start_date: date;
  context_switch_penalty_minutes: number;  // default: 20
  max_switches_per_day: number;            // default: 4
  min_task_block_hours: number;            // default: 1.0
}
```

### Scheduling Algorithm

**Step 1 — Build DAG:**
Construct directed acyclic graph from task dependencies. Detect cycles (invalid configs).

**Step 2 — Calculate Priority Scores:**
```
score = base_priority + deadline_urgency + (dependent_count × 0.5)
```

| Priority | Base Weight |
|----------|-------------|
| Low | 1 |
| Medium | 2 |
| High | 3 |
| Critical | 5 |

- **Deadline urgency:** Tasks closer to deadline get boosted
- **Dependency depth:** Tasks that block other tasks get scheduled earlier (more dependents = higher score)

**Step 3 — Topological Sort:**
Order all tasks so dependencies are always met. No task scheduled before its prerequisites.

**Step 4 — Greedy Bin Packing:**
Allocate tasks to available hours per day, highest priority first, respecting:
- Available capacity per day
- Minimum task block hours (no 15-min fragments)
- Deadline constraints

**Step 5 — Apply Context-Switch Penalties:**

```python
penalty = base_minutes × (1.2 ^ switch_number) / 60
```

| Switch # | Penalty (base 20min) |
|----------|----------------------|
| 1st | 20 min |
| 2nd | 24 min |
| 3rd | 29 min |
| 4th | 35 min |
| 5th+ (exceeds max) | 2× multiplier |

This discourages task fragmentation. If you switch tasks 5 times in a day, you've lost ~2+ hours to context switching.

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/schedule` | POST | Generate schedule from config |
| `/rebalance` | POST | Regenerate after completing tasks |
| `/validate` | POST | Check config validity (cycle detection, etc.) |

### Output Format

```typescript
interface ScheduleResult {
  daily_schedules: DailySchedule[];
  unscheduled_tasks: string[];  // couldn't fit
  warnings: string[];           // deadlines at risk, etc.
  metadata: {
    total_hours_scheduled: number;
    context_switches: number;
    efficiency_score: number;
  };
}
```

### Planned Roadmap (from original discussion)

| Phase | Features |
|-------|----------|
| 1 ✅ | Core scheduler + Daily task list |
| 2 | Calendar view + Manual rebalance UI |
| 3 | Gantt chart + Dependency visualization |
| 4 | Issue tracker integration (Linear/Jira/GitHub) |
| 5 | Team coordination features |
| 6 | Integration with Link PM system |

### Strategic Intent

Validate scheduling logic as standalone product → battle-test → integrate into Link's project management system. The scheduler becomes a reusable module across:
- Personal task management
- Team coordination
- AI agent task allocation (Penguin)

---

## Part 2: Energy-Based Life System (Jan 2026)

### Core Problem
Standard productivity systems assume consistent energy. With POTS/Dysautonomia, energy fluctuates 30-100% day-to-day. You need a system that **scales to your actual capacity** rather than demanding fixed output.

### Tier System

Rate energy each morning (1-10 scale), then execute the matching template:

| Tier | Energy | Template | Expectation |
|------|--------|----------|-------------|
| 0 | ≤30% | Crash Day | Survival. Non-negotiables only. No guilt. |
| 1 | 30-50% | Low Energy | Maintain minimums. Don't push. |
| 2 | 50-70% | Moderate | Standard productive day. |
| 3 | 70-100% | High Energy | Full capacity. Don't overcook it. |

### Non-Negotiables (Every Day, Every Tier)

These happen even at 20% energy:
- [ ] Wake at fixed time
- [ ] Light exposure (10 min)
- [ ] Morning prayer
- [ ] Supplements + salt/water
- [ ] Walk Austin
- [ ] Log sleep/energy

### Tier-Specific Additions

**Tier 1 (Low Energy):**
- One additional 15+ min walk
- Hydration target
- Evening prayer
- One friend touchpoint
- Spiritual reading

**Tier 2 (Moderate):**
- Walking total: 6 miles
- Cardio or climbing session
- Two deep work blocks
- Protein target (~150g)
- Day review

**Tier 3 (High Energy):**
- Full cardio session
- Three deep work blocks
- Harder climbing session
- Creative/strategic work
- Social engagement

### Scoring System

Each domain: 0-2 points

| Score | Meaning |
|-------|---------|
| 0 | Nothing done |
| 1 | Tier 1 level (minimum) |
| 2 | Tier 2+ level (solid) |

**Domains:** Spirit, Body, Mind, Relations, Work

| Daily Score | Interpretation |
|-------------|----------------|
| 3-4 | Crash day — acceptable |
| 5-6 | Low energy — maintained |
| 7-8 | Solid day (target average) |
| 9-10 | High output (rare) |

**Weekly target:** 45-50 points (~6.5-7/day average)

### POTS-Specific Protocols

**Pre-exercise:**
- 16-24 oz water + salt 30-60 min before
- Compression on legs

**During:**
- HR cap ~140 or conversational pace
- Stop if pre-syncopal symptoms

**Post:**
- Keep moving or lie down (avoid standing still)
- Cooldown recumbent
- Rehydrate immediately

**Crash Protocol:**
- Energy <3/10 day after training → reduce next session 30%
- Two crashes in a week → 3 days off, resume previous level

### Weekly Rhythm

| Day | Training | Work Load |
|-----|----------|-----------|
| Mon | Cardio | High |
| Tue | Climbing | High |
| Wed | Cardio | High |
| Thu | Climbing | Moderate |
| Fri | Cardio | High |
| Sat | Walk/light | Low (review) |
| Sun | Rest | Sabbath |

### Supplement Stack

| Supplement | Dose | Timing |
|------------|------|--------|
| D3 | 4-5000 IU | Morning w/ fat |
| K2 (MK-7) | 100-200 mcg | With D3 |
| Magnesium glycinate | 300-400 mg | Before bed |
| B complex | As labeled | Morning |
| Salt/electrolytes | 3-5g sodium | Throughout day |
| Creatine | 5g | Any time |
| Glycine | 3g | Before bed |

### Daily Targets

| Metric | Target |
|--------|--------|
| Sleep | 8-10 hrs |
| Water | 2-3L + electrolytes |
| Protein | ~150g |
| Walking | 6 mi / day |
| Cardio | 3-4x / week |
| Climbing | 2x / week |
| Caffeine cutoff | 12pm |

---

## Integration: How They Merge

The vision is a **unified Cadence system** where:

1. **Morning energy rating** (from Part 2) feeds into the scheduler
2. **Available hours** dynamically adjust based on tier:
   - Tier 0: 0-2 hours productive work
   - Tier 1: 3-4 hours
   - Tier 2: 6-8 hours
   - Tier 3: 8-10 hours
3. **Task allocation** (from Part 1) respects these constraints
4. **Context-switch penalties** scale with energy (lower energy = fewer switches tolerated)
5. **Weekly planning** accounts for predicted energy patterns

The scheduler stops being purely task-driven and becomes **energy-aware** — a system designed for humans with variable capacity, not robots with fixed throughput.

---

**Chat references:**
- Scheduler: https://claude.ai/chat/9f60ac79-0f6f-4164-8646-862a00331a0b
- Energy system: https://claude.ai/chat/1ef95b7e-63cf-4929-b11d-f6338791378e
