package com.agenticsupport.strategy;

import com.agenticsupport.domain.Ticket;
import com.agenticsupport.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component("HUMAN_ESCALATION")
@RequiredArgsConstructor
@Slf4j
public class HumanEscalationStrategy implements ResolutionStrategy {

    private final TicketRepository ticketRepository;

    @Override
    public void apply(Ticket ticket, String result) {
        log.info("Applying Human-Escalation strategy for ticket: {}", ticket.getId());
        ticket.setStatus(Ticket.TicketStatus.ESCALATED_TO_HUMAN);
        ticket.setResolutionNotes(result);
        ticketRepository.save(ticket);
    }
}
