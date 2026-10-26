import React, { useState } from 'react';
import { Plus, Calendar, Flag, Tag, ArrowRight } from 'lucide-react';
import { Category, Priority, Todo } from '../types/todo';
import { CATEGORIES } from '../utils/todoLogic';

interface QuickAddBarProps {
  onAddTodo: (newTodo: Omit<Todo, 'id' | 'createdAt' | 'subtasks'> & { subtasks?: string[] }) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('Work');
  const [dueDate, setDueDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    onAddTodo({
      title: cleanTitle,
      priority,
      category,
      dueDate: dueDate || undefined,
      completed: false,
    });

    setTitle('');
    setDueDate('');
    // keep category and priority for fast successive entries, but collapse if desired
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs mb-6 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 transition-all"
    >
      <div className="flex items-center gap-2">
        <label htmlFor="quick-task-title" className="sr-only">
          Task title
        </label>
        <div className="text-slate-400 pl-1">
          <Plus className="w-5 h-5" aria-hidden="true" />
        </div>
        <input
          id="quick-task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Add a new task... (Press Enter to save)"
          className="flex-1 bg-transparent border-0 py-1.5 px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Add</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          {/* Priority Select */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <Flag className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <label htmlFor="quick-priority" className="sr-only">Priority</label>
            <select
              id="quick-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs text-slate-700 hover:border-slate-300 focus:outline-hidden"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Category Select */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <Tag className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <label htmlFor="quick-category" className="sr-only">Category</label>
            <select
              id="quick-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs text-slate-700 hover:border-slate-300 focus:outline-hidden"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date Input */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <label htmlFor="quick-due-date" className="sr-only">Due Date</label>
            <input
              id="quick-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs text-slate-700 hover:border-slate-300 focus:outline-hidden"
            />
          </div>

          <div className="ml-auto text-[11px] text-slate-400 hidden sm:block">
            Tip: Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Enter</kbd> to add
          </div>
        </div>
      )}
    </form>
  );
};
