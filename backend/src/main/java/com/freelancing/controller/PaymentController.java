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

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getPayments(
            @AuthenticationPrincipal CustomUserDetails userDetails, Pageable pageable) {
        // Admin sees all payments; clients/freelancers see only their own
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Page<PaymentResponse> response = isAdmin
                ? paymentService.getAllPayments(pageable)
                : paymentService.getPayments(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentById(id)));
    }

    @PostMapping("/contract/{contractId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiatePayment(
            @PathVariable Long contractId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String upiTransactionId = body.get("upiTransactionId");
        PaymentResponse response = paymentService.initiatePayment(
                contractId, userDetails.getId(), upiTransactionId);
        return ResponseEntity.ok(ApiResponse.success("Payment submitted for admin confirmation", response));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed",
                paymentService.confirmPayment(id)));
    }
}