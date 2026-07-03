package com.finesg.finesg.service;


import com.finesg.finesg.entity.Conversation;
import com.finesg.finesg.entity.Message;
import com.finesg.finesg.repository.ConversationRepository;
import com.finesg.finesg.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatClient chatClient;
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ContextService contextService;

    private static final String SYSTEM_PROMPT = """
            You are FinESG, an expert AI assistant specialized in Environmental, Social, 
            and Governance (ESG) analysis and sustainable finance. Help users understand 
            ESG metrics, reporting frameworks, and sustainability performance.
            """;

    public String chat(Conversation conversation, String userInput) {
        // save user message
        Message userMessage = new Message();
        userMessage.setConversation(conversation);
        userMessage.setRole("user");
        userMessage.setContent(userInput);
        messageRepository.save(userMessage);

        // fetch and trim history
        List<Message> history = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<Message> trimmed = contextService.trimToTokenBudget(history);

        // build Spring AI message list
        List<org.springframework.ai.chat.messages.Message> aiMessages = new ArrayList<>();
        aiMessages.add(new SystemMessage(SYSTEM_PROMPT));
        for (Message msg : trimmed) {
            if (msg.getRole().equals("user")) {
                aiMessages.add(new UserMessage(msg.getContent()));
            } else {
                aiMessages.add(new AssistantMessage(msg.getContent()));
            }
        }

        // call LM Studio
        String response = chatClient.prompt(new Prompt(aiMessages))
                .call()
                .content();

        // save assistant message
        Message assistantMessage = new Message();
        assistantMessage.setConversation(conversation);
        assistantMessage.setRole("assistant");
        assistantMessage.setContent(response);
        messageRepository.save(assistantMessage);

        // update conversation timestamp
        conversation.touch();
        conversationRepository.save(conversation);

        return response;
    }
}
