package com.questlog.service;

import com.questlog.dto.UserRequest;
import com.questlog.dto.UserResponse;
import com.questlog.entity.User;
import com.questlog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setDreamGoal(request.getDreamGoal());
        user.setCurrentXp(0);
        user.setCurrentLevel(1);
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = (id != null)
                ? userRepository.findById(id).orElseGet(this::getOrCreateFallbackUser)
                : getOrCreateFallbackUser();
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public void addXp(User user, int xp) {
        user.setCurrentXp(user.getCurrentXp() + xp);
        // Level up check
        while (user.getCurrentXp() >= user.getXpForNextLevel()) {
            user.setCurrentXp(user.getCurrentXp() - user.getXpForNextLevel());
            user.setCurrentLevel(user.getCurrentLevel() + 1);
        }
        userRepository.save(user);
    }

    public User getUserEntity(Long id) {
        if (id == null) {
            return getOrCreateFallbackUser();
        }
        return userRepository.findById(id).orElseGet(this::getOrCreateFallbackUser);
    }

    private User getOrCreateFallbackUser() {
        return userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User fallback = new User();
            fallback.setUsername("quest_user");
            fallback.setEmail("user@questlog.app");
            fallback.setDreamGoal("Achieve Daily Consistency");
            fallback.setCurrentXp(0);
            fallback.setCurrentLevel(1);
            return userRepository.save(fallback);
        });
    }

    public UserResponse toResponse(User user) {
        int xpForNext = user.getXpForNextLevel();
        int progressPercent = xpForNext > 0 ? (int) ((user.getCurrentXp() * 100.0) / xpForNext) : 100;
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .dreamGoal(user.getDreamGoal())
                .currentXp(user.getCurrentXp())
                .currentLevel(user.getCurrentLevel())
                .xpForNextLevel(xpForNext)
                .xpProgressPercent(progressPercent)
                .build();
    }
}
