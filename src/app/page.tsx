'use client';

import { useState, useEffect, useCallback } from 'react';

interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchTodos = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('Failed to fetch todos');
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create todo');
      }

      const newTodo = await res.json();
      setTodos((prev) => [newTodo, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCompleted = async (todo: Todo) => {
    try {
      setError(null);
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (!res.ok) throw new Error('Failed to update todo');

      const updatedTodo = await res.json();
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? updatedTodo : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      setError(null);
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete todo');
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="container">
      <h1>✅ Todo App</h1>

      {/* Add Form */}
      <div className="add-form">
        <h2>Add New Todo</h2>
        <form onSubmit={handleAddTodo}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              maxLength={500}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              maxLength={2000}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting || !title.trim()}>
            {submitting ? '⏳ Adding...' : '+ Add Todo'}
          </button>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="stats">
          <div className="stat-card">
            <div className="stat-number">{totalCount}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#e53e3e' }}>{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#48bb78' }}>{completedCount}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      )}

      {/* Todo List */}
      <div className="todos-header">
        <h2>Your Todos</h2>
      </div>

      {loading ? (
        <div className="loading">Loading todos...</div>
      ) : todos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>No todos yet. Add one above to get started!</p>
        </div>
      ) : (
        <ul className="todo-list" style={{ listStyle: 'none' }}>
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item${todo.completed ? ' completed' : ''}`}
            >
              <div className="todo-checkbox-wrapper">
                <input
                  type="checkbox"
                  className="todo-checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleCompleted(todo)}
                  aria-label={`Mark "${todo.title}" as ${todo.completed ? 'pending' : 'completed'}`}
                />
              </div>
              <div className="todo-content">
                <div className="todo-title">{todo.title}</div>
                {todo.description && (
                  <div className="todo-description">{todo.description}</div>
                )}
                <div className="todo-meta">
                  <span className={`todo-badge ${todo.completed ? 'done' : 'pending'}`}>
                    {todo.completed ? 'Done' : 'Pending'}
                  </span>
                  <span>{formatDate(todo.createdAt)}</span>
                </div>
              </div>
              <div className="todo-actions">
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteTodo(todo.id)}
                  aria-label={`Delete "${todo.title}"`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
