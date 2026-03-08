package com.freelancing.service;

import com.freelancing.dto.request.CreateThreadRequest;
import com.freelancing.dto.request.SendMessageRequest;
import com.freelancing.dto.response.MessageResponse;
import com.freelancing.dto.response.MessageThreadResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MessageService {
    Page<MessageThreadResponse> getThreads(Long userId, Pageable pageable);
    MessageThreadResponse getThreadById(Long threadId);
    MessageThreadResponse createThread(Long userId, CreateThreadRequest request);
    Page<MessageResponse> getMessages(Long threadId, Pageable pageable);
    MessageResponse sendMessage(Long threadId, Long senderId, SendMessageRequest request);
    void deleteMessage(Long messageId);
    List<MessageThreadResponse> getThreadsByContract(Long contractId);
}
