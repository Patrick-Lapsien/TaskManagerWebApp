package com.example.taskmanager.controller;

import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.TaskStatus;
import com.example.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerTests {

    @Autowired
    private MockMvc mockMvc;

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

    // ===================== GET ALL TESTS =====================
    @Test
    void testGetAllTasks_Success() throws Exception {
        // Given: Two tasks in the database
        Task task1 = new Task();
        task1.setTitle("Task 1");
        task1.setStatus(TaskStatus.TODO);
        taskRepository.save(task1);

        Task task2 = new Task();
        task2.setTitle("Task 2");
        task2.setStatus(TaskStatus.IN_PROGRESS);
        taskRepository.save(task2);

        // When & Then: GET /api/tasks returns all tasks
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title", equalTo("Task 1")))
                .andExpect(jsonPath("$[1].title", equalTo("Task 2")))
                .andExpect(jsonPath("$[0].status", equalTo("TODO")))
                .andExpect(jsonPath("$[1].status", equalTo("IN_PROGRESS")));
    }

    @Test
    void testGetAllTasks_EmptyList() throws Exception {
        // Given: No tasks in the database
        // When & Then: GET /api/tasks returns empty array
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // ===================== GET BY ID TESTS =====================
    @Test
    void testGetTaskById_Success() throws Exception {
        // Given: A task exists in the database
        Task saved = taskRepository.save(testTask);

        // When & Then: GET /api/tasks/{id} returns the task
        mockMvc.perform(get("/api/tasks/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", equalTo(saved.getId().intValue())))
                .andExpect(jsonPath("$.title", equalTo("Test Task")))
                .andExpect(jsonPath("$.description", equalTo("This is a test task")))
                .andExpect(jsonPath("$.status", equalTo("TODO")));
    }

    @Test
    void testGetTaskById_NotFound() throws Exception {
        // Given: No task with ID 999 exists
        // When & Then: GET /api/tasks/999 returns 404
        mockMvc.perform(get("/api/tasks/999"))
                .andExpect(status().isNotFound());
    }

    // ===================== CREATE TESTS =====================
    @Test
    void testCreateTask_Success() throws Exception {
        // Given: Valid task data
        String taskJson = """
                {
                  "title": "New Task",
                  "description": "A new task description",
                  "status": "TODO",
                  "dueDate": "2025-12-31"
                }
                """;

        // When & Then: POST /api/tasks creates and returns the task with 201
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(taskJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", equalTo("New Task")))
                .andExpect(jsonPath("$.description", equalTo("A new task description")))
                .andExpect(jsonPath("$.status", equalTo("TODO")));
    }

    @Test
    void testCreateTask_MissingTitle() throws Exception {
        // Given: Task data without a title (required field)
        String taskJson = """
                {
                  "description": "Missing title",
                  "status": "TODO"
                }
                """;

        // When & Then: POST /api/tasks returns 400 (Bad Request)
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(taskJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCreateTask_TitleTooLong() throws Exception {
        // Given: Task data with title exceeding 100 characters
        String longTitle = "a".repeat(101);
        String taskJson = """
                {
                  "title": "%s",
                  "status": "TODO"
                }
                """.formatted(longTitle);

        // When & Then: POST /api/tasks returns 400 (Bad Request)
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(taskJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCreateTask_DescriptionTooLong() throws Exception {
        // Given: Task data with description exceeding 500 characters
        String longDescription = "a".repeat(501);
        String taskJson = """
                {
                  "title": "Valid Title",
                  "description": "%s",
                  "status": "TODO"
                }
                """.formatted(longDescription);

        // When & Then: POST /api/tasks returns 400 (Bad Request)
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(taskJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCreateTask_WithoutOptionalFields() throws Exception {
        // Given: Task data with only required fields
        String taskJson = """
                {
                  "title": "Minimal Task"
                }
                """;

        // When & Then: POST /api/tasks creates task with defaults
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(taskJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", equalTo("Minimal Task")))
                .andExpect(jsonPath("$.status", equalTo("TODO")));
    }

    @Test
    void testCreateTask_InvalidStatus() throws Exception {
        // Given: Task data with invalid status
        String taskJson = """
                {
                  "title": "Task with bad status",
                  "status": "INVALID_STATUS"
                }
                """;

        // When & Then: POST /api/tasks returns 400 (Bad Request)
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(taskJson))
                .andExpect(status().isBadRequest());
    }

    // ===================== UPDATE TESTS =====================
    @Test
    void testUpdateTask_Success() throws Exception {
        // Given: A task exists in the database
        Task saved = taskRepository.save(testTask);

        String updateJson = """
                {
                  "title": "Updated Task Title",
                  "description": "Updated description",
                  "status": "IN_PROGRESS",
                  "dueDate": "2026-01-15"
                }
                """;

        // When & Then: PUT /api/tasks/{id} updates and returns the task
        mockMvc.perform(put("/api/tasks/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", equalTo(saved.getId().intValue())))
                .andExpect(jsonPath("$.title", equalTo("Updated Task Title")))
                .andExpect(jsonPath("$.description", equalTo("Updated description")))
                .andExpect(jsonPath("$.status", equalTo("IN_PROGRESS")));
    }

    @Test
    void testUpdateTask_PartialUpdate() throws Exception {
        // Given: A task exists in the database
        Task saved = taskRepository.save(testTask);

        String updateJson = """
                {
                  "title": "New Title",
                  "description": null,
                  "status": "DONE",
                  "dueDate": null
                }
                """;

        // When & Then: PUT /api/tasks/{id} updates only specified fields
        mockMvc.perform(put("/api/tasks/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", equalTo("New Title")))
                .andExpect(jsonPath("$.status", equalTo("DONE")));
    }

    @Test
    void testUpdateTask_NotFound() throws Exception {
        // Given: No task with ID 999 exists
        String updateJson = """
                {
                  "title": "Should Not Update",
                  "status": "TODO"
                }
                """;

        // When & Then: PUT /api/tasks/999 returns 404
        mockMvc.perform(put("/api/tasks/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateTask_InvalidData() throws Exception {
        // Given: A task exists in the database
        Task saved = taskRepository.save(testTask);

        String updateJson = """
                {
                  "title": "",
                  "status": "TODO"
                }
                """;

        // When & Then: PUT /api/tasks/{id} returns 400 for invalid data
        mockMvc.perform(put("/api/tasks/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateTask_TitleTooLong() throws Exception {
        // Given: A task exists in the database
        Task saved = taskRepository.save(testTask);
        String longTitle = "a".repeat(101);

        String updateJson = """
                {
                  "title": "%s",
                  "status": "TODO"
                }
                """.formatted(longTitle);

        // When & Then: PUT /api/tasks/{id} returns 400
        mockMvc.perform(put("/api/tasks/" + saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
                .andExpect(status().isBadRequest());
    }

    // ===================== DELETE TESTS =====================
    @Test
    void testDeleteTask_Success() throws Exception {
        // Given: A task exists in the database
        Task saved = taskRepository.save(testTask);

        // When: DELETE /api/tasks/{id}
        mockMvc.perform(delete("/api/tasks/" + saved.getId()))
                .andExpect(status().isNoContent());

        // Then: Task is removed from database
        mockMvc.perform(get("/api/tasks/" + saved.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void testDeleteTask_NotFound() throws Exception {
        // Given: No task with ID 999 exists
        // When & Then: DELETE /api/tasks/999 returns 404
        mockMvc.perform(delete("/api/tasks/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testDeleteTask_MultipleDeletes() throws Exception {
        // Given: Two tasks exist in the database
        Task task1 = taskRepository.save(testTask);
        
        Task task2 = new Task();
        task2.setTitle("Second Task");
        task2.setStatus(TaskStatus.IN_PROGRESS);
        Task saved2 = taskRepository.save(task2);

        // When: Delete the first task
        mockMvc.perform(delete("/api/tasks/" + task1.getId()))
                .andExpect(status().isNoContent());

        // Then: First task is gone, second remains
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", equalTo(saved2.getId().intValue())));
    }

    // ===================== INTEGRATION TESTS =====================
    @Test
    void testFullCRUDCycle() throws Exception {
        // CREATE
        String createJson = """
                {
                  "title": "Integration Test Task",
                  "description": "Testing full CRUD cycle",
                  "status": "TODO",
                  "dueDate": "2025-12-25"
                }
                """;

        String createResponse = mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extract ID from response (simple extraction for test)
        long taskId = taskRepository.findAll().get(0).getId();

        // READ
        mockMvc.perform(get("/api/tasks/" + taskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", equalTo("Integration Test Task")));

        // UPDATE
        String updateJson = """
                {
                  "title": "Updated Integration Test Task",
                  "description": "Updated description",
                  "status": "IN_PROGRESS",
                  "dueDate": "2026-01-01"
                }
                """;

        mockMvc.perform(put("/api/tasks/" + taskId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", equalTo("Updated Integration Test Task")))
                .andExpect(jsonPath("$.status", equalTo("IN_PROGRESS")));

        // DELETE
        mockMvc.perform(delete("/api/tasks/" + taskId))
                .andExpect(status().isNoContent());

        // Verify deletion
        mockMvc.perform(get("/api/tasks/" + taskId))
                .andExpect(status().isNotFound());
    }
}
