package com.toolforge.tools;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Mirrors the execute_mongo_query and get_collection_names tools in agentService.js.
 */
@Component
public class MongoTools {

    @Value("${spring.data.mongodb.uri:mongodb://127.0.0.1:27017/toolforge}")
    private String mongoUri;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MongoDatabase getDatabase() {
        MongoClient client = MongoClients.create(mongoUri);
        String dbName = mongoUri.contains("/") ? mongoUri.substring(mongoUri.lastIndexOf('/') + 1).split("\\?")[0] : "toolforge";
        return client.getDatabase(dbName);
    }

    /**
     * Returns all collection names in the database.
     * Always call this first before querying to discover available data.
     */
    @Tool(description = "Returns all collection names in the MongoDB database. Always call this first before querying to discover available data.")
    public String getCollectionNames() {
        try {
            MongoDatabase db = getDatabase();
            List<String> names = new ArrayList<>();
            db.listCollectionNames().forEach(names::add);
            return objectMapper.writeValueAsString(names);
        } catch (Exception e) {
            return "MongoDB Error: " + e.getMessage();
        }
    }

    /**
     * Executes a find query on a MongoDB collection.
     *
     * @param collectionName  The collection to query
     * @param queryJson       A JSON string representing the MongoDB filter, e.g. {} or {"status":"active"}
     */
    @Tool(description = "Executes a find query on a MongoDB collection and returns up to 5 documents. collectionName is the collection to query. queryJson is a JSON filter string e.g. {} for all docs or {\"status\":\"active\"}.")
    public String executeMongoQuery(String collectionName, String queryJson) {
        try {
            MongoDatabase db = getDatabase();
            MongoCollection<Document> collection = db.getCollection(collectionName);
            Document filter = Document.parse(queryJson != null ? queryJson : "{}");
            List<Map<String, Object>> results = new ArrayList<>();
            collection.find(filter).limit(5).forEach(doc -> {
                Map<String, Object> map = doc;
                if (map.containsKey("_id")) map.put("_id", map.get("_id").toString());
                results.add(map);
            });
            return results.isEmpty() ? "No documents found." : objectMapper.writeValueAsString(results);
        } catch (Exception e) {
            return "MongoDB Error: " + e.getMessage();
        }
    }
}
