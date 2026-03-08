package com.freelancing.controller;

import com.freelancing.dto.request.CreateThreadRequest;
import com.freelancing.dto.request.SendMessageRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.MessageResponse;
import com.freelancing.dto.response.MessageThreadResponse;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/threads")
    public ResponseEntity<ApiResponse<Page<MessageThreadResponse>>> getThreads(
            @AuthenticationPrincipal CustomUserDetails userDetails, Pageable pageable) {
        Page<MessageThreadResponse> response = messageService.getThreads(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/threads/{threadId}")
    public ResponseEntity<ApiResponse<MessageThreadResponse>> getThreadById(@PathVariable Long threadId) {
        MessageThreadResponse response = messageService.getThreadById(threadId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/threads")
    public ResponseEntity<ApiResponse<MessageThreadResponse>> createThread(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateThreadRequest request) {
        MessageThreadResponse response = messageService.createThread(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Thread created", response));
    }

    @GetMapping("/threads/{threadId}/messages")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> getMessages(
            @PathVariable Long threadId, Pageable pageable) {
        Page<MessageResponse> response = messageService.getMessages(threadId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/threads/{threadId}/messages")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @PathVariable Long threadId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody SendMessageRequest request) {
        MessageResponse response = messageService.sendMessage(threadId, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable Long messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.ok(ApiResponse.success("Message deleted", null));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<ApiResponse<List<MessageThreadResponse>>> getThreadsByContract(
            @PathVariable Long contractId) {
        List<MessageThreadResponse> response = messageService.getThreadsByContract(contractId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
