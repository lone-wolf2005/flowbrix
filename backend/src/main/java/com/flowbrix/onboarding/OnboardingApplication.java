package com.flowbrix.onboarding;

import com.flowbrix.onboarding.service.OnboardingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class OnboardingApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnboardingApplication.class, args);
    }

    @Bean
    public CommandLineRunner demoData(OnboardingService onboardingService) {
        return args -> {
            // Seed administrative and operations accounts
            onboardingService.seedUserIfNotExist("hr", "hr123", "hr.admin@flowbrix.com", "HR Administrator", "HR_ADMIN");
            onboardingService.seedUserIfNotExist("manager", "manager123", "manager@flowbrix.com", "Operations Manager", "MANAGER");
            onboardingService.seedUserIfNotExist("it", "it123", "it.support@flowbrix.com", "IT Lead Support", "IT_SUPPORT");

            // Seed a starter employee account
            try {
                onboardingService.registerEmployee("john", "john.doe@flowbrix.com", "John Doe", "john123");
                System.out.println("Flowbrix: Seeded demo data successfully.");
            } catch (IllegalArgumentException e) {
                // Already seeded
            }
        };
    }
}
