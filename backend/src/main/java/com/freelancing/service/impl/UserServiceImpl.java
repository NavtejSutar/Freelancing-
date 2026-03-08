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
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public UserResponse getCurrentUser(Long userId) {
        User user = findUserById(userId);
        return modelMapper.map(user, UserResponse.class);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUser(Long userId, UpdateUserRequest request) {
        User user = findUserById(userId);

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        user = userRepository.save(user);
        return modelMapper.map(user, UserResponse.class);
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
        return userRepository.findAll(pageable)
                .map(user -> modelMapper.map(user, UserResponse.class));
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = findUserById(id);
        return modelMapper.map(user, UserResponse.class);
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

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}
