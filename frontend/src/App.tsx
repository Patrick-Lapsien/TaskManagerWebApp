import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import ErrorBanner from './components/ErrorBanner'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type SortBy = 'none' | 'status' | 'dueDate'

export interface Task {
  id?: number
  title: string
  description?: string
  status: TaskStatus
  dueDate?: string | null
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortBy>('none')
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await axios.get<Task[]>(`${API_BASE}/tasks`)
      setTasks(res.data || [])
    } catch (err) {
      setError('Failed to load tasks. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (task: Task) => {
    setError(null)
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/tasks/${editingId}`, task)
        setEditingId(null)
      } else {
        await axios.post(`${API_BASE}/tasks`, task)
      }
      load()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save task. Please check your input.'
      setError(msg)
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return
    setError(null)
    try {
      await axios.delete(`${API_BASE}/tasks/${id}`)
      load()
    } catch (err) {
      setError('Failed to delete task. Please try again.')
      console.error(err)
    }
  }

  const handleEdit = (id: number) => {
    setEditingId(id)
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'status') {
      const order: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 1, DONE: 2 }
      return order[a.status] - order[b.status]
    }
    if (sortBy === 'dueDate') {
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      return aDate - bDate
    }
    return 0
  })

  const editingTask = editingId ? tasks.find(t => t.id === editingId) : null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ backgroundColor: '#2c3e50', color: '#fff', padding: '1.5rem 0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ margin: 0 }}>Task Manager</h1>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Task' : 'Add New Task'}</h2>
          <TaskForm onSave={handleSave} onCancel={editingId ? handleCancel : undefined} initialTask={editingTask} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Tasks ({tasks.length})</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label htmlFor="sort-select" style={{ fontWeight: 500 }}>Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortBy)}
              style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontFamily: 'inherit' }}
            >
              <option value="none">None</option>
              <option value="status">Status</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
        </div>

        {isLoading && <div style={{ textAlign: 'center', color: '#999', padding: '1rem' }}>Loading...</div>}
        {!isLoading && <TaskList tasks={sortedTasks} onEdit={handleEdit} onDelete={handleDelete} />}
      </main>
    </div>
  )
}
