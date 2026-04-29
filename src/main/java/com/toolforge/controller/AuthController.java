package com.toolforge.controller;

import com.toolforge.dto.AuthDto;
import com.toolforge.model.User;
import com.toolforge.security.JwtUtils;
import com.toolforge.service.UserService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Handles all authentication endpoints.
 * Mirrors the routes in auth.js: /api/login, /api/signup, /api/logout, /api/me,
 * /auth/google, /auth/google/callback.
 *
 * NOTE: For Google OAuth2 the callback is handled by Spring Security's OAuth2
 * login mechanism. The /auth/google route triggers the OAuth2 redirect.
 * Configure spring.security.oauth2.client.registration.google.* in application.properties.
 */
@RestController
public class AuthController {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final UserService userService;
    private final JwtUtils jwtUtils;

    public AuthController(UserService userService, JwtUtils jwtUtils) {
        this.userService = userService;
        this.jwtUtils = jwtUtils;
    }

    // ──── GET /api/me ────────────────────────────────────────────────────────
    /**
     * Returns the currently authenticated user from the JWT.
     * Mirrors GET /api/me in auth.js.
     */
    @GetMapping("/api/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal Claims claims) {
        if (claims == null) {
            return ResponseEntity.status(401).body(Map.of("message", "No token provided"));
        }
        return ResponseEntity.ok(Map.of("user", claims));
    }

    // ──── POST /api/login ─────────────────────────────────────────────────────
    @PostMapping("/api/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginRequest req) {
        Optional<User> userOpt = userService.authenticate(req.getUsername(), req.getPassword());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        User user = userOpt.get();
        String token = jwtUtils.generateToken(user);

        AuthDto.AuthResponse resp = new AuthDto.AuthResponse();
        resp.setToken(token);
        resp.setUser(toUserResponse(user));
        return ResponseEntity.ok(resp);
    }

    // ──── POST /api/signup ────────────────────────────────────────────────────
    @PostMapping("/api/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody AuthDto.SignupRequest req) {
        try {
            userService.register(
                    req.getName(),
                    req.getUsername(),
                    req.getEmail(),
                    req.getPassword(),
                    req.getConfirmPassword()
            );
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Account created! Please log in."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ──── POST /api/logout ────────────────────────────────────────────────────
    /**
     * JWT is stateless — just tell the client to delete the token.
     * Mirrors POST /api/logout in auth.js.
     */
    @PostMapping("/api/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out"));
    }

    // ──── Google OAuth ─────────────────────────────────────────────────────────
    /**
     * Spring Security's OAuth2 auto-configures the /oauth2/authorization/google redirect.
     * The callback (/auth/google/callback) is also handled automatically.
     *
     * To replicate the original /auth/google path, add this redirect convenience route,
     * or configure security to map it via spring.security.oauth2 properties.
     */
    @GetMapping("/auth/google")
    public ResponseEntity<?> googleOAuthRedirect() {
        // Redirect to Spring Security's built-in OAuth2 initiation endpoint
        return ResponseEntity.status(302)
                .header("Location", "/oauth2/authorization/google")
                .build();
    }

    // ──── Health ──────────────────────────────────────────────────────────────
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // ──── Webhook (DevOps demo) ───────────────────────────────────────────────
    @PostMapping("/api/webhook")
    public ResponseEntity<?> webhook(@RequestBody(required = false) Map<String, Object> payload) {
        System.out.println("🔔 Webhook Payload Received: " + payload);
        return ResponseEntity.ok(Map.of("success", true, "message", "Webhook received successfully!"));
    }

    // ──── Helper ──────────────────────────────────────────────────────────────
    private AuthDto.UserResponse toUserResponse(User user) {
        AuthDto.UserResponse r = new AuthDto.UserResponse();
        r.setId(user.getId());
        r.setName(user.getName());
        r.setUsername(user.getUsername());
        r.setEmail(user.getEmail());
        r.setAvatar(user.getAvatar());
        r.setGoogleId(user.getGoogleId());
        return r;
    }
}
