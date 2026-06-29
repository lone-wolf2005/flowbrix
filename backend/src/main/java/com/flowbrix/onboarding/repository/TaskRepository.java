package com.flowbrix.onboarding.repository;

import com.flowbrix.onboarding.model.Task;
import com.flowbrix.onboarding.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUser(User user);
}
