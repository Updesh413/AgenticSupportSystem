package com.agenticsupport.repository;

import com.agenticsupport.domain.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findAllByOrderByCreatedAtDesc();
    List<Ticket> findAllByCustomerEmailOrderByCreatedAtDesc(String email);
}
