package com.toolforge.tools;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Mirrors the execute_http_request tool in agentService.js.
 */
@Component
public class HttpTools {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Makes a real HTTP GET request to a public API URL and returns the actual response data.
     *
     * @param url The full API URL to call
     */
    @Tool(description = "Makes a real HTTP GET request to a public API URL and returns the actual response data. Use this when you need to call an external REST API.")
    public String executeHttpRequest(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return "Request failed with status: " + response.statusCode();
            }

            // If JSON array, limit to 5 items
            JsonNode node = objectMapper.readTree(response.body());
            if (node.isArray() && node.size() > 5) {
                var limited = objectMapper.createArrayNode();
                for (int i = 0; i < 5; i++) limited.add(node.get(i));
                return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(limited);
            }
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return "HTTP request interrupted";
        } catch (Exception e) {
            return "HTTP Request failed: " + e.getMessage();
        }
    }
}
