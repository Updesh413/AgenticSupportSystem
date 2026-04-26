package com.agenticsupport.controller;

import com.agenticsupport.domain.Ticket;
import com.agenticsupport.dto.TicketRequest;
import com.agenticsupport.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/customer")
    public ResponseEntity<List<Ticket>> getCustomerTickets(@RequestParam String email) {
        return ResponseEntity.ok(ticketService.getTicketsByEmail(email));
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody TicketRequest request) {
        Ticket ticket = ticketService.createTicket(request.getEmail(), request.getQuery());
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Ticket> resolveTicket(
            @PathVariable UUID id, 
            @RequestBody Map<String, String> body) {
        String notes = body.get("resolutionNotes");
        return ResponseEntity.ok(ticketService.updateTicket(id, notes, Ticket.TicketStatus.RESOLVED));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }
}
