import React, { useState } from 'react';
import { useAutomotive } from '../context/AutomotiveContext';
import { TaskCategory, TaskPriority, TaskItem } from '../types';
import {
  CheckCircle2,
  Plus,
  Search,
  MapPin,
  CheckSquare,
  Square,
  Trash2,
  Navigation,
  Mic,
  X,
} from 'lucide-react';
import { automotiveAudio } from '../utils/audioHaptics';

export const TaskManagementView: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskChecklist,
    peers,
    setCurrentView,
    setVoiceModalOpen,
    activeProfile,
  } = useAutomotive();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('cargo');
  const [newPriority, setNewPriority] = useState<TaskPriority>('high');
  const [newLocationName, setNewLocationName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.location && task.location.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesPri = selectedPriority === 'all' || task.priority === selectedPriority;

    return matchesSearch && matchesCat && matchesPri;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const checklistItems = newChecklistText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((text, idx) => ({ id: `c-${Date.now()}-${idx}`, text, done: false }));

    await addTask({
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'pending',
      notes: newNotes.trim() || undefined,
      location: newLocationName.trim()
        ? {
            name: newLocationName.trim(),
            lat: 37.7749 + (Math.random() - 0.5) * 0.05,
            lng: -122.4194 + (Math.random() - 0.5) * 0.05,
            distanceKm: Math.round((Math.random() * 12 + 1) * 10) / 10,
          }
        : undefined,
      checklist: checklistItems,
      assignedTo: `${activeProfile.name} (${activeProfile.role})`,
    });

    setNewTitle('');
    setNewNotes('');
    setNewLocationName('');
    setNewChecklistText('');
    setShowAddModal(false);
  };

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Tasks' },
    { id: 'cargo', label: 'Cargo' },
    { id: 'fleet', label: 'Fleet Ops' },
    { id: 'safety', label: 'Safety/ADAS' },
    { id: 'maintenance', label: 'EV Service' },
    { id: 'route', label: 'Route Stops' },
    { id: 'personal', label: 'Personal' },
  ];

  return (
    <div id="tasks-management-view" className="h-full p-2 sm:p-4 flex flex-col space-y-4 overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/50 p-4 sm:p-6 rounded-3xl border border-zinc-800 shrink-0 shadow-xl">
        <div>
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
            Fleet Operations Core
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-white flex items-center gap-3">
            <span>Mission & Task Queue</span>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-full">
              {tasks.filter((t) => t.status !== 'completed').length} PENDING
            </span>
          </h2>
        </div>

        {/* Real-time Connected Fleet Peers Chip */}
        <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-zinc-300 font-bold uppercase">
              {peers.length} Fleet Nodes Linked
            </span>
          </div>
        </div>

        {/* Action Controls: Add Task & Voice Command */}
        <div className="flex items-center gap-2">
          <button
            id="voice-add-task-quick-btn"
            onClick={() => {
              automotiveAudio.playChime('voice_activate');
              setVoiceModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition-all"
          >
            <Mic className="w-3.5 h-3.5 text-blue-400" />
            <span>Voice Add</span>
          </button>

          <button
            id="open-create-task-modal-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                automotiveAudio.playChime('button_tap');
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search missions..."
            className="w-full pl-9 pr-4 py-1.5 bg-zinc-900/80 text-white rounded-xl border border-zinc-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-zinc-700 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Matching Tasks</h3>
            <p className="text-xs text-zinc-500 mb-4">Create a new mission task using touch or voice.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              Create New Task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task.id}
                id={`task-card-${task.id}`}
                className={`rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                  isCompleted
                    ? 'bg-zinc-950/40 border-zinc-900 opacity-50'
                    : 'bg-zinc-900/50 border-zinc-800 shadow-xl'
                }`}
              >
                <div>
                  {/* Category & Priority Badge Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          task.priority === 'critical'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : task.priority === 'high'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/50">
                        {task.category}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Task Title */}
                  <h4
                    className={`text-base font-semibold mb-2 leading-snug ${
                      isCompleted ? 'line-through text-zinc-500' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </h4>

                  {/* Notes if any */}
                  {task.notes && (
                    <p className="text-xs text-zinc-400 mb-3 line-clamp-2 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800">
                      {task.notes}
                    </p>
                  )}

                  {/* Location Chip */}
                  {task.location && (
                    <div className="flex items-center justify-between bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800 mb-3">
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="text-xs font-medium text-zinc-300 truncate">
                          {task.location.name}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          automotiveAudio.playChime('nav_turn');
                          setCurrentView('nav');
                        }}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 shrink-0 flex items-center gap-1 pl-2"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Route</span>
                      </button>
                    </div>
                  )}

                  {/* Sub-checklist items */}
                  {task.checklist && task.checklist.length > 0 && (
                    <div className="space-y-1.5 mb-3 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                        Driver Checkpoints:
                      </span>
                      {task.checklist.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleTaskChecklist(task.id, item.id)}
                          className="flex items-center gap-2 cursor-pointer text-xs select-none"
                        >
                          {item.done ? (
                            <CheckSquare className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          )}
                          <span className={item.done ? 'line-through text-zinc-600' : 'text-zinc-300'}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Bottom */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between mt-2">
                  <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[140px]">
                    👤 {task.assignedTo.split(' ')[0]}
                  </span>

                  <button
                    onClick={() => {
                      updateTask(task.id, {
                        status: isCompleted ? 'pending' : 'completed',
                      });
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isCompleted
                        ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white'
                        : 'bg-green-500 hover:bg-green-400 text-zinc-950 shadow-md'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Reopen' : 'Complete'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">New Automotive Task</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Inspect High-Voltage Battery Pack at Bay 4"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="cargo">Cargo & Logistics</option>
                    <option value="fleet">Fleet Ops</option>
                    <option value="safety">Safety & ADAS</option>
                    <option value="maintenance">EV Maintenance</option>
                    <option value="route">Route Stop</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="critical">Critical Safety</option>
                    <option value="high">High Priority</option>
                    <option value="standard">Standard</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Destination / Waypoint
                </label>
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="e.g. BioMedical Center Dock Door 3"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Special instructions, gate codes, temperature limits..."
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Checklist Items (One per line)
                </label>
                <textarea
                  rows={2}
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="Verify bill of lading&#10;Scan barcode&#10;Confirm refrigeration"
                  className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  Save to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
