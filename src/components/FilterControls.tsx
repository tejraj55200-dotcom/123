import React from 'react';
import { Search, X, ArrowUpDown, Trash2, CheckCircle2 } from 'lucide-react';
import { Category, Priority, SortOption, StatusFilter } from '../types/todo';
import { CATEGORIES } from '../utils/todoLogic';

interface FilterControlsProps {
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  category: Category | 'All';
  onCategoryChange: (category: Category | 'All') => void;
  priority: Priority | 'All';
  onPriorityChange: (priority: Priority | 'All') => void;
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
  completedCount: number;
  onClearCompleted: () => void;
  onMarkAllCompleted: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  status,
  onStatusChange,
  category,
  onCategoryChange,
  priority,
  onPriorityChange,
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  completedCount,
  onClearCompleted,
  onMarkAllCompleted,
}) => {
  return (
    <div className="space-y-3 mb-6">
      {/* Top row: Search input + Sorting + Batch actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, descriptions, or subtasks..."
            aria-label="Search tasks"
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search text"
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Sort & batch actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <label htmlFor="sort-select" className="sr-only">Sort tasks by</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortOption)}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="createdAt">Date Created</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="alphabetical">Title (A-Z)</option>
            </select>
          </div>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={onClearCompleted}
              aria-label="Clear completed tasks"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 bg-white border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Clear Done ({completedCount})</span>
              <span className="sm:hidden">Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={onMarkAllCompleted}
            aria-label="Mark all visible tasks completed"
            title="Mark visible tasks complete"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 hover:border-emerald-200 rounded-lg transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Mark All Done</span>
          </button>
        </div>
      </div>

      {/* Second row: Segmented Status filter + Category & Priority pills/buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Status segmented controls */}
        <div
          role="group"
          aria-label="Filter tasks by status"
          className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/60"
        >
          <button
            type="button"
            onClick={() => onStatusChange('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              status === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('active')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              status === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('completed')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              status === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('overdue')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              status === 'overdue'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overdue
          </button>
        </div>

        {/* Secondary filters: Category & Priority */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            <span className="text-slate-400">Category:</span>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as Category | 'All')}
              aria-label="Filter by category"
              className="bg-transparent text-xs text-slate-900 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            <span className="text-slate-400">Priority:</span>
            <select
              value={priority}
              onChange={(e) => onPriorityChange(e.target.value as Priority | 'All')}
              aria-label="Filter by priority"
              className="bg-transparent text-xs text-slate-900 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
