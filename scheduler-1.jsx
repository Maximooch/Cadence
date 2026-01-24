const { useState, useEffect } = window.React;

const DEFAULT_TASKS = [
  { id: 1, name: 'Holy Study (Orthodox + Bible)', duration: 3, color: '#7c3aed' },
  { id: 2, name: 'Wrap up SipScout', duration: 3, color: '#2563eb' },
  { id: 3, name: 'Penguin Context', duration: 0.75, color: '#0891b2' },
  { id: 4, name: 'roadmap.md (Company + Penguin + Link)', duration: 1, color: '#059669' },
  { id: 5, name: 'features.md (Company + Penguin + Link)', duration: 1, color: '#65a30d' },
  { id: 6, name: 'Penguin Kanban Tracks', duration: 1.5, color: '#ca8a04' },
  { id: 7, name: 'Link brainstorming.md', duration: 2, color: '#ea580c' },
  { id: 8, name: 'FE/Stack Exploration', duration: 0.5, color: '#dc2626' },
];

const COLORS = ['#7c3aed', '#2563eb', '#0891b2', '#059669', '#65a30d', '#ca8a04', '#ea580c', '#dc2626', '#db2777', '#4f46e5'];

const formatHour = (hour) => {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const period = h >= 12 ? 'pm' : 'am';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${displayHour}${period}` : `${displayHour}:${m.toString().padStart(2, '0')}${period}`;
};

const format24Hour = (hour) => {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return m === 0 ? `${h.toString().padStart(2, '0')}00` : `${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`;
};

function SchedulerApp() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('scheduler-tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });
  const [wakeTime, setWakeTime] = useState(() => {
    const saved = localStorage.getItem('scheduler-wakeTime');
    return saved ? parseFloat(saved) : 8.5;
  });
  const [sleepTime, setSleepTime] = useState(() => {
    const saved = localStorage.getItem('scheduler-sleepTime');
    return saved ? parseFloat(saved) : 23;
  });
  const [editingTask, setEditingTask] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', duration: 1, color: COLORS[0] });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('scheduler-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('scheduler-wakeTime', wakeTime);
  }, [wakeTime]);

  useEffect(() => {
    localStorage.setItem('scheduler-sleepTime', sleepTime);
  }, [sleepTime]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const totalHours = sleepTime - wakeTime;
  const schedule = [];
  let currentTimeCalc = wakeTime;
  
  tasks.forEach((task) => {
    schedule.push({
      ...task,
      startTime: currentTimeCalc,
      endTime: currentTimeCalc + task.duration,
    });
    currentTimeCalc += task.duration;
  });
  
  const totalTaskTime = tasks.reduce((sum, t) => sum + t.duration, 0);
  const remainingTime = totalHours - totalTaskTime;
  
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
  const currentProgress = Math.max(0, Math.min(100, ((currentHour - wakeTime) / totalHours) * 100));

  const handleAddTask = () => {
    if (newTask.name && newTask.duration > 0) {
      setTasks([...tasks, { ...newTask, id: Date.now() }]);
      setNewTask({ name: '', duration: 1, color: COLORS[0] });
      setShowAddForm(false);
    }
  };

  const handleUpdateTask = (id, updatedTask) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updatedTask } : t));
    setEditingTask(null);
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleMoveTask = (id, direction) => {
    const index = tasks.findIndex(t => t.id === id);
    if (direction === 'up' && index > 0) {
      const newTasks = [...tasks];
      [newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]];
      setTasks(newTasks);
    } else if (direction === 'down' && index < tasks.length - 1) {
      const newTasks = [...tasks];
      [newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]];
      setTasks(newTasks);
    }
  };

  const resetToDefault = () => {
    if (confirm('Reset to default schedule?')) {
      setTasks(DEFAULT_TASKS);
      setWakeTime(8.5);
      setSleepTime(23);
    }
  };

  const morningHours = Array.from({ length: 12 }, (_, i) => i);
  const afternoonHours = Array.from({ length: 12 }, (_, i) => i + 12);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Daily Scheduler</h1>
            <p className="text-gray-400">
              {formatHour(wakeTime)} wake → {formatHour(sleepTime)} sleep • {totalHours}hr available • {totalTaskTime}hr scheduled • {remainingTime > 0 ? `${remainingTime.toFixed(1)}hr buffer` : `${Math.abs(remainingTime).toFixed(1)}h over`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
            >
              {showAddForm ? 'Cancel' : '+ Add Task'}
            </button>
            <button
              onClick={resetToDefault}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
            >
              Reset
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">Add New Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Task name"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                step="0.25"
                min="0.25"
                placeholder="Duration (hours)"
                value={newTask.duration}
                onChange={(e) => setNewTask({ ...newTask, duration: parseFloat(e.target.value) || 0 })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newTask.color}
                onChange={(e) => setNewTask({ ...newTask, color: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COLORS.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
              >
                Add Task
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <label className="block text-sm font-medium text-gray-400 mb-2">Wake Time</label>
            <input
              type="time"
              value={`${Math.floor(wakeTime).toString().padStart(2, '0')}:${Math.round((wakeTime % 1) * 60).toString().padStart(2, '0')}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number);
                setWakeTime(h + m / 60);
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <label className="block text-sm font-medium text-gray-400 mb-2">Sleep Time</label>
            <input
              type="time"
              value={`${Math.floor(sleepTime).toString().padStart(2, '0')}:${Math.round((sleepTime % 1) * 60).toString().padStart(2, '0')}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number);
                setSleepTime(h + m / 60);
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <label className="block text-sm font-medium text-gray-400 mb-2">Current Time</label>
            <div className="text-2xl font-bold text-blue-400">
              {formatHour(currentHour)}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Timeline</h2>
          <div className="relative bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
              {Array.from({ length: Math.ceil(totalHours) + 1 }, (_, i) => {
                const hour = wakeTime + i;
                return (
                  <span key={i} className="w-0 text-center" style={{ marginLeft: i === 0 ? 0 : -10 }}>
                    {formatHour(hour)}
                  </span>
                );
              })}
            </div>
            
            <div className="relative h-14 bg-gray-700 rounded overflow-hidden">
              {schedule.map((block) => {
                const leftPercent = ((block.startTime - wakeTime) / totalHours) * 100;
                const widthPercent = (block.duration / totalHours) * 100;
                return (
                  <div
                    key={block.id}
                    className="absolute h-full flex items-center justify-center text-xs font-medium overflow-hidden cursor-pointer hover:opacity-80 transition"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: block.color,
                    }}
                    onClick={() => setEditingTask(block)}
                    title={`${block.name}: ${formatHour(block.startTime)} - ${formatHour(block.endTime)}`}
                  >
                    <span className="truncate px-1">{block.name}</span>
                  </div>
                );
              })}
              
              {currentHour >= wakeTime && currentHour <= sleepTime && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                  style={{ left: `${currentProgress}%` }}
                >
                  <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Tasks</h2>
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-750 border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400 w-12">#</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Task</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Start</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">End</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((block, idx) => (
                  <tr 
                    key={block.id} 
                    className={`border-b border-gray-700 ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'} ${currentHour >= block.startTime && currentHour < block.endTime ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-80 transition"
                        style={{ backgroundColor: block.color }}
                        onClick={() => setEditingTask(block)}
                      >
                        {idx + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium cursor-pointer hover:text-blue-400 transition" onClick={() => setEditingTask(block)}>
                      {block.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-gray-300">{formatHour(block.startTime)}</td>
                    <td className="py-3 px-4 font-mono text-sm text-gray-300">{formatHour(block.endTime)}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {block.duration >= 1 
                        ? `${Math.floor(block.duration)}h ${block.duration % 1 ? Math.round((block.duration % 1) * 60) + 'm' : ''}`
                        : `${Math.round(block.duration * 60)}m`
                      }
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMoveTask(block.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveTask(block.id, 'down')}
                          disabled={idx === tasks.length - 1}
                          className="p-1 hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => setEditingTask(block)}
                          className="p-1 hover:bg-blue-600 rounded transition"
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteTask(block.id)}
                          className="p-1 hover:bg-red-600 rounded transition"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{totalHours}h</div>
            <div className="text-sm text-gray-400">Available</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{totalTaskTime}h</div>
            <div className="text-sm text-gray-400">Scheduled</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className={`text-2xl font-bold ${remainingTime >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
              {remainingTime >= 0 ? `${remainingTime.toFixed(1)}h` : `-${Math.abs(remainingTime).toFixed(1)}h`}
            </div>
            <div className="text-sm text-gray-400">{remainingTime >= 0 ? 'Buffer' : 'Over'}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">{tasks.length}</div>
            <div className="text-sm text-gray-400">Tasks</div>
          </div>
        </div>

        {remainingTime < 0 && (
          <div className="mt-6 bg-red-900/30 border border-red-700 rounded-lg p-4">
            <div className="font-semibold text-red-400">⚠️ Schedule Overrun</div>
            <div className="text-sm text-red-300 mt-1">
              You're {Math.abs(remainingTime).toFixed(1)} hours over. End time: {formatHour(schedule[schedule.length - 1]?.endTime || sleepTime)}.
            </div>
          </div>
        )}

        {editingTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingTask(null)}>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Task Name</label>
                  <input
                    type="text"
                    value={editingTask.name}
                    onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Duration (hours)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={editingTask.duration}
                    onChange={(e) => setEditingTask({ ...editingTask, duration: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setEditingTask({ ...editingTask, color })}
                        className={`w-8 h-8 rounded ${editingTask.color === color ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateTask(editingTask.id, editingTask)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleDeleteTask(editingTask.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SchedulerApp />);
