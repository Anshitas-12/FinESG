package com.finesg.finesg.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class ConversationResponse {
    private Long id;
    private String title;
    private Instant createdAt;
    private Instant updatedAt;
}
