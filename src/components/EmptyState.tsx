import React from 'react';
import { ClipboardList, Plus, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  onClearFilters: () => void;
  onAddNewTask: () => void;
  onResetDemo: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered,
  onClearFilters,
  onAddNewTask,
  onResetDemo,
}) => {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center my-6">
      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
        <ClipboardList className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-1">
        {isFiltered ? 'No matching tasks found' : 'Your task list is clear'}
      </h3>

      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
        {isFiltered
          ? 'No tasks correspond with your active status, category, priority, or search term.'
          : 'You currently have no tasks logged. Create a new task or load initial sample data to get started.'}
      </p>

      <div className="flex items-center justify-center gap-3">
        {isFiltered ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Filters</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onAddNewTask}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add Your First Task</span>
            </button>
            <button
              type="button"
              onClick={onResetDemo}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Load Sample Tasks</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
