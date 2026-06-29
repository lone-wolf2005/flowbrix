package com.flowbrix.onboarding.service;

import com.flowbrix.onboarding.model.Asset;
import com.flowbrix.onboarding.model.Document;
import com.flowbrix.onboarding.model.Task;
import com.flowbrix.onboarding.model.User;
import com.flowbrix.onboarding.repository.AssetRepository;
import com.flowbrix.onboarding.repository.DocumentRepository;
import com.flowbrix.onboarding.repository.TaskRepository;
import com.flowbrix.onboarding.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OnboardingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private QrCodeService qrCodeService;

    // 1. Employee Registration (usually by HR or self-registration)
    public User registerEmployee(String username, String email, String fullName, String tempPassword) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        User employee = User.builder()
                .username(username)
                .email(email)
                .fullName(fullName)
                .password(tempPassword) // simplified for demo
                .role("EMPLOYEE")
                .status("REGISTERED")
                .build();
        return userRepository.save(employee);
    }

    // Seed non-employee roles
    public void seedUserIfNotExist(String username, String password, String email, String fullName, String role) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = User.builder()
                    .username(username)
                    .password(password)
                    .email(email)
                    .fullName(fullName)
                    .role(role)
                    .status("ACTIVE")
                    .build();
            userRepository.save(user);
        }
    }

    // 2. Profile Completion (by Employee)
    public User completeProfile(Long userId, String phone, String address, String bankName, String bankAccountNumber) {
        User employee = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
        
        employee.setPhone(phone);
        employee.setAddress(address);
        employee.setBankName(bankName);
        employee.setBankAccountNumber(bankAccountNumber);
        
        // Advance status if registered
        if ("REGISTERED".equals(employee.getStatus())) {
            employee.setStatus("PROFILE_COMPLETED");
        }
        return userRepository.save(employee);
    }

    // 3. Document Upload (by Employee)
    public Document uploadDocument(Long userId, String name, String fileUrl) {
        User employee = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Document doc = Document.builder()
                .name(name)
                .fileUrl(fileUrl)
                .status("PENDING")
                .uploadedAt(LocalDateTime.now())
                .user(employee)
                .build();
        
        Document savedDoc = documentRepository.save(doc);

        // Update status to DOCS_UPLOADED once they upload at least one document
        if ("PROFILE_COMPLETED".equals(employee.getStatus())) {
            employee.setStatus("DOCS_UPLOADED");
            userRepository.save(employee);
        }
        
        return savedDoc;
    }

    // 4. Document Verification (by HR)
    public Document verifyDocument(Long docId, String status, String rejectionReason) {
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        doc.setStatus(status); // APPROVED or REJECTED
        if ("REJECTED".equals(status)) {
            doc.setRejectionReason(rejectionReason);
        } else {
            doc.setRejectionReason(null);
        }
        documentRepository.save(doc);

        // Check overall employee document status
        User employee = doc.getUser();
        List<Document> docs = documentRepository.findByUser(employee);
        
        boolean allApproved = !docs.isEmpty() && docs.stream().allMatch(d -> "APPROVED".equals(d.getStatus()));
        boolean anyRejected = docs.stream().anyMatch(d -> "REJECTED".equals(d.getStatus()));

        if (allApproved) {
            employee.setStatus("VERIFIED");
            userRepository.save(employee);
        } else if (anyRejected) {
            employee.setStatus("PROFILE_COMPLETED"); // roll back to let them update profile/re-upload
            userRepository.save(employee);
        }

        return doc;
    }

    // 5. Task Assignment (by Manager or HR)
    public Task assignTask(Long userId, String description, String assignedBy) {
        User employee = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Task task = Task.builder()
                .description(description)
                .assignedBy(assignedBy)
                .completed(false)
                .user(employee)
                .build();

        Task savedTask = taskRepository.save(task);

        if ("VERIFIED".equals(employee.getStatus())) {
            employee.setStatus("TASKS_ASSIGNED");
            userRepository.save(employee);
        }

        return savedTask;
    }

    // 6. Complete Task (by Employee)
    public Task completeTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        task.setCompleted(true);
        task.setCompletedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    // 7. Approve Onboarding (by Manager)
    public User approveOnboarding(Long userId) {
        User employee = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        // Check if all assigned tasks are completed
        List<Task> tasks = taskRepository.findByUser(employee);
        boolean allCompleted = tasks.stream().allMatch(Task::isCompleted);

        if (!allCompleted) {
            throw new IllegalStateException("Cannot approve onboarding. Some tasks are incomplete.");
        }

        employee.setStatus("APPROVED");
        return userRepository.save(employee);
    }

    // 8. Asset Allocation (by IT Support)
    public Asset allocateAsset(Long userId, String assetName, String serialNumber) {
        User employee = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        Asset asset = Asset.builder()
                .assetName(assetName)
                .serialNumber(serialNumber)
                .allocatedAt(LocalDateTime.now())
                .status("ALLOCATED")
                .user(employee)
                .build();

        Asset savedAsset = assetRepository.save(asset);

        // Advance status to ASSETS_ALLOCATED
        if ("APPROVED".equals(employee.getStatus())) {
            employee.setStatus("ASSETS_ALLOCATED");
            userRepository.save(employee);
        }

        // Check if we can automatically trigger final onboarding completion
        triggerOnboardingCompletion(employee);

        return savedAsset;
    }

    // 9. Onboarding Completion (Auto-triggered when assets are allocated and status is ASSETS_ALLOCATED)
    private void triggerOnboardingCompletion(User employee) {
        if ("ASSETS_ALLOCATED".equals(employee.getStatus())) {
            // Generate QR Code Identity
            String qrPayload = String.format("FLOWBRIX IDENTITY:\nID: %d\nName: %s\nEmail: %s\nRole: %s\nVerified: %s",
                    employee.getId(), employee.getFullName(), employee.getEmail(), employee.getRole(), LocalDateTime.now());
            
            String qrBase64 = qrCodeService.generateQrCodeBase64(qrPayload, 300, 300);
            employee.setQrCodeData(qrBase64);
            employee.setStatus("COMPLETED");
            userRepository.save(employee);

            // Simulate Email Notification
            System.out.println("=================================================");
            System.out.println("EMAIL SENT TO: " + employee.getEmail());
            System.out.println("SUBJECT: Welcome to Flowbrix! Your digital workspace is ready.");
            System.out.println("BODY: Hello " + employee.getFullName() + ",\n\n" +
                    "Congratulations! You have completed all onboarding stages. " +
                    "Your unique QR Code Identity has been generated and is attached to this email. " +
                    "Use this QR Code for workspace access and verification.\n\n" +
                    "Best regards,\nFlowbrix HR Operations Team");
            System.out.println("=================================================");
        }
    }

    // Helper: Find all employees
    public List<User> getAllEmployees() {
        return userRepository.findByRole("EMPLOYEE");
    }

    // Helper: Find details for dashboard
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<Document> getUserDocuments(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return documentRepository.findByUser(user);
    }

    public List<Task> getUserTasks(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return taskRepository.findByUser(user);
    }

    public List<Asset> getUserAssets(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return assetRepository.findByUser(user);
    }
}
