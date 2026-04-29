package com.toolforge.service;

import com.toolforge.model.User;
import com.toolforge.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Handles user business logic — mirrors the logic in POST /api/signup and Passport LocalStrategy.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new user. Throws IllegalArgumentException on validation failures.
     */
    public User register(String name, String username, String email,
                         String password, String confirmPassword) {
        if (!password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match.");
        }
        if (userRepository.existsByEmail(email.toLowerCase())) {
            throw new IllegalArgumentException("Email already registered.");
        }
        if (userRepository.existsByUsername(username.toLowerCase())) {
            throw new IllegalArgumentException("Username already taken.");
        }

        User user = new User(name, username.toLowerCase(), email.toLowerCase(),
                passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    /**
     * Authenticate a user by username + password.
     * Returns empty Optional if credentials are wrong.
     */
    public Optional<User> authenticate(String username, String rawPassword) {
        Optional<User> userOpt = userRepository.findByUsername(username.toLowerCase());
        if (userOpt.isEmpty()) return Optional.empty();

        User user = userOpt.get();
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            // Google-only account
            return Optional.empty();
        }
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            return Optional.empty();
        }
        return Optional.of(user);
    }

    /**
     * Find or create a user from Google OAuth profile.
     * Mirrors the GoogleStrategy verify callback.
     */
    public User findOrCreateGoogleUser(String googleId, String email,
                                        String displayName, String avatar) {
        // Already linked by Google ID
        Optional<User> byGoogleId = userRepository.findByGoogleId(googleId);
        if (byGoogleId.isPresent()) return byGoogleId.get();

        // Existing email account — link it
        Optional<User> byEmail = userRepository.findByEmail(email.toLowerCase());
        if (byEmail.isPresent()) {
            User user = byEmail.get();
            user.setGoogleId(googleId);
            user.setAvatar(avatar != null ? avatar : "");
            return userRepository.save(user);
        }

        // Brand new user
        String baseUsername = displayName.toLowerCase()
                .replaceAll("\\s+", "_")
                .replaceAll("[^a-z0-9_]", "");
        String finalUsername = baseUsername;
        int count = 1;
        while (userRepository.existsByUsername(finalUsername)) {
            finalUsername = baseUsername + count++;
        }

        User user = new User();
        user.setGoogleId(googleId);
        user.setName(displayName);
        user.setUsername(finalUsername);
        user.setEmail(email.toLowerCase());
        user.setAvatar(avatar != null ? avatar : "");
        return userRepository.save(user);
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }
}
