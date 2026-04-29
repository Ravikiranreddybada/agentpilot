package com.toolforge.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * User entity — mirrors the Mongoose User schema.
 */
@Data
@NoArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String phone = "";

    /** BCrypt-hashed password. Null for Google-only accounts. */
    private String password;

    /** Populated for Google OAuth sign-ins. */
    private String googleId;

    private String avatar = "";

    private Instant createdAt = Instant.now();

    public User(String name, String username, String email, String password) {
        this.name = name;
        this.username = username.toLowerCase();
        this.email = email.toLowerCase();
        this.password = password;
    }
}
