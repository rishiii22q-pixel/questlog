package com.questlog.config;

import com.questlog.entity.User;
import com.questlog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial users...");
            User defaultUser1 = new User();
            defaultUser1.setUsername("student_pro");
            defaultUser1.setEmail("student@questlog.app");
            defaultUser1.setDreamGoal("Master Full-Stack & Crack Dream Job");
            defaultUser1.setCurrentXp(120);
            defaultUser1.setCurrentLevel(2);
            userRepository.save(defaultUser1);

            User defaultUser2 = new User();
            defaultUser2.setUsername("quest_user");
            defaultUser2.setEmail("user@questlog.app");
            defaultUser2.setDreamGoal("Achieve Daily Consistency");
            defaultUser2.setCurrentXp(50);
            defaultUser2.setCurrentLevel(1);
            userRepository.save(defaultUser2);
            log.info("Default users seeded (ID: 1, 2)");
        }
    }
}
