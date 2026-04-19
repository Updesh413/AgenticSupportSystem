package com.agenticsupport.service;

import com.agenticsupport.ai.CustomerSupportAgent;
import com.agenticsupport.domain.Ticket;
import com.agenticsupport.repository.TicketRepository;
import com.agenticsupport.strategy.ResolutionStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private CustomerSupportAgent agent;

    @Mock
    private ResolutionStrategy autoResolveStrategy;

    @Mock
    private ResolutionStrategy humanEscalationStrategy;

    private TicketService ticketService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        Map<String, ResolutionStrategy> strategies = new HashMap<>();
        strategies.put("AUTO_RESOLVE", autoResolveStrategy);
        strategies.put("HUMAN_ESCALATION", humanEscalationStrategy);
        
        ticketService = new TicketService(ticketRepository, agent, strategies);
    }

    @Test
    void testProcessTicket_AutoResolve() {
        // Arrange
        Ticket ticket = Ticket.builder()
                .id(UUID.randomUUID())
                .customerEmail("test@example.com")
                .query("Where is my order?")
                .status(Ticket.TicketStatus.OPEN)
                .build();

        when(agent.chat(anyString())).thenReturn("[DECISION: RESOLVED] Your order is shipped.");

        // Act
        ticketService.processTicket(ticket);

        // Assert
        verify(autoResolveStrategy).apply(eq(ticket), contains("RESOLVED"));
        verify(humanEscalationStrategy, never()).apply(any(), any());
    }

    @Test
    void testProcessTicket_Escalate() {
        // Arrange
        Ticket ticket = Ticket.builder()
                .id(UUID.randomUUID())
                .customerEmail("test@example.com")
                .query("I want a refund for no reason.")
                .status(Ticket.TicketStatus.OPEN)
                .build();

        when(agent.chat(anyString())).thenReturn("[DECISION: ESCALATED] I cannot process this refund.");

        // Act
        ticketService.processTicket(ticket);

        // Assert
        verify(humanEscalationStrategy).apply(eq(ticket), contains("ESCALATED"));
        verify(autoResolveStrategy, never()).apply(any(), any());
    }
}
