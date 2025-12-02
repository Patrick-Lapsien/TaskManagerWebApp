import React from 'react'
import { Task } from '../App'

interface TaskListProps {
  tasks: Task[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

const statusColors: Record<string, string> = {
  TODO: '#f57c00',
  IN_PROGRESS: '#1976d2',
  DONE: '#388e3c'
}

export default function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: '2rem',
        textAlign: 'center',
        color: '#999',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        No tasks yet. Create one to get started!
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {tasks.map(task => (
        <div
          key={task.id}
          style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${statusColors[task.status] || '#999'}`
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{task.title}</h3>
              {task.description && (
                <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.95rem' }}>
                  {task.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: statusColors[task.status] || '#999',
                    color: '#fff',
                    borderRadius: 12,
                    fontSize: '0.85rem',
                    fontWeight: 500
                  }}
                >
                  {task.status === 'IN_PROGRESS' ? 'In Progress' : task.status}
                </span>
                {task.dueDate && (
                  <span style={{ color: '#999', fontSize: '0.9rem' }}>
                    📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => task.id && onEdit(task.id)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                Edit
              </button>
              <button
                onClick={() => task.id && onDelete(task.id)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d32f2f',
                  borderRadius: 4,
                  backgroundColor: '#ffebee',
                  color: '#d32f2f',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
