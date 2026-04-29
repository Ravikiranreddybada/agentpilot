package com.toolforge.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** DTOs used by AuthController — mirrors req.body shapes in auth.js */
public class AuthDto {

    @Data
    public static class LoginRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String password;
    }

    @Data
    public static class SignupRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Username is required")
        @Pattern(regexp = "^[a-zA-Z0-9_]+$",
                 message = "Username can only have letters, numbers, and underscores.")
        private String username;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters.")
        private String password;

        @NotBlank(message = "Please confirm your password")
        private String confirmPassword;
    }

    @Data
    public static class UserResponse {
        private String id;
        private String name;
        private String username;
        private String email;
        private String avatar;
        private String googleId;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private UserResponse user;
    }
}
