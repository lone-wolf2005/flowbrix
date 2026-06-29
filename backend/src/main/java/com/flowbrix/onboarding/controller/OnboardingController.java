package com.flowbrix.onboarding.controller;

import com.flowbrix.onboarding.model.Asset;
import com.flowbrix.onboarding.model.Document;
import com.flowbrix.onboarding.model.Task;
import com.flowbrix.onboarding.model.User;
import com.flowbrix.onboarding.service.OnboardingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow frontend access
public class OnboardingController {

    @Autowired
    private OnboardingService onboardingService;

    // Login simulation
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        try {
            // Very basic login implementation for prototype/demo
            List<User> allEmployees = onboardingService.getAllEmployees();
            // Check if matches standard seed accounts or registered employees
            if ("hr".equalsIgnoreCase(username) && "hr123".equals(password)) {
                return ResponseEntity.ok(Map.of("id", 999L, "username", "hr", "fullName", "HR Administrator", "role", "HR_ADMIN", "status", "ACTIVE"));
            } else if ("manager".equalsIgnoreCase(username) && "manager123".equals(password)) {
                return ResponseEntity.ok(Map.of("id", 998L, "username", "manager", "fullName", "Operations Manager", "role", "MANAGER", "status", "ACTIVE"));
            } else if ("it".equalsIgnoreCase(username) && "it123".equals(password)) {
                return ResponseEntity.ok(Map.of("id", 997L, "username", "it", "fullName", "IT Lead Support", "role", "IT_SUPPORT", "status", "ACTIVE"));
            }

            // Check db
            java.util.List<User> list = onboardingService.getAllEmployees();
            for (User u : list) {
                if (u.getUsername().equalsIgnoreCase(username) && u.getPassword().equals(password)) {
                    return ResponseEntity.ok(u);
                }
            }
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Register Employee
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        try {
            User user = onboardingService.registerEmployee(
                    data.get("username"),
                    data.get("email"),
                    data.get("fullName"),
                    data.get("password")
            );
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Fetch user dashboard aggregated details
    @GetMapping("/employee/{id}/details")
    public ResponseEntity<?> getEmployeeDetails(@PathVariable Long id) {
        try {
            User user = onboardingService.getUserById(id);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            List<Document> docs = onboardingService.getUserDocuments(id);
            List<Task> tasks = onboardingService.getUserTasks(id);
            List<Asset> assets = onboardingService.getUserAssets(id);

            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("documents", docs);
            response.put("tasks", tasks);
            response.put("assets", assets);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Complete Profile (Employee)
    @PostMapping("/employee/{id}/profile")
    public ResponseEntity<?> completeProfile(@PathVariable Long id, @RequestBody Map<String, String> data) {
        try {
            User user = onboardingService.completeProfile(
                    id,
                    data.get("phone"),
                    data.get("address"),
                    data.get("bankName"),
                    data.get("bankAccountNumber")
            );
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Upload Document (Employee)
    @PostMapping("/employee/{id}/upload-doc")
    public ResponseEntity<?> uploadDocument(@PathVariable Long id, @RequestBody Map<String, String> data) {
        try {
            Document doc = onboardingService.uploadDocument(
                    id,
                    data.get("name"),
                    data.get("fileUrl")
            );
            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Complete Task (Employee)
    @PostMapping("/employee/complete-task/{taskId}")
    public ResponseEntity<?> completeTask(@PathVariable Long taskId) {
        try {
            Task task = onboardingService.completeTask(taskId);
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // HR: Get all employees list
    @GetMapping("/hr/employees")
    public ResponseEntity<?> getAllEmployees() {
        try {
            List<User> list = onboardingService.getAllEmployees();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // HR: Verify a document
    @PostMapping("/hr/verify-doc/{docId}")
    public ResponseEntity<?> verifyDocument(@PathVariable Long docId, @RequestBody Map<String, String> data) {
        try {
            Document doc = onboardingService.verifyDocument(
                    docId,
                    data.get("status"), // APPROVED or REJECTED
                    data.get("rejectionReason")
            );
            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // HR / Manager: Assign Task
    @PostMapping("/hr/assign-task/{userId}")
    public ResponseEntity<?> assignTask(@PathVariable Long userId, @RequestBody Map<String, String> data) {
        try {
            Task task = onboardingService.assignTask(
                    userId,
                    data.get("description"),
                    data.get("assignedBy")
            );
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Manager: Approve Onboarding
    @PostMapping("/manager/approve/{userId}")
    public ResponseEntity<?> approveOnboarding(@PathVariable Long userId) {
        try {
            User user = onboardingService.approveOnboarding(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // IT Support: Allocate Asset
    @PostMapping("/it/allocate-asset/{userId}")
    public ResponseEntity<?> allocateAsset(@PathVariable Long userId, @RequestBody Map<String, String> data) {
        try {
            Asset asset = onboardingService.allocateAsset(
                    userId,
                    data.get("assetName"),
                    data.get("serialNumber")
            );
            return ResponseEntity.ok(asset);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
