package com.agenticsupport.strategy;

import com.agenticsupport.domain.Ticket;

public interface ResolutionStrategy {
    void apply(Ticket ticket, String result);
}
