package com.freelancing.controller;

import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.PaymentResponse;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getPayments(
            @AuthenticationPrincipal CustomUserDetails userDetails, Pageable pageable) {
        Page<PaymentResponse> response = paymentService.getPayments(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        PaymentResponse response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/contract/{contractId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiatePayment(
            @PathVariable Long contractId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        PaymentResponse response = paymentService.initiatePayment(contractId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Payment initiated", response));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(@PathVariable Long id) {
        PaymentResponse response = paymentService.confirmPayment(id);
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed", response));
    }
}
