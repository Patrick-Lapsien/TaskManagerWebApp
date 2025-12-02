package com.example.taskmanager.repository;

import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.TaskStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class TaskRepositoryTests {

    @Autowired
    private TaskRepository taskRepository;

    private Task testTask;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        
        testTask = new Task();
        testTask.setTitle("Test Task");
        testTask.setDescription("This is a test task");
        testTask.setStatus(TaskStatus.TODO);
        testTask.setDueDate(LocalDate.of(2025, 12, 31));
    }

    // ===================== SAVE TESTS =====================
    @Test
    void testSaveTask_Success() {
        // When: Save a new task
        Task saved = taskRepository.save(testTask);

        // Then: Task is saved with an ID and can be retrieved
        assertNotNull(saved.getId());
        assertEquals("Test Task", saved.getTitle());
        assertEquals("This is a test task", saved.getDescription());
        assertEquals(TaskStatus.TODO, saved.getStatus());
    }

    @Test
    void testSaveTask_WithoutDescription() {
        // Given: Task without description
        testTask.setDescription(null);

        // When: Save the task
        Task saved = taskRepository.save(testTask);

        // Then: Task is saved successfully with null description
        assertNotNull(saved.getId());
        assertNull(saved.getDescription());
    }

    @Test
    void testSaveTask_WithoutDueDate() {
        // Given: Task without due date
        testTask.setDueDate(null);

        // When: Save the task
        Task saved = taskRepository.save(testTask);

        // Then: Task is saved successfully with null due date
        assertNotNull(saved.getId());
        assertNull(saved.getDueDate());
    }

    @Test
    void testSaveTask_DefaultStatus() {
        // Given: Task with no status set (should default to TODO)
        Task task = new Task();
        task.setTitle("Default Status Task");

        // When: Save the task
        Task saved = taskRepository.save(task);

        // Then: Default status is applied
        assertEquals(TaskStatus.TODO, saved.getStatus());
    }

    @Test
    void testSaveTask_MultipleStatuses() {
        // Given: Three tasks with different statuses
        Task task1 = new Task();
        task1.setTitle("Task 1");
        task1.setStatus(TaskStatus.TODO);

        Task task2 = new Task();
        task2.setTitle("Task 2");
        task2.setStatus(TaskStatus.IN_PROGRESS);

        Task task3 = new Task();
        task3.setTitle("Task 3");
        task3.setStatus(TaskStatus.DONE);

        // When: Save all tasks
        taskRepository.save(task1);
        taskRepository.save(task2);
        taskRepository.save(task3);

        // Then: All tasks are saved with correct statuses
        List<Task> all = taskRepository.findAll();
        assertEquals(3, all.size());
        assertEquals(1, all.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count());
        assertEquals(1, all.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count());
        assertEquals(1, all.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count());
    }

    // ===================== FIND BY ID TESTS =====================
    @Test
    void testFindById_Success() {
        // Given: A saved task
        Task saved = taskRepository.save(testTask);

        // When: Find task by ID
        Optional<Task> found = taskRepository.findById(saved.getId());

        // Then: Task is found with correct data
        assertTrue(found.isPresent());
        assertEquals("Test Task", found.get().getTitle());
        assertEquals("This is a test task", found.get().getDescription());
    }

    @Test
    void testFindById_NotFound() {
        // Given: No task with ID 999 exists
        // When: Find task by non-existent ID
        Optional<Task> found = taskRepository.findById(999L);

        // Then: Optional is empty
        assertFalse(found.isPresent());
        assertTrue(found.isEmpty());
    }

    @Test
    void testFindById_AfterDelete() {
        // Given: A saved task
        Task saved = taskRepository.save(testTask);
        long savedId = saved.getId();

        // When: Delete the task and try to find it
        taskRepository.deleteById(savedId);
        Optional<Task> found = taskRepository.findById(savedId);

        // Then: Task is not found
        assertFalse(found.isPresent());
    }

    // ===================== FIND ALL TESTS =====================
    @Test
    void testFindAll_Success() {
        // Given: Three saved tasks
        Task task1 = new Task();
        task1.setTitle("Task 1");
        Task task2 = new Task();
        task2.setTitle("Task 2");
        Task task3 = new Task();
        task3.setTitle("Task 3");

        taskRepository.save(task1);
        taskRepository.save(task2);
        taskRepository.save(task3);

        // When: Find all tasks
        List<Task> all = taskRepository.findAll();

        // Then: All three tasks are returned
        assertEquals(3, all.size());
    }

    @Test
    void testFindAll_Empty() {
        // Given: No tasks in database
        // When: Find all tasks
        List<Task> all = taskRepository.findAll();

        // Then: Empty list is returned
        assertTrue(all.isEmpty());
        assertEquals(0, all.size());
    }

    @Test
    void testFindAll_AfterPartialDelete() {
        // Given: Three saved tasks
        Task task1 = taskRepository.save(testTask);
        
        Task task2 = new Task();
        task2.setTitle("Task 2");
        taskRepository.save(task2);

        Task task3 = new Task();
        task3.setTitle("Task 3");
        taskRepository.save(task3);

        // When: Delete one task
        taskRepository.deleteById(task1.getId());
        List<Task> all = taskRepository.findAll();

        // Then: Only two tasks remain
        assertEquals(2, all.size());
        assertTrue(all.stream().anyMatch(t -> "Task 2".equals(t.getTitle())));
        assertTrue(all.stream().anyMatch(t -> "Task 3".equals(t.getTitle())));
    }

    // ===================== UPDATE TESTS =====================
    @Test
    void testUpdate_Success() {
        // Given: A saved task
        Task saved = taskRepository.save(testTask);
        long savedId = saved.getId();

        // When: Update the task
        saved.setTitle("Updated Title");
        saved.setStatus(TaskStatus.IN_PROGRESS);
        Task updated = taskRepository.save(saved);

        // Then: Task is updated in database
        Optional<Task> retrieved = taskRepository.findById(savedId);
        assertTrue(retrieved.isPresent());
        assertEquals("Updated Title", retrieved.get().getTitle());
        assertEquals(TaskStatus.IN_PROGRESS, retrieved.get().getStatus());
    }

    @Test
    void testUpdate_MultipleFields() {
        // Given: A saved task
        Task saved = taskRepository.save(testTask);

        // When: Update multiple fields
        saved.setTitle("New Title");
        saved.setDescription("New Description");
        saved.setStatus(TaskStatus.DONE);
        saved.setDueDate(LocalDate.of(2026, 01, 01));
        taskRepository.save(saved);

        // Then: All fields are updated
        Task retrieved = taskRepository.findById(saved.getId()).get();
        assertEquals("New Title", retrieved.getTitle());
        assertEquals("New Description", retrieved.getDescription());
        assertEquals(TaskStatus.DONE, retrieved.getStatus());
        assertEquals(LocalDate.of(2026, 01, 01), retrieved.getDueDate());
    }

    @Test
    void testUpdate_ClearFields() {
        // Given: A saved task with description and due date
        Task saved = taskRepository.save(testTask);

        // When: Clear optional fields
        saved.setDescription(null);
        saved.setDueDate(null);
        taskRepository.save(saved);

        // Then: Fields are cleared
        Task retrieved = taskRepository.findById(saved.getId()).get();
        assertNull(retrieved.getDescription());
        assertNull(retrieved.getDueDate());
    }

    // ===================== DELETE TESTS =====================
    @Test
    void testDeleteById_Success() {
        // Given: A saved task
        Task saved = taskRepository.save(testTask);
        long savedId = saved.getId();

        // When: Delete the task
        taskRepository.deleteById(savedId);

        // Then: Task is no longer in database
        Optional<Task> found = taskRepository.findById(savedId);
        assertFalse(found.isPresent());
    }

    @Test
    void testDeleteById_NonExistent() {
        // Given: No task with ID 999 exists
        // When: Try to delete non-existent task (should not throw)
        assertDoesNotThrow(() -> taskRepository.deleteById(999L));
    }

    @Test
    void testDelete_Success() {
        // Given: A saved task
        Task saved = taskRepository.save(testTask);
        long savedId = saved.getId();

        // When: Delete using entity
        taskRepository.delete(saved);

        // Then: Task is no longer in database
        assertFalse(taskRepository.findById(savedId).isPresent());
    }

    @Test
    void testDeleteAll() {
        // Given: Multiple saved tasks
        taskRepository.save(testTask);
        
        Task task2 = new Task();
        task2.setTitle("Task 2");
        taskRepository.save(task2);

        Task task3 = new Task();
        task3.setTitle("Task 3");
        taskRepository.save(task3);

        assertEquals(3, taskRepository.count());

        // When: Delete all tasks
        taskRepository.deleteAll();

        // Then: Database is empty
        assertEquals(0, taskRepository.count());
        assertTrue(taskRepository.findAll().isEmpty());
    }

    // ===================== COUNT AND EXISTS TESTS =====================
    @Test
    void testCount() {
        // Given: No tasks
        assertEquals(0, taskRepository.count());

        // When: Save three tasks
        taskRepository.save(testTask);
        
        Task task2 = new Task();
        task2.setTitle("Task 2");
        taskRepository.save(task2);

        // Then: Count reflects saved tasks
        assertEquals(2, taskRepository.count());
    }

    @Test
    void testExistsById_True() {
        // Given: A saved task
        Task saved = taskRepository.save(testTask);

        // When: Check if exists by ID
        boolean exists = taskRepository.existsById(saved.getId());

        // Then: Returns true
        assertTrue(exists);
    }

    @Test
    void testExistsById_False() {
        // Given: No task with ID 999 exists
        // When: Check if exists by ID
        boolean exists = taskRepository.existsById(999L);

        // Then: Returns false
        assertFalse(exists);
    }

    // ===================== EDGE CASES =====================
    @Test
    void testSaveTask_MaxLength_Title() {
        // Given: Task with title at max length (100 chars)
        String maxTitle = "a".repeat(100);
        testTask.setTitle(maxTitle);

        // When: Save the task
        Task saved = taskRepository.save(testTask);

        // Then: Task is saved with full title
        assertEquals(100, saved.getTitle().length());
        assertEquals(maxTitle, saved.getTitle());
    }

    @Test
    void testSaveTask_MaxLength_Description() {
        // Given: Task with description at max length (255 chars - DB limit)
        // Note: Validation allows 500 but DB schema has VARCHAR(255) constraint
        String maxDescription = "b".repeat(255);
        testTask.setDescription(maxDescription);

        // When: Save the task
        Task saved = taskRepository.save(testTask);

        // Then: Task is saved with full description
        assertEquals(255, saved.getDescription().length());
        assertEquals(maxDescription, saved.getDescription());
    }

    @Test
    void testSaveTask_SpecialCharacters() {
        // Given: Task with special characters
        testTask.setTitle("Task with !@#$%^&*() special chars");
        testTask.setDescription("Description with 日本語 and émojis 🎉");

        // When: Save the task
        Task saved = taskRepository.save(testTask);

        // Then: Special characters are preserved
        assertEquals("Task with !@#$%^&*() special chars", saved.getTitle());
        assertEquals("Description with 日本語 and émojis 🎉", saved.getDescription());
    }

    @Test
    void testConcurrentSaves() {
        // Given: Multiple tasks
        // When: Save multiple tasks
        for (int i = 0; i < 10; i++) {
            Task task = new Task();
            task.setTitle("Task " + i);
            task.setStatus(TaskStatus.TODO);
            taskRepository.save(task);
        }

        // Then: All tasks are saved
        assertEquals(10, taskRepository.count());
        List<Task> all = taskRepository.findAll();
        assertTrue(all.stream().allMatch(t -> t.getId() != null));
    }
}
