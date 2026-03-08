package com.freelancing.service.impl;

import com.freelancing.dto.request.CreateThreadRequest;
import com.freelancing.dto.request.SendMessageRequest;
import com.freelancing.dto.response.MessageResponse;
import com.freelancing.dto.response.MessageThreadResponse;
import com.freelancing.dto.response.UserResponse;
import com.freelancing.entity.Contract;
import com.freelancing.entity.Message;
import com.freelancing.entity.MessageThread;
import com.freelancing.entity.User;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.ContractRepository;
import com.freelancing.repository.MessageRepository;
import com.freelancing.repository.MessageThreadRepository;
import com.freelancing.repository.UserRepository;
import com.freelancing.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageThreadRepository threadRepo;
    private final MessageRepository messageRepo;
    private final UserRepository userRepo;
    private final ContractRepository contractRepo;
    private final ModelMapper modelMapper;

    @Override
    public Page<MessageThreadResponse> getThreads(Long userId, Pageable pageable) {
        return threadRepo.findByParticipantId(userId, pageable).map(this::mapThreadToResponse);
    }

    @Override
    public MessageThreadResponse getThreadById(Long threadId) {
        MessageThread thread = threadRepo.findById(threadId)
                .orElseThrow(() -> new ResourceNotFoundException("MessageThread", "id", threadId));
        return mapThreadToResponse(thread);
    }

    @Override
    @Transactional
    public MessageThreadResponse createThread(Long userId, CreateThreadRequest request) {
        User creator = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Set<User> participants = new HashSet<>();
        participants.add(creator);
        if (request.getParticipantIds() != null) {
            for (Long pid : request.getParticipantIds()) {
                User participant = userRepo.findById(pid)
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", pid));
                participants.add(participant);
            }
        }

        MessageThread thread = MessageThread.builder()
                .subject(request.getSubject())
                .lastMessageAt(LocalDateTime.now())
                .participants(participants)
                .build();

        if (request.getContractId() != null) {
            Contract contract = contractRepo.findById(request.getContractId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", request.getContractId()));
            thread.setContract(contract);
        }

        thread = threadRepo.save(thread);
        return mapThreadToResponse(thread);
    }

    @Override
    public Page<MessageResponse> getMessages(Long threadId, Pageable pageable) {
        return messageRepo.findByThreadIdOrderBySentAtAsc(threadId, pageable).map(this::mapMessageToResponse);
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(Long threadId, Long senderId, SendMessageRequest request) {
        MessageThread thread = threadRepo.findById(threadId)
                .orElseThrow(() -> new ResourceNotFoundException("MessageThread", "id", threadId));
        User sender = userRepo.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", senderId));

        Message message = Message.builder()
                .content(request.getContent())
                .attachmentUrl(request.getAttachmentUrl())
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .thread(thread)
                .sender(sender)
                .build();

        thread.setLastMessageAt(LocalDateTime.now());
        threadRepo.save(thread);

        message = messageRepo.save(message);
        return mapMessageToResponse(message);
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId) {
        Message message = messageRepo.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", messageId));
        messageRepo.delete(message);
    }

    @Override
    public List<MessageThreadResponse> getThreadsByContract(Long contractId) {
        return threadRepo.findByContractId(contractId).stream()
                .map(this::mapThreadToResponse)
                .collect(Collectors.toList());
    }

    private MessageThreadResponse mapThreadToResponse(MessageThread thread) {
        Set<UserResponse> participantResponses = thread.getParticipants().stream()
                .map(u -> modelMapper.map(u, UserResponse.class))
                .collect(Collectors.toSet());

        MessageResponse lastMessage = null;
        List<Message> messages = thread.getMessages();
        if (messages != null && !messages.isEmpty()) {
            Message last = messages.get(messages.size() - 1);
            lastMessage = mapMessageToResponse(last);
        }

        return MessageThreadResponse.builder()
                .id(thread.getId())
                .subject(thread.getSubject())
                .lastMessageAt(thread.getLastMessageAt())
                .contractId(thread.getContract() != null ? thread.getContract().getId() : null)
                .participants(participantResponses)
                .lastMessage(lastMessage)
                .createdAt(thread.getCreatedAt())
                .build();
    }

    private MessageResponse mapMessageToResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .attachmentUrl(message.getAttachmentUrl())
                .isRead(message.isRead())
                .sentAt(message.getSentAt())
                .threadId(message.getThread().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFirstName() + " " + message.getSender().getLastName())
                .senderAvatar(message.getSender().getAvatarUrl())
                .build();
    }
}
