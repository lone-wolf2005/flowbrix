package com.flowbrix.onboarding.repository;

import com.flowbrix.onboarding.model.Asset;
import com.flowbrix.onboarding.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByUser(User user);
}
