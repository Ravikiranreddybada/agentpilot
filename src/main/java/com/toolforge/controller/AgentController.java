package com.toolforge.controller;

import com.toolforge.dto.AgentDto;
import com.toolforge.service.AgentService;
import io.jsonwebtoken.Claims;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Agent endpoints — mirrors agent.js and the /api/agent proxy in auth.js.
 * All routes require a valid JWT.
 */
@RestController
@RequestMapping("/api")
public class AgentController {

    private final AgentService agentService;
    private final ChatClient chatClient;

    public AgentController(AgentService agentService, ChatClient.Builder chatClientBuilder) {
        this.agentService = agentService;
        // Simple chat client for the direct /api/agent proxy (no tools needed)
        this.chatClient = chatClientBuilder.build();
    }

    /**
     * POST /api/automate
     * Runs the selected agent type with tool-calling support.
     * Mirrors POST /automate in agent.js.
     */
    @PostMapping("/automate")
    public ResponseEntity<?> automate(
            @RequestBody AgentDto.AutomateRequest req,
            @AuthenticationPrincipal Claims claims) {

        if (req.getMessage() == null || req.getAgentType() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing message or agentType"));
        }

        String threadId = req.getThreadId() != null
                ? req.getThreadId()
                : "user-" + claims.get("id") + "-" + req.getAgentType();

        try {
            AgentDto.AgentResponse result = agentService.runAgent(
                    req.getMessage(), req.getAgentType(), threadId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/agent
     * Direct LLM proxy — mirrors the /api/agent route in auth.js.
     * Accepts { system, messages, max_tokens } and returns the LLM reply.
     */
    @PostMapping("/agent")
    public ResponseEntity<?> agentProxy(@RequestBody AgentDto.GroqRequest req) {
        try {
            var promptSpec = chatClient.prompt();

            if (req.getSystem() != null && !req.getSystem().isBlank()) {
                promptSpec = promptSpec.system(req.getSystem());
            }

            // Use the last user message as the user turn
            String userContent = "Hello";
            if (req.getMessages() != null && !req.getMessages().isEmpty()) {
                userContent = req.getMessages().stream()
                        .filter(m -> "user".equals(m.get("role")))
                        .reduce((a, b) -> b) // last user message
                        .map(m -> m.get("content"))
                        .orElse("Hello");
            }

            String text = promptSpec.user(userContent).call().content();

            // Mirror the original response shape: { content: [{ type: 'text', text }] }
            return ResponseEntity.ok(Map.of(
                    "content", List.of(Map.of("type", "text", "text", text))
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
