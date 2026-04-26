package com.agenticsupport.service;

import com.agenticsupport.ai.CustomerSupportAgent;
import com.agenticsupport.domain.Ticket;
import com.agenticsupport.repository.TicketRepository;
import com.agenticsupport.strategy.ResolutionStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CustomerSupportAgent agent;
    private final Map<String, ResolutionStrategy> strategies;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Ticket> getTicketsByEmail(String email) {
        return ticketRepository.findAllByCustomerEmailOrderByCreatedAtDesc(email);
    }

    @Transactional
    public Ticket updateTicket(UUID id, String resolutionNotes, Ticket.TicketStatus status) {
        Ticket ticket = getTicket(id);
        ticket.setResolutionNotes(resolutionNotes);
        ticket.setStatus(status);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket createTicket(String email, String query) {
        log.info("Creating new ticket for: {}", email);
        Ticket ticket = Ticket.builder()
                .customerEmail(email)
                .query(query)
                .status(Ticket.TicketStatus.OPEN)
                .build();
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Ensure AI processing starts ONLY after the ticket is committed to DB
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                CompletableFuture.runAsync(() -> processTicket(savedTicket));
            }
        });
        
        return savedTicket;
    }

    public void processTicket(Ticket ticket) {
        log.info("Agent processing ticket: {}", ticket.getId());
        
        try {
            // Update status to IN_PROGRESS
            ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
            ticketRepository.save(ticket);

            // Call LangChain4j Agent
            String aiResult = agent.chat(String.format("Customer Email: %s. Query: %s", 
                    ticket.getCustomerEmail(), ticket.getQuery()));
            
            log.info("Agent result: {}", aiResult);

            // Parse result for Decision
            ResolutionStrategy strategy;
            if (aiResult.contains("[DECISION: RESOLVED]")) {
                strategy = strategies.get("AUTO_RESOLVE");
            } else {
                strategy = strategies.get("HUMAN_ESCALATION");
            }

            strategy.apply(ticket, aiResult);

        } catch (Exception e) {
            log.error("Error during agent processing: {}", e.getMessage(), e);
            ticket.setStatus(Ticket.TicketStatus.ESCALATED_TO_HUMAN);
            ticket.setResolutionNotes("System Error during AI processing: " + e.getMessage());
            ticketRepository.save(ticket);
        }
    }

    public Ticket getTicket(UUID id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));
    }
}
