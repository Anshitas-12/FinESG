package com.finesg.finesg.service;

import com.finesg.finesg.entity.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ContextService {

    @Value("${app.context.max-tokens}")
    private int maxTokens;

    // rough approximation: 1 token ~ 4 characters
    private int estimateTokens(String text) {
        return text.length() / 4;
    }

    public List<Message> trimToTokenBudget(List<Message> messages) {
        int total = 0;
        List<Message> trimmed = new ArrayList<>();

        // iterate from most recent to oldest
        for (int i = messages.size() - 1; i >= 0; i--) {
            Message msg = messages.get(i);
            int tokens = estimateTokens(msg.getContent());
            if (total + tokens > maxTokens) break;
            total += tokens;
            trimmed.add(0, msg);
        }

        return trimmed;
    }
}
