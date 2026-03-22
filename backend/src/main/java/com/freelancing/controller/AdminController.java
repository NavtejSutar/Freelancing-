package com.freelancing.controller;

import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.FreelancerProfileResponse;
import com.freelancing.dto.response.UserResponse;
import com.freelancing.entity.enums.VerificationStatus;
import com.freelancing.service.FreelancerService;
import com.freelancing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final FreelancerService freelancerService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers(pageable)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse<Void>> banUser(@PathVariable Long id) {
        userService.banUser(id);
        return ResponseEntity.ok(ApiResponse.success("User banned", null));
    }

    @PutMapping("/users/{id}/unban")
    public ResponseEntity<ApiResponse<Void>> unbanUser(@PathVariable Long id) {
        userService.unbanUser(id);
        return ResponseEntity.ok(ApiResponse.success("User unbanned", null));
    }

    @PutMapping("/users/{id}/verify")
    public ResponseEntity<ApiResponse<Void>> verifyUser(@PathVariable Long id) {
        userService.verifyUser(id);
        return ResponseEntity.ok(ApiResponse.success("User verified", null));
    }

    // ── Freelancer Aadhaar verification ──

    @GetMapping("/freelancers/pending")
    public ResponseEntity<ApiResponse<Page<FreelancerProfileResponse>>> getPendingVerifications(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                freelancerService.getFreelancersByVerificationStatus(VerificationStatus.PENDING, pageable)));
    }

    @PutMapping("/freelancers/{id}/verify")
    public ResponseEntity<ApiResponse<Void>> verifyFreelancer(@PathVariable Long id) {
        freelancerService.verifyFreelancer(id);
        return ResponseEntity.ok(ApiResponse.success("Freelancer verified", null));
    }

    @PutMapping("/freelancers/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectFreelancer(
            @PathVariable Long id,
            @RequestParam(required = false) String note) {
        freelancerService.rejectFreelancer(id, note);
        return ResponseEntity.ok(ApiResponse.success("Freelancer verification rejected", null));
    }
}