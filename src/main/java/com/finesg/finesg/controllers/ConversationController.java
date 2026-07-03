package com.finesg.finesg.controllers;

import com.finesg.finesg.dto.ConversationResponse;
import com.finesg.finesg.entity.Conversation;
import com.finesg.finesg.entity.User;
import com.finesg.finesg.repository.ConversationRepository;
import com.finesg.finesg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getAll(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        List<ConversationResponse> list = conversationRepository
                .findByOwnerIdOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(c -> new ConversationResponse(c.getId(), c.getTitle(), c.getCreatedAt(), c.getUpdatedAt()))
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<ConversationResponse> create(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Conversation conversation = new Conversation();
        conversation.setOwner(user);
        conversationRepository.save(conversation);
        return ResponseEntity.ok(new ConversationResponse(
                conversation.getId(), conversation.getTitle(),
                conversation.getCreatedAt(), conversation.getUpdatedAt()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Conversation conversation = conversationRepository.findById(id).orElseThrow();
        if (!conversation.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        conversationRepository.delete(conversation);
        return ResponseEntity.ok("Deleted");
    }
}
