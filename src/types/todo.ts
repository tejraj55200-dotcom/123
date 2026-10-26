export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type Category = 'Work' | 'Personal' | 'Projects' | 'Health' | 'Finance' | 'Errands';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate?: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  completedAt?: string;
  subtasks: Subtask[];
  pinned?: boolean;
}

export type StatusFilter = 'all' | 'active' | 'completed' | 'overdue';
export type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'alphabetical';

export interface TodoStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  completionRate: number;
}
