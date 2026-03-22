package com.freelancing.service.impl;

import com.freelancing.dto.request.UpdateUserRequest;
import com.freelancing.dto.response.UserResponse;
import com.freelancing.entity.User;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.UserRepository;
import com.freelancing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    private UserResponse toResponse(User user) {
        UserResponse res = new UserResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setFirstName(user.getFirstName());
        res.setLastName(user.getLastName());
        res.setPhoneNumber(user.getPhoneNumber());
        res.setAvatarUrl(user.getAvatarUrl());
        res.setRole(user.getRole());
        res.setActive(user.isActive());
        res.setBanned(user.isBanned());
        res.setEmailVerified(user.isEmailVerified());
        res.setCreatedAt(user.getCreatedAt());
        return res;
    }

    @Override
    public UserResponse getCurrentUser(Long userId) {
        return toResponse(findUserById(userId));
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUser(Long userId, UpdateUserRequest request) {
        User user = findUserById(userId);

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deactivateAccount(Long userId) {
        User user = findUserById(userId);
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        List<UserResponse> responseList = new ArrayList<>();
        for (User user : userPage.getContent()) {
            responseList.add(toResponse(user));
        }
        return new PageImpl<>(responseList, pageable, userPage.getTotalElements());
    }

    @Override
    public UserResponse getUserById(Long id) {
        return toResponse(findUserById(id));
    }

    @Override
    @Transactional
    public void banUser(Long id) {
        User user = findUserById(id);
        user.setBanned(true);
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void unbanUser(Long id) {
        User user = findUserById(id);
        user.setBanned(false);
        user.setActive(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void verifyUser(Long id) {
        User user = findUserById(id);
        // Idempotent — silently succeed if already active
        if (!user.isActive()) {
            user.setActive(true);
            userRepository.save(user);
        }
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}