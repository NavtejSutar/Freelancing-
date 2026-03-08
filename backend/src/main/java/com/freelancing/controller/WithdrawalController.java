package com.freelancing.controller;

import com.freelancing.dto.request.WithdrawalRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.WithdrawalResponse;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.WithdrawalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/withdrawals")
@RequiredArgsConstructor
public class WithdrawalController {

    private final WithdrawalService withdrawalService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<WithdrawalResponse>>> getWithdrawals(
            @AuthenticationPrincipal CustomUserDetails userDetails, Pageable pageable) {
        Page<WithdrawalResponse> response = withdrawalService.getWithdrawals(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WithdrawalResponse>> getWithdrawalById(@PathVariable Long id) {
        WithdrawalResponse response = withdrawalService.getWithdrawalById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<WithdrawalResponse>> requestWithdrawal(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody WithdrawalRequest request) {
        WithdrawalResponse response = withdrawalService.requestWithdrawal(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal requested", response));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WithdrawalResponse>> approveWithdrawal(@PathVariable Long id) {
        WithdrawalResponse response = withdrawalService.approveWithdrawal(id);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal approved", response));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WithdrawalResponse>> rejectWithdrawal(
            @PathVariable Long id, @RequestParam String adminNote) {
        WithdrawalResponse response = withdrawalService.rejectWithdrawal(id, adminNote);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal rejected", response));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<WithdrawalResponse>>> getPendingWithdrawals(Pageable pageable) {
        Page<WithdrawalResponse> response = withdrawalService.getPendingWithdrawals(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
