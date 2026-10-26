import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Pin,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
} from 'lucide-react';
import { Priority, Todo } from '../types/todo';
import { formatDueDateLabel, isOverdue } from '../utils/todoLogic';

interface TodoItemProps {
  todo: Todo;
  onToggleTodo: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo: (todo: Todo) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onAddSubtask: (todoId: string, title: string) => void;
  onRemoveSubtask: (todoId: string, subtaskId: string) => void;
}

const PRIORITY_STYLES: Record<Priority, { text: string; label: string }> = {
  urgent: { text: 'text-red-700', label: 'Urgent' },
  high: { text: 'text-amber-700', label: 'High' },
  medium: { text: 'text-blue-700', label: 'Medium' },
  low: { text: 'text-slate-500', label: 'Low' },
};

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleTodo,
  onTogglePin,
  onDeleteTodo,
  onEditTodo,
  onToggleSubtask,
  onAddSubtask,
  onRemoveSubtask,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const overdue = isOverdue(todo);
  const dueLabel = formatDueDateLabel(todo.dueDate);
  const subtasksCompleted = todo.subtasks.filter((st) => st.completed).length;
  const hasSubtasks = todo.subtasks.length > 0;

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(todo.id, newSubtaskTitle);
    setNewSubtaskTitle('');
  };

  return (
    <article
      aria-labelledby={`todo-title-${todo.id}`}
      className={`group bg-white border rounded-xl p-4 transition-all shadow-xs ${
        todo.completed
          ? 'border-slate-200/80 bg-slate-50/60'
          : todo.pinned
          ? 'border-slate-300 ring-1 ring-slate-200 bg-white'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={todo.completed}
          aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
          onClick={() => onToggleTodo(todo.id)}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
            todo.completed
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 hover:border-slate-500 bg-white'
          }`}
        >
          {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />}
        </button>

        {/* Center Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              id={`todo-title-${todo.id}`}
              className={`text-sm font-medium leading-snug transition-all ${
                todo.completed
                  ? 'text-slate-400 line-through decoration-slate-300'
                  : 'text-slate-900'
              }`}
            >
              {todo.title}
            </h3>

            {todo.pinned && (
              <span className="text-[11px] font-medium text-slate-500 inline-flex items-center gap-1">
                <Pin className="w-3 h-3 text-slate-700 fill-slate-700" aria-hidden="true" />
                <span>Pinned</span>
              </span>
            )}
          </div>

          {/* Description if present */}
          {todo.description && (
            <p
              className={`mt-1 text-xs leading-relaxed ${
                todo.completed ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {todo.description}
            </p>
          )}

          {/* Clean Unboxed Metadata with Typographic Separators (Zero-Pill Discipline) */}
          <div className="mt-2.5 flex items-center flex-wrap gap-2 text-xs text-slate-500">
            {/* Category */}
            <span className="font-medium text-slate-700">{todo.category}</span>

            <span aria-hidden="true" className="text-slate-300">·</span>

            {/* Priority */}
            <span className={`font-medium ${PRIORITY_STYLES[todo.priority].text}`}>
              {PRIORITY_STYLES[todo.priority].label} Priority
            </span>

            {/* Due date */}
            {todo.dueDate && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span
                  className={`inline-flex items-center gap-1 font-mono text-[11px] tabular-nums ${
                    overdue
                      ? 'text-red-700 font-semibold'
                      : 'text-slate-600'
                  }`}
                >
                  {overdue ? (
                    <AlertCircle className="w-3 h-3 text-red-600" aria-hidden="true" />
                  ) : (
                    <Calendar className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  )}
                  <span>{dueLabel}</span>
                </span>
              </>
            )}

            {/* Subtasks summary trigger */}
            {hasSubtasks && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  aria-expanded={showSubtasks}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <span className="font-mono tabular-nums">
                    {subtasksCompleted}/{todo.subtasks.length} subtasks
                  </span>
                  {showSubtasks ? (
                    <ChevronDown className="w-3 h-3 text-slate-500" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-500" aria-hidden="true" />
                  )}
                </button>
              </>
            )}

            {/* If no subtasks yet, affordance to add one */}
            {!hasSubtasks && !todo.completed && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setShowSubtasks(true)}
                  className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  + Add subtask
                </button>
              </>
            )}
          </div>

          {/* Subtasks Expandable Section */}
          {showSubtasks && (
            <div className="mt-3 pt-3 border-t border-slate-100 pl-2 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Subtasks
              </div>

              {todo.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 group/sub py-0.5"
                >
                  <label className="flex items-center gap-2 cursor-pointer text-xs flex-1">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => onToggleSubtask(todo.id, st.id)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span
                      className={
                        st.completed
                          ? 'text-slate-400 line-through'
                          : 'text-slate-700'
                      }
                    >
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onRemoveSubtask(todo.id, st.id)}
                    aria-label={`Remove subtask "${st.title}"`}
                    className="opacity-0 group-hover/sub:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
              ))}

              {/* Add subtask inline form */}
              <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a subtask..."
                  aria-label={`Add subtask to ${todo.title}`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-400"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded disabled:opacity-40 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" aria-hidden="true" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Action Icons (Pin, Edit, Delete) */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onTogglePin(todo.id)}
            title={todo.pinned ? 'Unpin task' : 'Pin task to top'}
            aria-label={todo.pinned ? 'Unpin task' : 'Pin task to top'}
            className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors ${
              todo.pinned ? 'text-slate-900 bg-slate-100' : 'text-slate-400'
            }`}
          >
            <Pin className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onEditTodo(todo)}
            title="Edit task details"
            aria-label={`Edit task "${todo.title}"`}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteTodo(todo.id)}
            title="Delete task"
            aria-label={`Delete task "${todo.title}"`}
            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};
