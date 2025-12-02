import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import App from '../App'

vi.mock('axios')
const mockedAxios = axios as any

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.get.mockResolvedValue({ data: [] })
  })

  describe('Initial Render', () => {
    it('should render the app title', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] })
      render(<App />)

      expect(screen.getByText('Task Manager')).toBeInTheDocument()
    })

    it('should render the form section', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] })
      render(<App />)

      expect(screen.getByText(/add new task/i)).toBeInTheDocument()
    })

    it('should render the tasks section', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] })
      render(<App />)

      expect(screen.getByText(/tasks/i)).toBeInTheDocument()
    })

    it('should load tasks on mount', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] })
      render(<App />)

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/tasks')
        )
      })
    })
  })

  describe('Loading Tasks', () => {
    it('should display loading state initially', async () => {
      mockedAxios.get.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
      )
      render(<App />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })
    })

    it('should display loaded tasks', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'TODO' },
        { id: 2, title: 'Task 2', status: 'DONE' },
      ]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument()
        expect(screen.getByText('Task 2')).toBeInTheDocument()
      })
    })

    it('should display error message if loading tasks fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'))
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument()
      })
    })

    it('should display empty state when no tasks are loaded', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] })
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
      })
    })
  })

  describe('Create Task', () => {
    it('should create a new task on form submission', async () => {
      const user = userEvent.setup()
      mockedAxios.get.mockResolvedValue({ data: [] })
      mockedAxios.post.mockResolvedValue({
        data: { id: 1, title: 'New Task', status: 'TODO' },
      })

      render(<App />)

      const titleInput = await screen.findByLabelText(/title/i)
      await user.type(titleInput, 'New Task')

      const submitButton = screen.getByRole('button', { name: /add task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/tasks'),
          expect.objectContaining({ title: 'New Task' })
        )
      })
    })

    it('should reload tasks after successful creation', async () => {
      const user = userEvent.setup()
      mockedAxios.get.mockResolvedValue({ data: [] })
      mockedAxios.post.mockResolvedValue({
        data: { id: 1, title: 'New Task', status: 'TODO' },
      })

      render(<App />)

      const titleInput = await screen.findByLabelText(/title/i)
      await user.type(titleInput, 'New Task')

      const submitButton = screen.getByRole('button', { name: /add task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2) // Once on mount, once after create
      })
    })

    it('should display error message if creation fails', async () => {
      const user = userEvent.setup()
      mockedAxios.get.mockResolvedValue({ data: [] })
      mockedAxios.post.mockRejectedValue(new Error('Server error'))

      render(<App />)

      const titleInput = await screen.findByLabelText(/title/i)
      await user.type(titleInput, 'New Task')

      const submitButton = screen.getByRole('button', { name: /add task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to save task/i)).toBeInTheDocument()
      })
    })

    it('should display custom error message from server', async () => {
      const user = userEvent.setup()
      mockedAxios.get.mockResolvedValue({ data: [] })
      mockedAxios.post.mockRejectedValue({
        response: { data: { message: 'Title is required' } },
      })

      render(<App />)

      const titleInput = await screen.findByLabelText(/title/i)
      await user.type(titleInput, 'New Task')

      const submitButton = screen.getByRole('button', { name: /add task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
    })
  })

  describe('Edit Task', () => {
    it('should switch to edit mode when edit button is clicked', async () => {
      const user = userEvent.setup()
      const mockTasks = [{ id: 1, title: 'Task', status: 'TODO' }]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })

      render(<App />)

      const editButton = await screen.findByRole('button', { name: /edit/i })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText(/edit task/i)).toBeInTheDocument()
      })
    })

    it('should populate form with task data when editing', async () => {
      const user = userEvent.setup()
      const mockTasks = [
        {
          id: 1,
          title: 'Existing Task',
          description: 'Task description',
          status: 'IN_PROGRESS',
          dueDate: '2025-12-31',
        },
      ]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })

      render(<App />)

      const editButton = await screen.findByRole('button', { name: /edit/i })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Task description')).toBeInTheDocument()
      })
    })

    it('should update task when form is submitted in edit mode', async () => {
      const user = userEvent.setup()
      const mockTasks = [{ id: 1, title: 'Original Task', status: 'TODO' }]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })
      mockedAxios.put.mockResolvedValue({ data: { id: 1, title: 'Updated Task', status: 'DONE' } })

      render(<App />)

      const editButton = await screen.findByRole('button', { name: /edit/i })
      await user.click(editButton)

      const titleInput = await screen.findByDisplayValue('Original Task')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task')

      const updateButton = screen.getByRole('button', { name: /update/i })
      await user.click(updateButton)

      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          expect.stringContaining('/api/tasks/1'),
          expect.objectContaining({ title: 'Updated Task' })
        )
      })
    })

    it('should exit edit mode after successful update', async () => {
      const user = userEvent.setup()
      const mockTasks = [{ id: 1, title: 'Original Task', status: 'TODO' }]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })
      mockedAxios.put.mockResolvedValue({ data: { id: 1, title: 'Updated Task', status: 'DONE' } })

      render(<App />)

      const editButton = await screen.findByRole('button', { name: /edit/i })
      await user.click(editButton)

      const updateButton = screen.getByRole('button', { name: /update/i })
      await user.click(updateButton)

      await waitFor(() => {
        expect(screen.getByText(/add new task/i)).toBeInTheDocument()
        expect(screen.queryByText(/edit task/i)).not.toBeInTheDocument()
      })
    })

    it('should display error message if update fails', async () => {
      const user = userEvent.setup()
      const mockTasks = [{ id: 1, title: 'Task', status: 'TODO' }]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })
      mockedAxios.put.mockRejectedValue(new Error('Server error'))

      render(<App />)

      const editButton = await screen.findByRole('button', { name: /edit/i })
      await user.click(editButton)

      const updateButton = screen.getByRole('button', { name: /update/i })
      await user.click(updateButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to save task/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cancel Edit', () => {
    it('should cancel edit mode when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const mockTasks = [{ id: 1, title: 'Task', status: 'TODO' }]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })

      render(<App />)

      const editButton = await screen.findByRole('button', { name: /edit/i })
      await user.click(editButton)

      const cancelButton = await screen.findByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.getByText(/add new task/i)).toBeInTheDocument()
      })
    })
  })

  describe('Delete Task', () => {
    it('should delete task when delete button is clicked', async () => {
      const user = userEvent.setup()
      const mockTasks = [{ id: 1, title: 'Task', status: 'TODO' }]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })
      mockedAxios.delete.mockResolvedValue({ status: 204 })

      // Mock window.confirm to return true
      window.confirm = vi.fn(() => true)

      render(<App />)

      const deleteButton = await screen.findByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      // Verify that confirm was called
      expect(window.confirm).toHaveBeenCalled()
      expect(window.confirm).toHaveBeenCalledWith('Delete this task?')
    })

    it('should reload tasks after successful deletion', async () => {
      const user = userEvent.setup()
      const mockTasks = [{ id: 1, title: 'Task', status: 'TODO' }]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })
      mockedAxios.delete.mockResolvedValue({ status: 204 })

      // Mock window.confirm
      window.confirm = vi.fn(() => true)

      render(<App />)

      const deleteButton = await screen.findByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith(
          expect.stringContaining('/api/tasks/1')
        )
      })
    })

    it('should display error message if deletion fails', async () => {
      const user = userEvent.setup()
      const mockTasks = [{ id: 1, title: 'Task', status: 'TODO' }]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })
      mockedAxios.delete.mockRejectedValue(new Error('Server error'))

      window.confirm = vi.fn(() => true)

      render(<App />)

      const deleteButton = await screen.findByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to delete task/i)).toBeInTheDocument()
      })
    })
  })

  describe('Sorting', () => {
    it('should display sort dropdown', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] })
      render(<App />)

      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument()
    })

    it('should have sort options', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] })
      render(<App />)

      const sortSelect = screen.getByLabelText(/sort by/i) as HTMLSelectElement
      const options = Array.from(sortSelect.options).map(opt => opt.value)

      expect(options).toContain('none')
      expect(options).toContain('status')
      expect(options).toContain('dueDate')
    })

    it('should sort tasks by status', async () => {
      const user = userEvent.setup()
      const mockTasks = [
        { id: 1, title: 'DONE Task', status: 'DONE' },
        { id: 2, title: 'TODO Task', status: 'TODO' },
        { id: 3, title: 'IN_PROGRESS Task', status: 'IN_PROGRESS' },
      ]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })

      render(<App />)

      const sortSelect = await screen.findByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'status')

      await waitFor(() => {
        const titles = screen.getAllByRole('heading', { level: 3 })
        expect(titles[0]).toHaveTextContent('TODO Task')
        expect(titles[1]).toHaveTextContent('IN_PROGRESS Task')
        expect(titles[2]).toHaveTextContent('DONE Task')
      })
    })

    it('should sort tasks by due date', async () => {
      const user = userEvent.setup()
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'TODO', dueDate: '2025-12-31' },
        { id: 2, title: 'Task 2', status: 'TODO', dueDate: '2025-12-01' },
        { id: 3, title: 'Task 3', status: 'TODO' }, // No due date
      ]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })

      render(<App />)

      const sortSelect = await screen.findByLabelText(/sort by/i)
      await user.selectOptions(sortSelect, 'dueDate')

      await waitFor(() => {
        const titles = screen.getAllByRole('heading', { level: 3 })
        expect(titles[0]).toHaveTextContent('Task 2')
        expect(titles[1]).toHaveTextContent('Task 1')
      })
    })
  })

  describe('Error Dismissal', () => {
    it('should dismiss error banner when dismiss button is clicked', async () => {
      const user = userEvent.setup()
      mockedAxios.get.mockRejectedValue(new Error('Network error'))
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument()
      })

      const dismissButton = screen.getByRole('button', { name: /×|close|dismiss/i })
      await user.click(dismissButton)

      expect(screen.queryByText(/failed to load tasks/i)).not.toBeInTheDocument()
    })
  })

  describe('Task Count Display', () => {
    it('should display correct task count', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'TODO' },
        { id: 2, title: 'Task 2', status: 'TODO' },
        { id: 3, title: 'Task 3', status: 'TODO' },
      ]
      mockedAxios.get.mockResolvedValue({ data: mockTasks })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText(/tasks \(3\)/i)).toBeInTheDocument()
      })
    })

    it('should update task count after adding a task', async () => {
      const user = userEvent.setup()
      mockedAxios.get.mockResolvedValueOnce({ data: [] })
      mockedAxios.post.mockResolvedValue({
        data: { id: 1, title: 'New Task', status: 'TODO' },
      })
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ id: 1, title: 'New Task', status: 'TODO' }],
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText(/tasks \(0\)/i)).toBeInTheDocument()
      })

      const titleInput = await screen.findByLabelText(/title/i)
      await user.type(titleInput, 'New Task')

      const submitButton = screen.getByRole('button', { name: /add task/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/tasks \(1\)/i)).toBeInTheDocument()
      })
    })
  })
})
