import { useState, useEffect, useMemo } from 'react';
import { Category, Priority, SortOption, StatusFilter, Todo } from './types/todo';
import {
  INITIAL_TODOS,
  addSubtaskToTodo,
  calculateStats,
  clearCompletedTodos,
  filterTodos,
  removeSubtaskFromTodo,
  removeTodo,
  sortTodos,
  togglePinTodo,
  toggleSubtaskStatus,
  toggleTodoStatus,
} from './utils/todoLogic';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { QuickAddBar } from './components/QuickAddBar';
import { FilterControls } from './components/FilterControls';
import { TodoItem } from './components/TodoItem';
import { TaskModal } from './components/TaskModal';
import { EmptyState } from './components/EmptyState';
import { CheckCircle2, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'taskflow_todos_v1';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_TODOS;
  });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Undo notification state
  const [recentlyDeleted, setRecentlyDeleted] = useState<{ todo: Todo; index: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // ignore storage error
    }
  }, [todos]);

  // Derived stats
  const stats = useMemo(() => calculateStats(todos), [todos]);

  // Filtered & sorted task list
  const filteredTodos = useMemo(() => {
    const list = filterTodos(todos, {
      status: statusFilter,
      category: categoryFilter,
      priority: priorityFilter,
      search: searchQuery,
    });
    return sortTodos(list, sortBy);
  }, [todos, statusFilter, categoryFilter, priorityFilter, searchQuery, sortBy]);

  // Handlers
  const handleToggleTodo = (id: string) => {
    setTodos((prev) => toggleTodoStatus(prev, id));
  };

  const handleTogglePin = (id: string) => {
    setTodos((prev) => togglePinTodo(prev, id));
  };

  const handleDeleteTodo = (id: string) => {
    const targetIndex = todos.findIndex((t) => t.id === id);
    const target = todos[targetIndex];
    if (target) {
      setRecentlyDeleted({ todo: target, index: targetIndex });
      setToastMessage(`Deleted "${target.title}"`);
      setTodos((prev) => removeTodo(prev, id));
    }
  };

  const handleUndoDelete = () => {
    if (recentlyDeleted) {
      setTodos((prev) => {
        const next = [...prev];
        next.splice(recentlyDeleted.index, 0, recentlyDeleted.todo);
        return next;
      });
      setToastMessage(null);
      setRecentlyDeleted(null);
    }
  };

  const handleToggleSubtask = (todoId: string, subtaskId: string) => {
    setTodos((prev) => toggleSubtaskStatus(prev, todoId, subtaskId));
  };

  const handleAddSubtask = (todoId: string, title: string) => {
    setTodos((prev) => addSubtaskToTodo(prev, todoId, title));
  };

  const handleRemoveSubtask = (todoId: string, subtaskId: string) => {
    setTodos((prev) => removeSubtaskFromTodo(prev, todoId, subtaskId));
  };

  const handleQuickAdd = (newTodoData: Omit<Todo, 'id' | 'createdAt' | 'subtasks'> & { subtasks?: string[] }) => {
    const created: Todo = {
      ...newTodoData,
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      subtasks: (newTodoData.subtasks || []).map((title, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        title,
        completed: false,
      })),
    };
    setTodos((prev) => [created, ...prev]);
    setToastMessage(`Task added successfully`);
    setTimeout(() => setToastMessage((msg) => (msg === 'Task added successfully' ? null : msg)), 3000);
  };

  const handleSaveModal = (taskData: Omit<Todo, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Edit existing
      setTodos((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? {
                ...t,
                ...taskData,
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority,
                category: taskData.category,
                dueDate: taskData.dueDate,
                pinned: taskData.pinned,
                subtasks: taskData.subtasks,
              }
            : t
        )
      );
      setToastMessage('Task updated');
    } else {
      // Create new
      const created: Todo = {
        ...taskData,
        id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      setTodos((prev) => [created, ...prev]);
      setToastMessage('Task created');
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearCompleted = () => {
    setTodos((prev) => clearCompletedTodos(prev));
    setToastMessage('Cleared completed tasks');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMarkAllCompleted = () => {
    setTodos((prev) =>
      prev.map((t) => ({
        ...t,
        completed: true,
        completedAt: t.completedAt || new Date().toISOString(),
        subtasks: t.subtasks.map((st) => ({ ...st, completed: true })),
      }))
    );
    setToastMessage('All tasks marked as completed');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(todos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `taskflow-export-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToastMessage('Tasks exported to JSON');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetDemo = () => {
    setTodos(INITIAL_TODOS);
    setToastMessage('Loaded default sample tasks');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setSearchQuery('');
  };

  const isFiltered =
    statusFilter !== 'all' ||
    categoryFilter !== 'All' ||
    priorityFilter !== 'All' ||
    Boolean(searchQuery.trim());

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar Header */}
      <Header
        currentFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onOpenNewTaskModal={() => {
          setEditingTodo(null);
          setIsModalOpen(true);
        }}
        onExportData={handleExportData}
        onResetData={handleResetDemo}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Page Title & Context Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Personal Workspace
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organize priorities, manage checklist subtasks, and track completion progress.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            {stats.completed} of {stats.total} completed ({stats.completionRate}%)
          </div>
        </div>

        {/* Progress Metrics Strip */}
        <StatsBar
          stats={stats}
          onFilterChange={setStatusFilter}
          activeFilter={statusFilter}
        />

        {/* Inline Quick Add Form */}
        <QuickAddBar onAddTodo={handleQuickAdd} />

        {/* Filter Controls & Search */}
        <FilterControls
          status={statusFilter}
          onStatusChange={setStatusFilter}
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          priority={priorityFilter}
          onPriorityChange={setPriorityFilter}
          search={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          completedCount={stats.completed}
          onClearCompleted={handleClearCompleted}
          onMarkAllCompleted={handleMarkAllCompleted}
        />

        {/* Task List or Empty State */}
        {filteredTodos.length > 0 ? (
          <div className="space-y-3" role="feed" aria-label="Tasks list">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleTodo={handleToggleTodo}
                onTogglePin={handleTogglePin}
                onDeleteTodo={handleDeleteTodo}
                onEditTodo={(t) => {
                  setEditingTodo(t);
                  setIsModalOpen(true);
                }}
                onToggleSubtask={handleToggleSubtask}
                onAddSubtask={handleAddSubtask}
                onRemoveSubtask={handleRemoveSubtask}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            isFiltered={isFiltered}
            onClearFilters={handleResetFilters}
            onAddNewTask={() => {
              setEditingTodo(null);
              setIsModalOpen(true);
            }}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTodo(null);
        }}
        onSave={handleSaveModal}
        initialTodo={editingTodo}
      />

      {/* Toast Notification with Undo */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-xs border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="font-medium">{toastMessage}</span>
          {recentlyDeleted && (
            <button
              type="button"
              onClick={handleUndoDelete}
              className="ml-2 inline-flex items-center gap-1 font-semibold text-emerald-300 hover:text-emerald-200 underline underline-offset-2 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>Undo</span>
            </button>
          )}
        </aside>
      )}

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TaskFlow Workspace · Local Storage Synced</span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>{stats.active} pending tasks</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleResetDemo}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Reset sample data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
