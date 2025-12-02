package com.example.taskmanager.controller;

import com.example.taskmanager.model.Task;
import com.example.taskmanager.repository.TaskRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private final TaskRepository repository;

    public TaskController(TaskRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Task> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getById(@PathVariable Long id) {
        Optional<Task> t = repository.findById(id);
        return t.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Task> create(@Valid @RequestBody Task task) {
        Task saved = repository.save(task);
        return ResponseEntity.created(URI.create("/api/tasks/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> update(@PathVariable Long id, @Valid @RequestBody Task incoming) {
        return repository.findById(id).map(existing -> {
            existing.setTitle(incoming.getTitle());
            existing.setDescription(incoming.getDescription());
            existing.setStatus(incoming.getStatus());
            existing.setDueDate(incoming.getDueDate());
            Task saved = repository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repository.findById(id).map(t -> {
            repository.deleteById(id);
            return ResponseEntity.noContent().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
