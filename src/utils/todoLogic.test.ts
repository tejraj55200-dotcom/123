import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isOverdue,
  isDueToday,
  formatDueDateLabel,
  filterTodos,
  sortTodos,
  calculateStats,
  toggleTodoStatus,
  toggleSubtaskStatus,
  addSubtaskToTodo,
  removeSubtaskFromTodo,
  togglePinTodo,
  clearCompletedTodos,
} from './todoLogic';
import { Todo } from '../types/todo';

const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Alpha task',
    completed: false,
    priority: 'low',
    category: 'Work',
    dueDate: '2026-10-25', // overdue relative to 2026-10-26
    createdAt: '2026-10-20T10:00:00Z',
    subtasks: [{ id: 'st1', title: 'sub 1', completed: false }],
  },
  {
    id: '2',
    title: 'Beta task',
    completed: true,
    priority: 'urgent',
    category: 'Health',
    dueDate: '2026-10-26', // today
    createdAt: '2026-10-22T10:00:00Z',
    subtasks: [{ id: 'st2', title: 'sub 2', completed: true }],
  },
  {
    id: '3',
    title: 'Gamma task',
    completed: false,
    priority: 'high',
    category: 'Finance',
    dueDate: '2026-10-27', // tomorrow
    createdAt: '2026-10-23T10:00:00Z',
    pinned: true,
    subtasks: [],
  },
];

test('isOverdue correctly detects past due dates for uncompleted items', () => {
  const ref = '2026-10-26T12:00:00Z';
  assert.equal(isOverdue(mockTodos[0], ref), true);
  // completed item is not overdue
  assert.equal(isOverdue(mockTodos[1], ref), false);
  // tomorrow's item is not overdue
  assert.equal(isOverdue(mockTodos[2], ref), false);
});

test('isDueToday checks matching dates', () => {
  const ref = '2026-10-26T12:00:00Z';
  assert.equal(isDueToday('2026-10-26', ref), true);
  assert.equal(isDueToday('2026-10-27', ref), false);
});

test('formatDueDateLabel handles Today, Tomorrow, and Overdue', () => {
  const ref = '2026-10-26T12:00:00Z';
  assert.equal(formatDueDateLabel('2026-10-26', ref), 'Today');
  assert.equal(formatDueDateLabel('2026-10-27', ref), 'Tomorrow');
  assert.equal(formatDueDateLabel('2026-10-25', ref), 'Yesterday');
  assert.equal(formatDueDateLabel('2026-10-20', ref), '6d overdue');
  assert.equal(formatDueDateLabel(undefined, ref), 'No due date');
});

test('calculateStats aggregates totals and rates properly', () => {
  const ref = '2026-10-26T12:00:00Z';
  const stats = calculateStats(mockTodos, ref);
  assert.equal(stats.total, 3);
  assert.equal(stats.completed, 1);
  assert.equal(stats.active, 2);
  assert.equal(stats.overdue, 1);
  assert.equal(stats.completionRate, 33);
});

test('filterTodos filters by status, category, priority, and text query', () => {
  const ref = '2026-10-26T12:00:00Z';
  
  // Status
  const active = filterTodos(mockTodos, { status: 'active', referenceDateStr: ref });
  assert.equal(active.length, 2);

  const completed = filterTodos(mockTodos, { status: 'completed', referenceDateStr: ref });
  assert.equal(completed.length, 1);
  assert.equal(completed[0].id, '2');

  const overdue = filterTodos(mockTodos, { status: 'overdue', referenceDateStr: ref });
  assert.equal(overdue.length, 1);
  assert.equal(overdue[0].id, '1');

  // Category
  const health = filterTodos(mockTodos, { category: 'Health' });
  assert.equal(health.length, 1);
  assert.equal(health[0].id, '2');

  // Priority
  const urgent = filterTodos(mockTodos, { priority: 'urgent' });
  assert.equal(urgent.length, 1);
  assert.equal(urgent[0].id, '2');

  // Search query
  const searchBeta = filterTodos(mockTodos, { search: 'beta' });
  assert.equal(searchBeta.length, 1);
  assert.equal(searchBeta[0].title, 'Beta task');
});

test('sortTodos prioritizes pinned tasks, then uncompleted, then sort criteria', () => {
  // Pinned task should come first regardless of sort option
  const sortedByDue = sortTodos(mockTodos, 'dueDate');
  assert.equal(sortedByDue[0].pinned, true);
  assert.equal(sortedByDue[0].id, '3');

  const sortedAlpha = sortTodos(mockTodos, 'alphabetical');
  assert.equal(sortedAlpha[0].id, '3'); // pinned first
});

test('toggleTodoStatus updates completion status and syncs subtasks when completing', () => {
  const updated = toggleTodoStatus(mockTodos, '1');
  const task1 = updated.find((t) => t.id === '1')!;
  assert.equal(task1.completed, true);
  assert.equal(task1.subtasks[0].completed, true);

  // Untoggle
  const untoggled = toggleTodoStatus(updated, '1');
  const task1Untoggled = untoggled.find((t) => t.id === '1')!;
  assert.equal(task1Untoggled.completed, false);
});

test('toggleSubtaskStatus marks parent completed if all subtasks completed', () => {
  const updated = toggleSubtaskStatus(mockTodos, '1', 'st1');
  const task1 = updated.find((t) => t.id === '1')!;
  assert.equal(task1.subtasks[0].completed, true);
  assert.equal(task1.completed, true);
});

test('addSubtaskToTodo and removeSubtaskFromTodo work cleanly', () => {
  const withSub = addSubtaskToTodo(mockTodos, '3', 'New subtask item');
  const task3 = withSub.find((t) => t.id === '3')!;
  assert.equal(task3.subtasks.length, 1);
  assert.equal(task3.subtasks[0].title, 'New subtask item');

  const subId = task3.subtasks[0].id;
  const removed = removeSubtaskFromTodo(withSub, '3', subId);
  const task3After = removed.find((t) => t.id === '3')!;
  assert.equal(task3After.subtasks.length, 0);
});

test('togglePinTodo toggles pinned boolean', () => {
  const pinned = togglePinTodo(mockTodos, '1');
  assert.equal(pinned.find((t) => t.id === '1')!.pinned, true);
});

test('clearCompletedTodos removes completed tasks', () => {
  const cleaned = clearCompletedTodos(mockTodos);
  assert.equal(cleaned.length, 2);
  assert.equal(cleaned.every((t) => !t.completed), true);
});
