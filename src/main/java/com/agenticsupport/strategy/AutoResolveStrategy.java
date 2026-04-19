package com.agenticsupport.strategy;

import com.agenticsupport.domain.Ticket;
import com.agenticsupport.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component("AUTO_RESOLVE")
@RequiredArgsConstructor
@Slf4j
public class AutoResolveStrategy implements ResolutionStrategy {

    private final TicketRepository ticketRepository;

    @Override
    public void apply(Ticket ticket, String result) {
        log.info("Applying Auto-Resolve strategy for ticket: {}", ticket.getId());
        ticket.setStatus(Ticket.TicketStatus.RESOLVED);
        ticket.setResolutionNotes(result);
        ticketRepository.save(ticket);
    }
}
