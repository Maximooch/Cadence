# Cadence Project - Full Specification

## Executive Summary

Cadence is an energy-aware task scheduling system designed for humans with variable capacity. It answers "what should I work on today?" by respecting dependencies, priorities, deadlines, and actual daily energy levels.

**Core Innovation**: Scales task allocation to your energy capacity rather than demanding fixed output.

---

## Part 1: Task Scheduling Engine

### Problem Statement
Reduce cognitive load and planning ambiguity by automating daily task allocation while respecting:
- Task dependencies (what must be done first)
- Priorities (what's most important)
- Deadlines (what's due soon)
- Human focus limitations (context-switch costs)
- Variable daily capacity (energy fluctuations)

### Architecture

#### Backend Stack
- **Framework**: FastAPI (Python)
- **Graph Algorithms**: NetworkX (DAG construction, topological sort)
- **Validation**: Pydantic (data models, config validation)
- **API**: RESTful endpoints for schedule generation

#### Frontend Stack
- **Framework**: React + TypeScript
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Data Fetching**: Axios or fetch with React Query

#### Data Storage
- **Format**: JSON configuration files
- **Validation**: Pydantic models on load
- **Persistence**: Local storage (client) + optional cloud sync

### Data Models

#### Task Configuration

```typescript
interface Task {
  id: string;                    // Unique identifier
  title: string;                 // Human-readable name
  description?: string;          // Optional details
  estimated_hours: number;       // Duration (must be > 0)
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];         // Task IDs this task depends on
  deadline?: Date;               // Optional due date
  tags: string[];                // For filtering/grouping
  completed: boolean;            // Completion status
  created_at?: Date;             // Tracking metadata
  updated_at?: Date;
}

interface ScheduleConfig {
  tasks: Task[];
  available_hours: {             // Daily capacity
    date: Date;
    hours: number;
  }[];
  start_date: Date;              // Schedule start date
  context_switch_penalty_minutes: number;  // Default: 20
  max_switches_per_day: number;            // Default: 4
  min_task_block_hours: number;            // Default: 1.0
}
```

#### Schedule Output

```typescript
interface ScheduleResult {
  daily_schedules: DailySchedule[];
  unscheduled_tasks: string[];  // IDs that couldn't fit
  warnings: string[];           // Deadlines at risk, etc.
  metadata: ScheduleMetadata;
}

interface DailySchedule {
  date: Date;
  scheduled_blocks: ScheduledBlock[];
  total_hours: number;
  context_switches: number;
  efficiency_score: number;     // 0-100
}

interface ScheduledBlock {
  task_id: string;
  task_title: string;
  start_time: number;           // Decimal hour (e.g., 8.5 = 8:30am)
  end_time: number;
  duration: number;
  priority: Task['priority'];
  is_movable: boolean;          // Can be rescheduled
}

interface ScheduleMetadata {
  total_hours_scheduled: number;
  total_tasks_scheduled: number;
  average_tasks_per_day: number;
  context_switches_total: number;
  efficiency_score: number;     // Overall schedule efficiency
  deadline_risks: string[];     // Tasks at risk of missing deadlines
}
```

### Scheduling Algorithm

#### Step 1: Build Directed Acyclic Graph (DAG)
```python
# Construct graph from task dependencies
graph = nx.DiGraph()
for task in tasks:
    graph.add_node(task.id, task=task)
    for dep_id in task.dependencies:
        graph.add_edge(dep_id, task.id)

# Detect cycles (invalid configuration)
if not nx.is_directed_acyclic_graph(graph):
    raise CycleError("Circular dependencies detected")
```

#### Step 2: Calculate Priority Scores
```python
def calculate_priority_score(task: Task, graph: nx.DiGraph) -> float:
    # Base priority weights
    base_weights = {
        'low': 1,
        'medium': 2,
        'high': 3,
        'critical': 5
    }
    
    base_score = base_weights[task.priority]
    
    # Deadline urgency (exponential decay as deadline approaches)
    if task.deadline:
        days_until_deadline = (task.deadline - today).days
        deadline_boost = max(0, 5 / (days_until_deadline + 1))
    else:
        deadline_boost = 0
    
    # Dependency depth (tasks blocking others get higher score)
    dependents = len(list(graph.successors(task.id)))
    dependency_boost = dependents * 0.5
    
    return base_score + deadline_boost + dependency_boost
```

**Priority Scoring Table:**

| Priority | Base | Deadline (1 day) | Deadline (7 days) | 3 Dependents |
|----------|------|------------------|-------------------|---------------|
| Low | 1 | 1 + 2.5 = 3.5 | 1 + 0.6 = 1.6 | 1 + 1.5 = 2.5 |
| Medium | 2 | 2 + 2.5 = 4.5 | 2 + 0.6 = 2.6 | 2 + 1.5 = 3.5 |
| High | 3 | 3 + 2.5 = 5.5 | 3 + 0.6 = 3.6 | 3 + 1.5 = 4.5 |
| Critical | 5 | 5 + 2.5 = 7.5 | 5 + 0.6 = 5.6 | 5 + 1.5 = 6.5 |

#### Step 3: Topological Sort
```python
# Order tasks so dependencies are always satisfied
sorted_task_ids = list(nx.topological_sort(graph))
```

#### Step 4: Greedy Bin Packing
```python
def allocate_tasks_to_days(tasks: List[Task], available_hours: List[DailyHours]) -> List[DailySchedule]:
    daily_schedules = []
    unscheduled = []
    
    # Sort by priority score (highest first)
    prioritized_tasks = sorted(tasks, key=calculate_priority_score, reverse=True)
    
    for day in available_hours:
        day_schedule = DailySchedule(date=day.date, scheduled_blocks=[])
        remaining_capacity = day.hours
        
        for task in prioritized_tasks:
            if task.completed:
                continue
            
            # Check minimum block size
            if task.estimated_hours < min_task_block_hours:
                continue
            
            # Check dependencies satisfied
            if not dependencies_satisfied(task, day_schedule):
                continue
            
            # Check deadline constraint
            if task.deadline and task.deadline < day.date:
                unscheduled.append(task.id)
                continue
            
            # Check capacity
            if task.estimated_hours <= remaining_capacity:
                day_schedule.scheduled_blocks.append(ScheduledBlock(task))
                remaining_capacity -= task.estimated_hours
                task.completed = True  # Mark as scheduled
        
        daily_schedules.append(day_schedule)
    
    return daily_schedules, unscheduled
```

#### Step 5: Apply Context-Switch Penalties
```python
def calculate_switch_penalty(switch_number: int, base_minutes: int = 20) -> float:
    """
    Exponential penalty for context switching.
    Each switch costs more than the previous.
    """
    penalty_minutes = base_minutes * (1.2 ** switch_number)
    return penalty_minutes / 60  # Convert to hours

# Example penalties (base 20 min):
# Switch 1: 20 min (0.33 hr)
# Switch 2: 24 min (0.40 hr)
# Switch 3: 29 min (0.48 hr)
# Switch 4: 35 min (0.58 hr)
# Switch 5: 42 min (0.70 hr) - exceeds max_switches_per_day
```

**Penalty Table (Base 20 min):**

| Switch # | Penalty (min) | Penalty (hr) | Cumulative Lost |
|----------|---------------|--------------|-----------------|
| 1 | 20 | 0.33 | 0.33 hr |
| 2 | 24 | 0.40 | 0.73 hr |
| 3 | 29 | 0.48 | 1.21 hr |
| 4 | 35 | 0.58 | 1.79 hr |
| 5+ | 42+ | 0.70+ | 2.49+ hr |

**Strategy**: If switches exceed `max_switches_per_day`, apply 2× penalty multiplier to discourage fragmentation.

### API Endpoints

| Endpoint | Method | Request | Response | Purpose |
|----------|--------|---------|----------|---------|
| `/schedule` | POST | `ScheduleConfig` | `ScheduleResult` | Generate schedule |
| `/rebalance` | POST | `{completed_task_ids: string[]}` | `ScheduleResult` | Regenerate after completion |
| `/validate` | POST | `ScheduleConfig` | `{valid: bool, errors: string[]}` | Check config validity |
| `/tasks` | GET | - | `Task[]` | List all tasks |
| `/tasks` | POST | `Task` | `Task` | Create task |
| `/tasks/{id}` | PUT | `Task` | `Task` | Update task |
| `/tasks/{id}` | DELETE | - | `{success: bool}` | Delete task |
| `/export` | GET | `format: 'json'\|'csv'` | File blob | Export tasks |

### Validation Rules

1. **Cycle Detection**: Reject configs with circular dependencies
2. **Minimum Duration**: Tasks must be ≥ 0.25 hours (15 min)
3. **Minimum Block**: No task < `min_task_block_hours` (default 1.0)
4. **Deadline Logic**: Deadline cannot be before start_date
5. **Capacity Check**: `available_hours` must be ≥ sum of task durations
6. **Dependency Validity**: All dependency IDs must exist

---

## Part 2: Energy-Based Life System

### Problem Statement
Standard productivity systems assume consistent daily capacity. With conditions like POTS/Dysautonomia, energy fluctuates 30-100% day-to-day. Cadence scales task allocation to actual capacity rather than demanding fixed output.

### Tier System

Rate energy each morning (1-10 scale), then execute the matching template:

| Tier | Energy Range | Template | Expectation | Productive Hours |
|------|-------------|----------|-------------|------------------|
| 0 | 1-3 | Crash Day | Survival. Non-negotiables only. No guilt. | 0-2 hours |
| 1 | 4-5 | Low Energy | Maintain minimums. Don't push. | 3-4 hours |
| 2 | 6-7 | Moderate | Standard productive day. | 6-8 hours |
| 3 | 8-10 | High Energy | Full capacity. Don't overcook it. | 8-10 hours |

### Non-Negotiables (Every Tier)

These execute even at 20% energy:

**Daily Checklist:**
- [ ] Wake at fixed time
- [ ] Light exposure (10 min minimum)
- [ ] Morning prayer
- [ ] Supplements + salt/water
- [ ] Walk Austin
- [ ] Log sleep/energy

### Tier-Specific Additions

#### Tier 1: Low Energy (30-50%)
**Add to non-negotiables:**
- One additional 15+ min walk
- Hydration target (2L minimum)
- Evening prayer
- One friend touchpoint (text/call)
- Spiritual reading (10 min)

**Work expectation:**
- 1-2 deep work blocks
- Focus on maintenance, not progress
- No new feature work

#### Tier 2: Moderate (50-70%)
**Add to Tier 1:**
- Walking total: 6 miles
- Cardio or climbing session
- Two deep work blocks
- Protein target (~150g)
- Day review (5 min)

**Work expectation:**
- Standard productive output
- Mix of maintenance and progress
- 2-3 deep work blocks

#### Tier 3: High Energy (70-100%)
**Add to Tier 2:**
- Full cardio session (45+ min)
- Three deep work blocks
- Harder climbing session
- Creative/strategic work
- Social engagement (1+ hours)

**Work expectation:**
- Maximum output
- Strategic thinking and planning
- 3-4 deep work blocks

### Scoring System

Each domain: 0-2 points

| Score | Meaning | Example |
|-------|---------|---------|
| 0 | Nothing done | No prayer, no exercise |
| 1 | Tier 1 level (minimum) | 10 min prayer, 15 min walk |
| 2 | Tier 2+ level (solid) | 30 min prayer, 6 miles walking |

**Domains:**
1. **Spirit** - Prayer, reading, meditation
2. **Body** - Exercise, supplements, sleep
3. **Mind** - Deep work, learning, reading
4. **Relations** - Friend touchpoints, family
5. **Work** - Productive tasks, progress

**Daily Score Interpretation:**

| Daily Score | Interpretation | Action |
|-------------|----------------|--------|
| 3-4 | Crash day | Acceptable. Rest and recover. |
| 5-6 | Low energy | Maintained. Don't push harder. |
| 7-8 | Solid day | Target average. Good job. |
| 9-10 | High output | Rare. Don't expect this daily. |

**Weekly Target:**
- 45-50 points total
- ~6.5-7 points/day average

### POTS-Specific Protocols

#### Pre-Exercise
- 16-24 oz water + salt 30-60 min before
- Compression garments on legs
- Check HR and BP baseline

#### During Exercise
- HR cap ~140 bpm or conversational pace
- Stop immediately if pre-syncopal symptoms:
  - Dizziness/lightheadedness
  - Vision changes
  - Nausea
  - Chest pain

#### Post-Exercise
- Keep moving or lie down (avoid standing still)
- Cooldown in recumbent position
- Rehydrate immediately (water + electrolytes)
- Monitor HR recovery (should drop 20+ bpm in 1 min)

#### Crash Protocol
**Definition:** Energy < 3/10 day after training

**Actions:**
- Reduce next session by 30% duration
- Two crashes in a week → 3 days off
- Resume at previous level after recovery

### Weekly Rhythm

| Day | Training | Work Load | Notes |
|-----|----------|-----------|-------|
| Mon | Cardio | High | Start strong |
| Tue | Climbing | High | Technical focus |
| Wed | Cardio | High | Mid-week push |
| Thu | Climbing | Moderate | Technique work |
| Fri | Cardio | High | End week strong |
| Sat | Walk/light | Low | Review week |
| Sun | Rest | Sabbath | No work, no training |

### Supplement Stack

| Supplement | Dose | Timing | Purpose |
|------------|------|--------|---------|
| Vitamin D3 | 4-5000 IU | Morning w/ fat | Bone health, immunity |
| Vitamin K2 (MK-7) | 100-200 mcg | With D3 | Calcium regulation |
| Magnesium glycinate | 300-400 mg | Before bed | Sleep, muscle recovery |
| B complex | As labeled | Morning | Energy metabolism |
| Salt/electrolytes | 3-5g sodium | Throughout day | POTS support |
| Creatine | 5g | Any time | Muscle performance |
| Glycine | 3g | Before bed | Sleep quality |

### Daily Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Sleep | 8-10 hours | Consistent wake time |
| Water | 2-3L + electrolytes | Track intake |
| Protein | ~150g | Spread across meals |
| Walking | 6 mi / day | Cumulative |
| Cardio | 3-4x / week | 30-45 min sessions |
| Climbing | 2x / week | Technical sessions |
| Caffeine cutoff | 12pm | Protect sleep quality |

---

## Part 3: Integration - Energy-Aware Scheduling

### The Unified Vision

Cadence merges the task scheduling engine with the energy-based life system:

1. **Morning energy rating** (1-10) feeds into scheduler
2. **Available hours** dynamically adjust based on tier:
   - Tier 0: 0-2 hours productive work
   - Tier 1: 3-4 hours
   - Tier 2: 6-8 hours
   - Tier 3: 8-10 hours
3. **Task allocation** respects these dynamic constraints
4. **Context-switch penalties** scale with energy:
   - Lower energy = fewer switches tolerated
   - Higher energy = can handle more fragmentation
5. **Weekly planning** accounts for predicted energy patterns

### Algorithm Modification

```python
def energy_aware_schedule(
    tasks: List[Task],
    energy_rating: int,  # 1-10 from morning check-in
    base_config: ScheduleConfig
) -> ScheduleResult:
    # Determine tier
    if energy_rating <= 3:
        tier = 0
        productive_hours = 2
        max_switches = 2
    elif energy_rating <= 5:
        tier = 1
        productive_hours = 4
        max_switches = 3
    elif energy_rating <= 7:
        tier = 2
        productive_hours = 7
        max_switches = 4
    else:
        tier = 3
        productive_hours = 9
        max_switches = 5
    
    # Adjust config
    config = base_config.copy()
    config.available_hours[0].hours = productive_hours
    config.max_switches_per_day = max_switches
    
    # Scale context-switch penalty
    config.context_switch_penalty_minutes = 20 * (energy_rating / 10)
    
    # Generate schedule
    return generate_schedule(tasks, config)
```

### UI Flow

1. **Morning Check-in** (8:30am):
   - "How's your energy? (1-10)"
   - Select tier
   - Confirm non-negotiables checklist

2. **Schedule Generation**:
   - Backend generates schedule based on energy tier
   - Returns daily task list with time blocks

3. **Throughout Day**:
   - Mark tasks complete
   - Adjust energy if needed
   - Rebalance schedule dynamically

4. **Evening Review**:
   - Score each domain (0-2)
   - Log actual vs planned
   - Track patterns over time

### Data Model Extension

```typescript
interface DailyCheckIn {
  date: Date;
  energy_rating: number;        // 1-10
  tier: 0 | 1 | 2 | 3;
  non_negotiables_complete: boolean[];
  productive_hours_planned: number;
  productive_hours_actual: number;
  domain_scores: {
    spirit: number;
    body: number;
    mind: number;
    relations: number;
    work: number;
  };
  notes?: string;
}

interface EnergyPattern {
  average_rating: number;
  tier_distribution: {[tier: number]: number};  // Count of days per tier
  crash_days: number;
  trends: 'improving' | 'stable' | 'declining';
}
```

---

## Part 4: Implementation Roadmap

### Phase 1: Core Scheduler (Current → Complete)
**Status**: ✅ Basic HTML/JSX prototype exists

**Remaining:**
- [ ] Extract to proper React + TypeScript project
- [ ] Set up FastAPI backend with Pydantic models
- [ ] Implement DAG construction and cycle detection
- [ ] Implement priority scoring algorithm
- [ ] Implement topological sort
- [ ] Implement greedy bin packing
- [ ] Add context-switch penalty calculation
- [ ] Build REST API endpoints
- [ ] Connect frontend to backend
- [ ] Add task CRUD operations
- [ ] Add local storage persistence

**Deliverable**: Standalone scheduler with manual task input

### Phase 2: Energy Integration
**Tasks:**
- [ ] Build morning check-in UI
- [ ] Implement energy tier logic
- [ ] Integrate energy rating with schedule generation
- [ ] Add domain scoring system
- [ ] Build evening review UI
- [ ] Add energy pattern tracking
- [ ] Visualize energy trends over time

**Deliverable**: Energy-aware scheduling system

### Phase 3: Advanced Features
**Tasks:**
- [ ] Calendar view (week/month)
- [ ] Manual rebalance UI (drag-and-drop)
- [ ] Gantt chart visualization
- [ ] Dependency graph visualization
- [ ] Deadline risk alerts
- [ ] Task templates and recurring tasks
- [ ] Tags and filtering
- [ ] Search functionality

**Deliverable**: Full-featured scheduling application

### Phase 4: Integrations
**Tasks:**
- [ ] Linear API integration
- [ ] Jira API integration
- [ ] GitHub Issues integration
- [ ] Google Calendar sync
- [ ] Notion/Obsidian sync
- [ ] Mobile app (React Native)

**Deliverable**: Connected productivity ecosystem

### Phase 5: Team Coordination
**Tasks:**
- [ ] Multi-user support
- [ ] Team energy tracking
- [ ] Shared task pools
- [ ] Conflict detection
- [ ] Resource allocation
- [ ] Team scheduling views

**Deliverable**: Team productivity platform

### Phase 6: Link PM Integration
**Tasks:**
- [ ] Integrate with Link project management
- [ ] Sync tasks across systems
- [ ] Unified dashboard
- [ ] Cross-system reporting
- [ ] AI agent task allocation (Penguin)

**Deliverable**: Unified productivity suite

---

## Part 5: Technical Decisions & Trade-offs

### Architecture Decisions

**1. FastAPI + NetworkX (Backend)**
- **Pros**: Fast development, Python ecosystem, excellent graph algorithms
- **Cons**: Scaling beyond single machine requires Redis/Celery
- **Decision**: Start monolithic, migrate to microservices if needed

**2. React + TypeScript (Frontend)**
- **Pros**: Type safety, large ecosystem, fast development
- **Cons**: Bundle size, learning curve for non-React devs
- **Decision**: Industry standard, good long-term bet

**3. JSON Configuration Files**
- **Pros**: Human-readable, version-control friendly, easy to migrate
- **Cons**: No schema validation at file level, manual editing possible
- **Decision**: Start with JSON, migrate to DB if needed

**4. Local Storage (Client)**
- **Pros**: No backend dependency, fast, privacy-focused
- **Cons**: No sync across devices, data loss on browser clear
- **Decision**: Start local, add optional cloud sync later

### Algorithm Trade-offs

**Greedy Bin Packing vs. Optimal**
- **Greedy**: Fast (O(n log n)), good enough for most cases
- **Optimal**: NP-hard, exponential time
- **Decision**: Greedy with priority scoring - 90% of optimal at 1% of compute cost

**Context-Switch Penalty Model**
- **Linear**: Simple, but doesn't capture compounding cost
- **Exponential**: More accurate, but harder to tune
- **Decision**: Exponential (1.2^n) - captures real cognitive fatigue

### Energy System Trade-offs

**Subjective vs. Objective Energy Measurement**
- **Subjective**: Self-reported 1-10 scale
  - Pros: Captures felt experience, no hardware needed
  - Cons: Biased, inconsistent over time
- **Objective**: HRV, sleep tracking, wearable data
  - Pros: Quantitative, consistent
  - Cons: Expensive, misses subjective factors
- **Decision**: Start subjective, add objective integration later

**Fixed vs. Adaptive Tier Thresholds**
- **Fixed**: 1-3 = Tier 0, 4-5 = Tier 1, etc.
  - Pros: Simple, predictable
  - Cons: Doesn't account for individual baselines
- **Adaptive**: Calibrated to personal average
  - Pros: Personalized
  - Cons: Complex, requires data collection
- **Decision**: Start fixed, add adaptive mode after 30 days of data

---

## Part 6: Success Metrics

### Technical Metrics
- **Schedule Generation Time**: < 500ms for 100 tasks
- **API Response Time**: < 200ms p95
- **Frontend Render Time**: < 100ms first paint
- **Schedule Accuracy**: > 95% tasks meet dependencies
- **Deadline Hit Rate**: > 90% tasks completed before deadline

### User Metrics
- **Daily Active Users**: (for multi-user version)
- **Task Completion Rate**: Target > 80%
- **Schedule Adherence**: Target > 70% (allowing for energy fluctuations)
- **User Satisfaction**: NPS > 40

### Personal Metrics (for the primary user)
- **Weekly Score Average**: Target 6.5-7/10
- **Crash Days**: Target < 2/week
- **Productive Hours**: Match energy tier expectations
- **Task Backlog Growth**: Flat or declining
- **Stress Level**: Self-reported decrease

---

## Part 7: Open Questions

1. **Energy Calibration**: How long to establish personal baseline? (Proposed: 30 days)
2. **Task Granularity**: What's the minimum task size? (Proposed: 15 min)
3. **Schedule Horizon**: How many days to schedule ahead? (Proposed: 7 days, re-evaluate daily)
4. **Emergency Mode**: What happens when energy crashes mid-day? (Proposed: Auto-rebalance with reduced capacity)
5. **Weekend vs. Weekday**: Different schedules? (Proposed: Yes, configurable templates)
6. **Task Estimation Accuracy**: How to handle under/over-estimation? (Proposed: Track actual vs. estimated, auto-adjust)
7. **Multi-Day Tasks**: How to handle tasks spanning multiple days? (Proposed: Split into subtasks or use progress tracking)

---

## Part 8: Non-Goals (Explicitly Out of Scope)

1. **Time Tracking**: Not a time tracker (use Toggl/RescueTime for that)
2. **Project Management**: Not a full PM tool (that's Link's job)
3. **Team Communication**: Not a chat/collaboration tool
4. **Habit Tracking**: Limited to non-negotiables (use dedicated habit tracker for more)
5. **Health Monitoring**: Not a medical device (use Oura/Apple Watch for detailed metrics)
6. **AI Task Generation**: Not generating tasks from goals (that's Link's job)
7. **Calendar Integration**: Nice-to-have, not core (Google Calendar sync later)

---

## Conclusion

Cadence is a **human-first scheduling system** that acknowledges biological reality. It doesn't demand more productivity—it optimizes for **sustainable, energy-aware productivity**.

The two-part architecture (scheduling engine + energy system) creates a feedback loop:
1. Energy rating → informs schedule generation
2. Schedule execution → produces outcomes
3. Daily review → scores performance
4. Pattern tracking → improves future predictions

**Strategic Intent**: Validate scheduling logic as standalone product → battle-test → integrate into Link's project management system. The scheduler becomes a reusable module across personal task management, team coordination, and AI agent task allocation.

---

**References:**
- Scheduler Chat: https://claude.ai/chat/9f60ac79-0f6f-4164-8646-862a00331a0b
- Energy System Chat: https://claude.ai/chat/1ef95b7e-63cf-4929-b11d-f6338791378e