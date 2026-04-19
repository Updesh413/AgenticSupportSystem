package com.agenticsupport.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String query;
}
