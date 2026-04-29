package com.toolforge.security;

import com.toolforge.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Handles JWT creation and validation.
 * Mirrors the signToken() / requireAuth() logic from auth.js.
 */
@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        // Ensure key is at least 256 bits for HS256
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            return Keys.hmacShaKeyFor(padded);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Create a signed JWT for the given user (mirrors signToken in auth.js). */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("name", user.getName());
        claims.put("username", user.getUsername());
        claims.put("email", user.getEmail());
        claims.put("avatar", user.getAvatar());
        claims.put("googleId", user.getGoogleId());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getId())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    /** Extract all claims from a valid token. */
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Validate a token, returns false if expired or tampered. */
    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUserIdFromToken(String token) {
        return extractClaims(token).getSubject();
    }
}
