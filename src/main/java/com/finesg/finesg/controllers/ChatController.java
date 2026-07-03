package com.finesg.finesg.controllers;

import com.finesg.finesg.entity.Conversation;
import com.finesg.finesg.entity.Message;
import com.finesg.finesg.entity.User;
import com.finesg.finesg.repository.ConversationRepository;
import com.finesg.finesg.repository.MessageRepository;
import com.finesg.finesg.repository.UserRepository;
import com.finesg.finesg.service.ChatService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Data
    static class ChatRequest {
        private Long conversationId;
        private String message;
    }

    @Data
    @AllArgsConstructor
    static class ChatResponse {
        private String response;
        private Long conversationId;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request,
                                             Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow();

        if (!conversation.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        String response = chatService.chat(conversation, request.getMessage());
        return ResponseEntity.ok(new ChatResponse(response, conversation.getId()));
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long conversationId,
                                                     Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow();

        if (!conversation.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        List<Message> messages = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/upload")
    public ResponseEntity<ChatResponse> uploadPdf(@RequestParam("file") MultipartFile file,
                                                  @RequestParam("conversationId") Long conversationId,
                                                  Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
            Conversation conversation = conversationRepository.findById(conversationId).orElseThrow();

            if (!conversation.getOwner().getId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }

            // extract text from PDF using PDFBox
            PDDocument document = Loader.loadPDF(file.getBytes());
            PDFTextStripper stripper = new PDFTextStripper();
            String extractedText = stripper.getText(document);
            document.close();

            // run through same chat flow
            String prompt = "Analyze this document:\n\n" + extractedText;
            String response = chatService.chat(conversation, prompt);

            return ResponseEntity.ok(new ChatResponse(response, conversation.getId()));

        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
