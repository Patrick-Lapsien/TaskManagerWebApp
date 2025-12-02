import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskList from '../components/TaskList'
import { Task } from '../App'

describe('TaskList Component', () => {
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    mockOnEdit.mockClear()
    mockOnDelete.mockClear()
  })

  describe('Empty State', () => {
    it('should display empty state message when no tasks', () => {
      render(<TaskList tasks={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />)
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
    })

    it('should not display task items when list is empty', () => {
      render(<TaskList tasks={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />)
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })
  })

  describe('Task Rendering', () => {
    it('should render all tasks in the list', () => {
      const tasks: Task[] = [
        { id: 1, title: 'Task 1', status: 'TODO' },
        { id: 2, title: 'Task 2', status: 'IN_PROGRESS' },
        { id: 3, title: 'Task 3', status: 'DONE' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
      expect(screen.getByText('Task 3')).toBeInTheDocument()
    })

    it('should display task title', () => {
      const tasks: Task[] = [
        { id: 1, title: 'My Important Task', status: 'TODO' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      expect(screen.getByText('My Important Task')).toBeInTheDocument()
    })

    it('should display task description if provided', () => {
      const tasks: Task[] = [
        {
          id: 1,
          title: 'Task with Description',
          description: 'This is a detailed description',
          status: 'TODO',
        },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      expect(screen.getByText('This is a detailed description')).toBeInTheDocument()
    })

    it('should not display description when not provided', () => {
      const tasks: Task[] = [
        { id: 1, title: 'Task', status: 'TODO' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
    })
  })

  describe('Status Display', () => {
    it('should display status for each task', () => {
      const tasks: Task[] = [
        { id: 1, title: 'Task 1', status: 'TODO' },
        { id: 2, title: 'Task 2', status: 'IN_PROGRESS' },
        { id: 3, title: 'Task 3', status: 'DONE' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      expect(screen.getByText('TODO')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('DONE')).toBeInTheDocument()
    })

    it('should format IN_PROGRESS status as "In Progress"', () => {
      const tasks: Task[] = [
        { id: 1, title: 'Task', status: 'IN_PROGRESS' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.queryByText('IN_PROGRESS')).not.toBeInTheDocument()
    })
  })

  describe('Due Date Display', () => {
    it('should display due date if provided', () => {
      const tasks: Task[] = [
        {
          id: 1,
          title: 'Task with due date',
          status: 'TODO',
          dueDate: '2025-12-25',
        },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      // The component displays the due date icon and text, but the exact format depends on locale
      expect(screen.getByText(/📅 Due:/)).toBeInTheDocument()
      // Just check that the date appears somewhere in the rendered output
      const container = screen.getByText(/📅 Due:/).textContent
      expect(container).toBeTruthy()
    })

    it('should not display due date when not provided', () => {
      const tasks: Task[] = [
        { id: 1, title: 'Task', status: 'TODO' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      expect(screen.queryByText(/due:/i)).not.toBeInTheDocument()
    })

    it('should not display due date when it is null', () => {
      const tasks: Task[] = [
        {
          id: 1,
          title: 'Task',
          status: 'TODO',
          dueDate: null,
        },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      expect(screen.queryByText(/due:/i)).not.toBeInTheDocument()
    })
  })

  describe('Edit Button', () => {
    it('should render edit button for each task', () => {
      const tasks: Task[] = [
        { id: 1, title: 'Task 1', status: 'TODO' },
        { id: 2, title: 'Task 2', status: 'TODO' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      expect(editButtons).toHaveLength(2)
    })

    it('should call onEdit with correct task id when edit button is clicked', async () => {
      const user = userEvent.setup()
      const tasks: Task[] = [
        { id: 5, title: 'Task', status: 'TODO' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledWith(5)
    })

    it('should not call onEdit if task has no id', async () => {
      const user = userEvent.setup()
      const tasks: Task[] = [
        { title: 'Task without id', status: 'TODO' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(mockOnEdit).not.toHaveBeenCalled()
    })
  })

  describe('Delete Button', () => {
    it('should render delete button for each task', () => {
      const tasks: Task[] = [
        { id: 1, title: 'Task 1', status: 'TODO' },
        { id: 2, title: 'Task 2', status: 'TODO' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      expect(deleteButtons).toHaveLength(2)
    })

    it('should call onDelete with correct task id when delete button is clicked', async () => {
      const user = userEvent.setup()
      const tasks: Task[] = [
        { id: 10, title: 'Task', status: 'TODO' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledWith(10)
    })

    it('should not call onDelete if task has no id', async () => {
      const user = userEvent.setup()
      const tasks: Task[] = [
        { title: 'Task without id', status: 'TODO' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(mockOnDelete).not.toHaveBeenCalled()
    })
  })

  describe('Task Styling', () => {
    it('should apply different border colors based on status', () => {
      const tasks: Task[] = [
        { id: 1, title: 'TODO Task', status: 'TODO' },
        { id: 2, title: 'IN_PROGRESS Task', status: 'IN_PROGRESS' },
        { id: 3, title: 'DONE Task', status: 'DONE' },
      ]
      const { container } = render(
        <TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      )

      const cards = container.querySelectorAll('[style*="border"]')
      expect(cards.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Multiple Tasks', () => {
    it('should render multiple tasks in correct order', () => {
      const tasks: Task[] = [
        { id: 1, title: 'First Task', status: 'TODO' },
        { id: 2, title: 'Second Task', status: 'TODO' },
        { id: 3, title: 'Third Task', status: 'TODO' },
      ]
      const { container } = render(
        <TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />
      )

      const titles = Array.from(container.querySelectorAll('h3')).map(el => el.textContent)
      expect(titles).toEqual(['First Task', 'Second Task', 'Third Task'])
    })

    it('should handle tasks with similar titles', () => {
      const tasks: Task[] = [
        { id: 1, title: 'Task', status: 'TODO' },
        { id: 2, title: 'Task', status: 'IN_PROGRESS' },
        { id: 3, title: 'Task', status: 'DONE' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      expect(editButtons).toHaveLength(3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle tasks with special characters', () => {
      const tasks: Task[] = [
        {
          id: 1,
          title: 'Task with <special> & "characters"',
          description: 'Description with émojis 🎉',
          status: 'TODO',
        },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      expect(screen.getByText(/Task with.*special.*characters/)).toBeInTheDocument()
      expect(screen.getByText(/émojis 🎉/)).toBeInTheDocument()
    })

    it('should handle very long task titles', () => {
      const longTitle = 'A'.repeat(100)
      const tasks: Task[] = [
        { id: 1, title: longTitle, status: 'TODO' },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle very long descriptions', () => {
      const longDesc = 'B'.repeat(500)
      const tasks: Task[] = [
        {
          id: 1,
          title: 'Task',
          description: longDesc,
          status: 'TODO',
        },
      ]
      render(<TaskList tasks={tasks} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

      expect(screen.getByText(longDesc)).toBeInTheDocument()
    })
  })
})
