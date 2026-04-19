package com.agenticsupport.ai;

import dev.langchain4j.agent.tool.Tool;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class SupportTools {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${n8n.webhook.base-url}")
    private String n8nBaseUrl;

    @Tool("Fetches the order status and details from the legacy ERP system using the customer's email or order ID.")
    public String checkOrderStatus(String email, String orderId) {
        log.info("Tool: Checking order status for email: {} and orderId: {}", email, orderId);
        
        // Construct n8n webhook URL
        String url = n8nBaseUrl + "/check-order";
        
        try {
            // In a real scenario, you'd send a POST with JSON
            Map<String, String> payload = Map.of("email", email, "orderId", orderId != null ? orderId : "");
            return restTemplate.postForObject(url, payload, String.class);
        } catch (Exception e) {
            log.error("Error calling n8n: {}", e.getMessage());
            return "Error: Could not retrieve order status from legacy system.";
        }
    }

    @Tool("Initiates a refund for a given order ID after validating eligibility.")
    public String initiateRefund(String orderId, String reason) {
        log.info("Tool: Initiating refund for order: {}. Reason: {}", orderId, reason);
        
        String url = n8nBaseUrl + "/initiate-refund";
        
        try {
            Map<String, String> payload = Map.of("orderId", orderId, "reason", reason);
            return restTemplate.postForObject(url, payload, String.class);
        } catch (Exception e) {
            log.error("Error calling n8n for refund: {}", e.getMessage());
            return "Error: Could not process refund in legacy system.";
        }
    }
}
