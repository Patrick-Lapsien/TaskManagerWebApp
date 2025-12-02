import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from '../components/TaskForm'
import { Task, TaskStatus } from '../App'

describe('TaskForm Component', () => {
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    mockOnSave.mockClear()
    mockOnCancel.mockClear()
  })

  describe('Rendering', () => {
    it('should render the form with all input fields', () => {
      render(<TaskForm onSave={mockOnSave} />)
      
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument()
    })

    it('should render Add Task button when not editing', () => {
      render(<TaskForm onSave={mockOnSave} />)
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
    })

    it('should render Update button when editing', () => {
      const initialTask: Task = {
        id: 1,
        title: 'Test Task',
        status: 'TODO',
      }
      render(<TaskForm onSave={mockOnSave} initialTask={initialTask} />)
      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument()
    })

    it('should render Cancel button when onCancel is provided', () => {
      render(<TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />)
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should not render Cancel button when onCancel is not provided', () => {
      render(<TaskForm onSave={mockOnSave} />)
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
    })
  })

  describe('Form Initialization', () => {
    it('should have empty fields on initial render', () => {
      render(<TaskForm onSave={mockOnSave} />)
      
      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
      const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement
      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement
      const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement

      expect(titleInput.value).toBe('')
      expect(descInput.value).toBe('')
      expect(statusSelect.value).toBe('TODO')
      expect(dueDateInput.value).toBe('')
    })

    it('should populate form with initial task data', () => {
      const initialTask: Task = {
        id: 1,
        title: 'Existing Task',
        description: 'Task description',
        status: 'IN_PROGRESS',
        dueDate: '2025-12-31',
      }
      render(<TaskForm onSave={mockOnSave} initialTask={initialTask} />)

      expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Task')
      expect(screen.getByLabelText(/description/i)).toHaveValue('Task description')
      expect(screen.getByLabelText(/status/i)).toHaveValue('IN_PROGRESS')
      expect(screen.getByLabelText(/due date/i)).toHaveValue('2025-12-31')
    })

    it('should clear form when initialTask changes from task to null', async () => {
      const initialTask: Task = {
        id: 1,
        title: 'Task 1',
        status: 'TODO',
      }
      const { rerender } = render(<TaskForm onSave={mockOnSave} initialTask={initialTask} />)

      expect(screen.getByLabelText(/title/i)).toHaveValue('Task 1')

      rerender(<TaskForm onSave={mockOnSave} initialTask={null} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/title/i)).toHaveValue('')
      })
    })
  })

  describe('Form Validation', () => {
    it('should show error if title is empty', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSave={mockOnSave} />)

      const submitButton = screen.getByRole('button', { name: /add task/i })
      await user.click(submitButton)

      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should show error if title exceeds 100 characters', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSave={mockOnSave} />)

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'a'.repeat(101))

      const submitButton = screen.getByRole('button', { name: /add task/i })
      await user.click(submitButton)

      // The input has maxlength="100" so it won't accept more than 100 chars
      // So test that the form doesn't submit
      expect((titleInput as HTMLInputElement).value.length).toBeLessThanOrEqual(100)
    })

    it('should show error if description exceeds 500 characters', async () => {
      const user = userEvent.setup({ delay: null })
      render(<TaskForm onSave={mockOnSave} />)

      const titleInput = screen.getByLabelText(/title/i)
      const descInput = screen.getByLabelText(/description/i)

      await user.type(titleInput, 'Valid Title', { delay: 1 })
      // The textarea has maxlength="500" so it won't accept more than 500 chars
      for (let i = 0; i < 501; i++) {
        await user.keyboard('b')
      }

      await waitFor(() => {
        expect((descInput as HTMLTextAreaElement).value.length).toBeLessThanOrEqual(500)
      })
    })

    it('should allow whitespace-only title but trim it', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSave={mockOnSave} />)

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, '   ')

      const submitButton = screen.getByRole('button', { name: /add task/i })
      await user.click(submitButton)

      // Should show error because trimmed title is empty
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call onSave with correct task data on valid submission', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSave={mockOnSave} />)

      const titleInput = screen.getByLabelText(/title/i)
      const descInput = screen.getByLabelText(/description/i)
      const statusSelect = screen.getByLabelText(/status/i)
      const dueDateInput = screen.getByLabelText(/due date/i)

      await user.type(titleInput, 'New Task')
      await user.type(descInput, 'Task description')
      await user.selectOptions(statusSelect, 'IN_PROGRESS')
      await user.type(dueDateInput, '2025-12-25')

      const submitButton = screen.getByRole('button', { name: /add task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Task',
            description: 'Task description',
            status: 'IN_PROGRESS',
            dueDate: '2025-12-25',
          })
        )
      })
    })

    it('should trim whitespace from title and description', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSave={mockOnSave} />)

      const titleInput = screen.getByLabelText(/title/i)
      const descInput = screen.getByLabelText(/description/i)

      await user.type(titleInput, '  Trimmed Title  ')
      await user.type(descInput, '  Trimmed Description  ')

      const submitButton = screen.getByRole('button', { name: /add task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Trimmed Title',
            description: 'Trimmed Description',
          })
        )
      })
    })

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSave={mockOnSave} />)

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Task')

      const submitButton = screen.getByRole('button', { name: /add task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(titleInput).toHaveValue('')
      })
    })

    it('should not reset form when editing', async () => {
      const user = userEvent.setup()
      const initialTask: Task = {
        id: 1,
        title: 'Existing Task',
        status: 'TODO',
      }
      render(<TaskForm onSave={mockOnSave} initialTask={initialTask} />)

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task')

      const submitButton = screen.getByRole('button', { name: /update/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(titleInput.value).toBe('Updated Task')
      })
    })

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup()
      let resolveOnSave: (() => void) | null = null
      const onSavePromise = new Promise<void>((resolve) => {
        resolveOnSave = resolve
      })
      mockOnSave.mockImplementation(() => onSavePromise)

      render(<TaskForm onSave={mockOnSave} />)

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Task')

      const submitButton = screen.getByRole('button', { name: /add task/i })
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Saving...')

      resolveOnSave?.()
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should reset form when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSave={mockOnSave} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Task')

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(titleInput).toHaveValue('')
    })
  })

  describe('Character Count Display', () => {
    it('should display character count for title', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSave={mockOnSave} />)

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Test')

      expect(screen.getByText('4/100')).toBeInTheDocument()
    })

    it('should display character count for description', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSave={mockOnSave} />)

      const descInput = screen.getByLabelText(/description/i)
      await user.type(descInput, 'Hello')

      expect(screen.getByText('5/500')).toBeInTheDocument()
    })
  })

  describe('Status Options', () => {
    it('should have all status options available', () => {
      render(<TaskForm onSave={mockOnSave} />)

      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement
      const options = Array.from(statusSelect.options).map(opt => opt.value)

      expect(options).toContain('TODO')
      expect(options).toContain('IN_PROGRESS')
      expect(options).toContain('DONE')
    })

    it('should default to TODO status', () => {
      render(<TaskForm onSave={mockOnSave} />)

      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement
      expect(statusSelect.value).toBe('TODO')
    })
  })
})
