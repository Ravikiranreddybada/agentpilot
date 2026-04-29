package com.toolforge.security;

import com.toolforge.model.User;
import com.toolforge.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * After a successful Google OAuth2 login, generates a JWT and redirects to the frontend.
 * Mirrors the /auth/google/callback handler in auth.js.
 */
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final JwtUtils jwtUtils;
    private final UserService userService;

    public OAuth2SuccessHandler(JwtUtils jwtUtils, UserService userService) {
        this.jwtUtils = jwtUtils;
        this.userService = userService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String googleId = oAuth2User.getAttribute("sub");
        String email    = oAuth2User.getAttribute("email");
        String name     = oAuth2User.getAttribute("name");
        String avatar   = oAuth2User.getAttribute("picture");

        User user = userService.findOrCreateGoogleUser(googleId, email, name, avatar);
        String token = jwtUtils.generateToken(user);

        // Redirect to frontend with token in URL — same approach as auth.js
        response.sendRedirect(frontendUrl + "/dashboard?token=" + token);
    }
}
