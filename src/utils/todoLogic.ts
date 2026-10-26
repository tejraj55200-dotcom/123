import { Category, Priority, SortOption, StatusFilter, Subtask, Todo, TodoStats } from '../types/todo';

export const PRIORITY_WEIGHTS: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const CATEGORIES: Category[] = [
  'Work',
  'Personal',
  'Projects',
  'Health',
  'Finance',
  'Errands',
];

export function isOverdue(todo: Todo, referenceDateStr?: string): boolean {
  if (todo.completed || !todo.dueDate) return false;
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const [year, month, day] = todo.dueDate.split('-').map(Number);
  const due = new Date(year, month - 1, day, 23, 59, 59, 999);
  return due.getTime() < refDate.getTime();
}

export function isDueToday(dueDate?: string, referenceDateStr?: string): boolean {
  if (!dueDate) return false;
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const [year, month, day] = dueDate.split('-').map(Number);
  return (
    ref.getFullYear() === year &&
    ref.getMonth() === month - 1 &&
    ref.getDate() === day
  );
}

export function formatDueDateLabel(dueDate?: string, referenceDateStr?: string): string {
  if (!dueDate) return 'No due date';
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const [year, month, day] = dueDate.split('-').map(Number);
  const due = new Date(year, month - 1, day);

  const startOfToday = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;

  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: due.getFullYear() !== ref.getFullYear() ? 'numeric' : undefined });
}

export function filterTodos(
  todos: Todo[],
  options: {
    status?: StatusFilter;
    category?: Category | 'All';
    priority?: Priority | 'All';
    search?: string;
    referenceDateStr?: string;
  }
): Todo[] {
  const { status = 'all', category = 'All', priority = 'All', search = '', referenceDateStr } = options;
  const cleanSearch = search.trim().toLowerCase();

  return todos.filter((todo) => {
    // Status filter
    if (status === 'active' && todo.completed) return false;
    if (status === 'completed' && !todo.completed) return false;
    if (status === 'overdue' && !isOverdue(todo, referenceDateStr)) return false;

    // Category filter
    if (category !== 'All' && todo.category !== category) return false;

    // Priority filter
    if (priority !== 'All' && todo.priority !== priority) return false;

    // Search query
    if (cleanSearch) {
      const titleMatch = todo.title.toLowerCase().includes(cleanSearch);
      const descMatch = (todo.description || '').toLowerCase().includes(cleanSearch);
      const subtaskMatch = todo.subtasks.some((st) => st.title.toLowerCase().includes(cleanSearch));
      if (!titleMatch && !descMatch && !subtaskMatch) return false;
    }

    return true;
  });
}

export function sortTodos(todos: Todo[], sortBy: SortOption): Todo[] {
  return [...todos].sort((a, b) => {
    // Pinned tasks always stay at the top
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    // Next priority: completed tasks naturally sink down
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (sortBy === 'priority') {
      const weightDiff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (sortBy === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }

    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }

    // Default 'createdAt' descending
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function calculateStats(todos: Todo[], referenceDateStr?: string): TodoStats {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const active = total - completed;
  const overdue = todos.filter((t) => isOverdue(t, referenceDateStr)).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    active,
    completed,
    overdue,
    completionRate,
  };
}

export function toggleTodoStatus(todos: Todo[], id: string): Todo[] {
  return todos.map((todo) => {
    if (todo.id !== id) return todo;
    const willBeCompleted = !todo.completed;
    return {
      ...todo,
      completed: willBeCompleted,
      completedAt: willBeCompleted ? new Date().toISOString() : undefined,
      // If parent todo is marked completed, mark all subtasks completed
      subtasks: willBeCompleted
        ? todo.subtasks.map((st) => ({ ...st, completed: true }))
        : todo.subtasks,
    };
  });
}

export function toggleSubtaskStatus(todos: Todo[], todoId: string, subtaskId: string): Todo[] {
  return todos.map((todo) => {
    if (todo.id !== todoId) return todo;
    const updatedSubtasks = todo.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
    return {
      ...todo,
      subtasks: updatedSubtasks,
      completed: allCompleted ? true : todo.completed,
      completedAt: allCompleted ? new Date().toISOString() : todo.completedAt,
    };
  });
}

export function addSubtaskToTodo(todos: Todo[], todoId: string, title: string): Todo[] {
  const trimmed = title.trim();
  if (!trimmed) return todos;

  return todos.map((todo) => {
    if (todo.id !== todoId) return todo;
    const newSubtask: Subtask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: trimmed,
      completed: false,
    };
    return {
      ...todo,
      completed: false,
      subtasks: [...todo.subtasks, newSubtask],
    };
  });
}

export function removeSubtaskFromTodo(todos: Todo[], todoId: string, subtaskId: string): Todo[] {
  return todos.map((todo) => {
    if (todo.id !== todoId) return todo;
    return {
      ...todo,
      subtasks: todo.subtasks.filter((st) => st.id !== subtaskId),
    };
  });
}

export function togglePinTodo(todos: Todo[], id: string): Todo[] {
  return todos.map((todo) =>
    todo.id === id ? { ...todo, pinned: !todo.pinned } : todo
  );
}

export function removeTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((todo) => todo.id !== id);
}

export function clearCompletedTodos(todos: Todo[]): Todo[] {
  return todos.filter((todo) => !todo.completed);
}

export const INITIAL_TODOS: Todo[] = [
  {
    id: 't-1',
    title: 'Review Q4 Architecture and Design Sprint proposal',
    description: 'Ensure cross-functional team alignment on modular frontend systems and API rate limits.',
    completed: false,
    priority: 'urgent',
    category: 'Work',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    pinned: true,
    subtasks: [
      { id: 'st-1-1', title: 'Synthesize engineering feedback', completed: true },
      { id: 'st-1-2', title: 'Verify bundle size thresholds', completed: false },
      { id: 'st-1-3', title: 'Submit sign-off document', completed: false },
    ],
  },
  {
    id: 't-2',
    title: 'Schedule quarterly dental checkup & prophylaxis',
    description: 'Call Dr. Martinez dental clinic to confirm Friday morning availability.',
    completed: false,
    priority: 'medium',
    category: 'Health',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    pinned: false,
    subtasks: [],
  },
  {
    id: 't-3',
    title: 'Audit monthly cloud hosting and SaaS subscriptions',
    description: 'Remove deprecated test databases and scale idle clusters to save operational costs.',
    completed: false,
    priority: 'high',
    category: 'Finance',
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // Overdue
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    pinned: false,
    subtasks: [
      { id: 'st-3-1', title: 'Export AWS and Cloud Run monthly ledger', completed: true },
      { id: 'st-3-2', title: 'Decommission 2 inactive staging clusters', completed: false },
    ],
  },
  {
    id: 't-4',
    title: 'Finalize presentation deck for weekly stakeholder sync',
    description: 'Include metric graphs on task completion velocity and sprint retrospective notes.',
    completed: true,
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    priority: 'high',
    category: 'Work',
    dueDate: new Date(Date.now()).toISOString().split('T')[0], // Today
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    pinned: false,
    subtasks: [
      { id: 'st-4-1', title: 'Collect slide comments from product lead', completed: true },
      { id: 'st-4-2', title: 'Export clean PDF summary', completed: true },
    ],
  },
  {
    id: 't-5',
    title: 'Replace furnace air filter & inspect smoke alarms',
    description: 'Check battery status and replace 20x25x1 MERV 11 filter in basement unit.',
    completed: false,
    priority: 'low',
    category: 'Errands',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    pinned: false,
    subtasks: [],
  },
];
