import React, { useState, useEffect } from 'react'
import { Task, TaskStatus } from '../App'

interface TaskFormProps {
  onSave: (task: Task) => void
  onCancel?: () => void
  initialTask?: Task | null
}

export default function TaskForm({ onSave, onCancel, initialTask }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [dueDate, setDueDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title)
      setDescription(initialTask.description || '')
      setStatus(initialTask.status)
      setDueDate(initialTask.dueDate || '')
    } else {
      resetForm()
    }
  }, [initialTask])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setStatus('TODO')
    setDueDate('')
    setErrors({})
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (title.length > 100) newErrors.title = 'Title must be 100 characters or less'
    if (description.length > 500) newErrors.description = 'Description must be 500 characters or less'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const task: Task = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        dueDate: dueDate || null
      }
      await onSave(task)
      if (!initialTask) resetForm()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    onCancel?.()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="title-input" style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
          Title <span style={{ color: '#d32f2f' }}>*</span>
        </label>
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter task title"
          maxLength={100}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `1px solid ${errors.title ? '#d32f2f' : '#ddd'}`,
            borderRadius: 4,
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />
        <div style={{ fontSize: 12, color: '#999', marginTop: '0.25rem' }}>
          {title.length}/100
        </div>
        {errors.title && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: '0.25rem' }}>{errors.title}</div>}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="desc-input" style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
          Description
        </label>
        <textarea
          id="desc-input"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
          maxLength={500}
          rows={3}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `1px solid ${errors.description ? '#d32f2f' : '#ddd'}`,
            borderRadius: 4,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
        />
        <div style={{ fontSize: 12, color: '#999', marginTop: '0.25rem' }}>
          {description.length}/500
        </div>
        {errors.description && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: '0.25rem' }}>{errors.description}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label htmlFor="status-select" style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
            Status
          </label>
          <select
            id="status-select"
            value={status}
            onChange={e => setStatus(e.target.value as TaskStatus)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontFamily: 'inherit'
            }}
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div>
          <label htmlFor="duedate-input" style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
            Due Date
          </label>
          <input
            id="duedate-input"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #ddd',
              borderRadius: 4,
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 500
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: 4,
            backgroundColor: '#1976d2',
            color: '#fff',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontWeight: 500,
            opacity: isSubmitting ? 0.6 : 1
          }}
        >
          {isSubmitting ? 'Saving...' : initialTask ? 'Update' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}
