package com.toolforge.service;

import com.toolforge.dto.AgentDto;
import com.toolforge.tools.HttpTools;
import com.toolforge.tools.MongoTools;
import com.toolforge.tools.SlackTools;
import com.toolforge.tools.TavilyTools;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Full replacement for agentService.js using Spring AI.
 *
 * This replicates:
 *  - createReactAgent() with tool-calling loop
 *  - All 6 agent system prompts (AGENT_PROMPTS)
 *  - All 4 tools: getCollectionNames, executeMongoQuery, executeHttpRequest,
 *                 sendSlackNotification, searchWeb (Tavily)
 *  - 45-second timeout
 *  - Response shape { output, steps }
 *
 * Spring AI automatically handles the ReAct-style tool-calling loop:
 *   LLM → decides to call a tool → tool executes → result fed back → LLM continues
 */
@Service
public class AgentService {

    private static final Logger log = LoggerFactory.getLogger(AgentService.class);

    /** Mirrors AGENT_PROMPTS in agent.js */
    private static final Map<String, String> AGENT_PROMPTS = Map.of(
        "research",
            """
            You are a Web Research Agent powered by Groq Llama 3.3.
            For MOST questions, answer directly from your training knowledge.
            ONLY call the searchWeb tool when the user explicitly asks for current events,
            live prices, today's news, or real-time web information.
            Give thorough, well-structured answers. If you use search, cite the sources briefly.""",

        "mongodb",
            """
            You are a MongoDB Query Generator Agent powered by Groq Llama 3.3.
            When the user asks to query data, FIRST call getCollectionNames to discover collections,
            THEN call executeMongoQuery with the collection and filter.
            ALWAYS show the equivalent MongoDB Shell query in your final answer using:
            ```mongodb
            db.collection.find({...})
            ```
            For date ranges use: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            For general MongoDB questions (no actual query needed), answer from knowledge without calling tools.""",

        "codereview",
            """
            You are an expert Code Review Agent powered by Groq Llama 3.3.
            Analyze the provided code carefully. Identify bugs, security vulnerabilities,
            performance issues, and bad practices.
            Structure your response as: 1) Summary 2) Issues Found 3) Improved Code 4) Explanation.
            Answer directly from your deep programming knowledge.""",

        "workflow",
            """
            You are a Workflow Automation Planner powered by Groq Llama 3.3.
            Help users design step-by-step automation workflows for their business goals.
            You can call executeHttpRequest to test live API endpoints if needed.
            You can call sendSlackNotification to send team alerts as part of a workflow demo.
            Structure your response as: 1) Workflow Overview 2) Step-by-Step Plan 3) Tools/Services 4) Pseudocode.""",

        "prompt",
            """
            You are an expert Prompt Engineering Agent powered by Groq Llama 3.3.
            Transform the user's raw prompt into an optimized, production-grade prompt.
            Structure your response as: 1) Analysis of original 2) Optimized Prompt 3) Why it's better 4) Variations.""",

        "api",
            """
            You are an API Integration Expert powered by Groq Llama 3.3.
            Generate complete, production-ready API integration code with error handling and retry logic.
            You can call executeHttpRequest to test a live endpoint and show real response data.
            Structure your response as: 1) Overview 2) Full Code Example 3) Error Handling 4) Testing Instructions."""
    );

    private static final String BASE_SYSTEM =
            "You are a highly capable AI agent. When calling tools, ensure your arguments are complete and valid. " +
            "Do not cut off your response early. Complete the full answer after using tools.";

    private final ChatClient chatClient;
    private final MongoTools mongoTools;
    private final HttpTools httpTools;
    private final SlackTools slackTools;
    private final TavilyTools tavilyTools;

    public AgentService(ChatClient.Builder chatClientBuilder,
                        MongoTools mongoTools,
                        HttpTools httpTools,
                        SlackTools slackTools,
                        TavilyTools tavilyTools) {
        // Build ChatClient with all tools registered
        // Spring AI will automatically handle the tool-calling loop
        this.mongoTools  = mongoTools;
        this.httpTools   = httpTools;
        this.slackTools  = slackTools;
        this.tavilyTools = tavilyTools;

        this.chatClient = chatClientBuilder
                .defaultTools(
                    MethodToolCallbackProvider.builder().toolObjects(mongoTools, httpTools, slackTools, tavilyTools).build()
                )
                .build();
    }

    /**
     * Run the selected agent — mirrors runAgent() in agentService.js.
     *
     * @param message    User's message
     * @param agentType  One of: research, mongodb, codereview, workflow, prompt, api
     * @param threadId   Conversation thread identifier (future: use for memory)
     */
    public AgentDto.AgentResponse runAgent(String message, String agentType, String threadId) {
        String agentSystemPrompt = AGENT_PROMPTS.getOrDefault(agentType,
                "You are a helpful AI assistant.");

        String fullSystemPrompt = BASE_SYSTEM + "\n\n" + agentSystemPrompt;

        log.debug("Running agent type={} threadId={}", agentType, threadId);

        // 45-second timeout — mirrors the Promise.race timeout in agentService.js
        CompletableFuture<String> future = CompletableFuture.supplyAsync(() ->
            chatClient.prompt()
                    .system(fullSystemPrompt)
                    .user(message)
                    .call()
                    .content()
        );

        String output;
        try {
            output = future.get(45, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            throw new RuntimeException(
                "Agent timed out after 45 seconds. The LLM may be overloaded — try again.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Agent interrupted", e);
        } catch (Exception e) {
            throw new RuntimeException("Agent error: " + e.getMessage(), e);
        }

        AgentDto.AgentResponse response = new AgentDto.AgentResponse();
        response.setOutput(output);
        response.setSteps(new ArrayList<>()); // Spring AI tool calls are handled internally
        return response;
    }
}
