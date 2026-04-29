package com.toolforge.tools;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Mirrors the send_slack_notification tool in agentService.js.
 */
@Component
public class SlackTools {

    @Value("${app.slack.webhook-url:}")
    private String slackWebhookUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Sends a Slack notification to the team channel.
     *
     * @param message The text message to post to Slack
     */
    @Tool(description = "Sends a Slack notification to the team. Input is the message text to post.")
    public String sendSlackNotification(String message) {
        if (slackWebhookUrl == null || slackWebhookUrl.isBlank()) {
            return "SLACK_WEBHOOK_URL not configured.";
        }
        try {
            String payload = String.format(
                    "{\"text\":\"%s\",\"username\":\"ToolForge Bot\",\"icon_emoji\":\":robot_face:\"}",
                    message.replace("\"", "\\\"")
            );
            String body = "payload=" + URLEncoder.encode(payload, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(slackWebhookUrl))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return "Slack notification sent successfully!";
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return "Slack notification interrupted";
        } catch (Exception e) {
            return "Failed to send Slack notification: " + e.getMessage();
        }
    }
}
