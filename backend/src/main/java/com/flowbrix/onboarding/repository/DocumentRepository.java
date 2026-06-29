package com.flowbrix.onboarding.repository;

import com.flowbrix.onboarding.model.Document;
import com.flowbrix.onboarding.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUser(User user);
}
