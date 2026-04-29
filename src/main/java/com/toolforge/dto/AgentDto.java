package com.toolforge.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/** DTOs used by AgentController */
public class AgentDto {

    @Data
    public static class AutomateRequest {
        private String message;
        private String agentType;
        private String threadId;
    }

    @Data
    public static class GroqRequest {
        private String system;
        private List<Map<String, String>> messages;
        private Integer max_tokens;
    }

    @Data
    public static class AgentResponse {
        private String output;
        private List<Object> steps;
    }
}
