import React from 'react';
import { CheckSquare, Plus, Download, RefreshCw } from 'lucide-react';
import { StatusFilter } from '../types/todo';

interface HeaderProps {
  currentFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  onOpenNewTaskModal: () => void;
  onExportData: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentFilter,
  onFilterChange,
  onOpenNewTaskModal,
  onExportData,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single line text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <CheckSquare className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap hover:text-slate-800 transition-colors"
          >
            TaskFlow
          </a>
        </div>

        {/* Zone 2: 4 nav links with clean hover styling and active state */}
        <nav
          aria-label="Task views"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentFilter === 'all'
                ? 'text-slate-950 font-semibold border-b-2 border-slate-950 -mb-[2px]'
                : 'hover:text-slate-900'
            }`}
          >
            All Tasks
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('active')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentFilter === 'active'
                ? 'text-slate-950 font-semibold border-b-2 border-slate-950 -mb-[2px]'
                : 'hover:text-slate-900'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('completed')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentFilter === 'completed'
                ? 'text-slate-950 font-semibold border-b-2 border-slate-950 -mb-[2px]'
                : 'hover:text-slate-900'
            }`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('overdue')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentFilter === 'overdue'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-700 -mb-[2px]'
                : 'hover:text-slate-900'
            }`}
          >
            Overdue
          </button>
        </nav>

        {/* Zone 3: Actions & 1 primary action button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onExportData}
            title="Export tasks to JSON"
            aria-label="Export tasks to JSON"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={onResetData}
            title="Reset sample tasks"
            aria-label="Reset demo data"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xs whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
