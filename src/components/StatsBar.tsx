import React from 'react';
import { TodoStats } from '../types/todo';

interface StatsBarProps {
  stats: TodoStats;
  onFilterChange: (status: 'all' | 'active' | 'completed' | 'overdue') => void;
  activeFilter: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, onFilterChange, activeFilter }) => {
  return (
    <section aria-label="Task progress metrics" className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Tasks */}
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={`text-left p-3.5 bg-white border rounded-xl transition-all ${
            activeFilter === 'all'
              ? 'border-slate-900 ring-1 ring-slate-900'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">Total Tasks</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {stats.total}
            </span>
            <span className="text-xs text-slate-400">All registered</span>
          </div>
        </button>

        {/* Active Tasks */}
        <button
          type="button"
          onClick={() => onFilterChange('active')}
          className={`text-left p-3.5 bg-white border rounded-xl transition-all ${
            activeFilter === 'active'
              ? 'border-slate-900 ring-1 ring-slate-900'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">In Progress</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {stats.active}
            </span>
            <span className="text-xs text-slate-400">Pending</span>
          </div>
        </button>

        {/* Completed Tasks */}
        <button
          type="button"
          onClick={() => onFilterChange('completed')}
          className={`text-left p-3.5 bg-white border rounded-xl transition-all ${
            activeFilter === 'completed'
              ? 'border-slate-900 ring-1 ring-slate-900'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">Completed</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 font-mono tabular-nums">
              {stats.completed}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {stats.completionRate}%
            </span>
          </div>
        </button>

        {/* Overdue Tasks */}
        <button
          type="button"
          onClick={() => onFilterChange('overdue')}
          className={`text-left p-3.5 bg-white border rounded-xl transition-all ${
            activeFilter === 'overdue'
              ? 'border-slate-900 ring-1 ring-slate-900'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">Overdue</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span
              className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${
                stats.overdue > 0 ? 'text-amber-700' : 'text-slate-400'
              }`}
            >
              {stats.overdue}
            </span>
            <span className="text-xs text-slate-400">Needs attention</span>
          </div>
        </button>
      </div>

      {/* Subtle completion progress track */}
      <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
        <div className="text-xs font-medium text-slate-600 whitespace-nowrap">
          Completion Track
        </div>
        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${stats.completionRate}%` }}
            role="progressbar"
            aria-valuenow={stats.completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall completion progress"
          />
        </div>
        <div className="text-xs font-mono font-medium text-slate-700 tabular-nums whitespace-nowrap">
          {stats.completed}/{stats.total} ({stats.completionRate}%)
        </div>
      </div>
    </section>
  );
};
