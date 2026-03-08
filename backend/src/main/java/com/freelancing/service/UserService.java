package com.freelancing.service;

import com.freelancing.dto.request.UpdateUserRequest;
import com.freelancing.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse getCurrentUser(Long userId);
    UserResponse updateCurrentUser(Long userId, UpdateUserRequest request);
    void deactivateAccount(Long userId);
    Page<UserResponse> getAllUsers(Pageable pageable);
    UserResponse getUserById(Long id);
    void banUser(Long id);
    void unbanUser(Long id);
}
