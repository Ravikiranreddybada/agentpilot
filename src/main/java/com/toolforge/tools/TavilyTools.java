package com.toolforge.tools;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Mirrors the Tavily TavilySearchResults tool in agentService.js.
 */
@Component
public class TavilyTools {

    @Value("${app.tavily.api-key:}")
    private String tavilyApiKey;

    @Value("${app.tavily.url:https://api.tavily.com/search}")
    private String tavilyUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Searches the web using Tavily for current/live information.
     * Only call this when the user explicitly asks for current events, live prices,
     * today's news, or real-time information.
     *
     * @param query The search query string
     */
    @Tool(description = "Searches the web for current, real-time information using Tavily. ONLY use this when the user explicitly asks for current events, live prices, today's news, or real-time web data. Do NOT use for general knowledge questions.")
    public String searchWeb(String query) {
        if (tavilyApiKey == null || tavilyApiKey.isBlank()) {
            return "TAVILY_API_KEY not configured. Cannot perform web search.";
        }
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("api_key", tavilyApiKey);
            requestBody.put("query", query);
            requestBody.put("max_results", 3);
            requestBody.put("include_answer", true);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(tavilyUrl))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode json = objectMapper.readTree(response.body());

            // Build a concise summary of results
            StringBuilder sb = new StringBuilder();
            if (json.has("answer")) {
                sb.append("Answer: ").append(json.get("answer").asText()).append("\n\n");
            }
            if (json.has("results")) {
                sb.append("Sources:\n");
                json.get("results").forEach(r -> {
                    sb.append("- ").append(r.path("title").asText())
                      .append(": ").append(r.path("url").asText())
                      .append("\n  ").append(r.path("content").asText(), 0,
                              Math.min(r.path("content").asText().length(), 200))
                      .append("...\n");
                });
            }
            return sb.toString();

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return "Web search interrupted";
        } catch (Exception e) {
            return "Web search failed: " + e.getMessage();
        }
    }
}
