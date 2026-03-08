package com.freelancing.controller;

import com.freelancing.dto.request.DisputeRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.DisputeResponse;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.DisputeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DisputeResponse>>> getDisputes(
            @AuthenticationPrincipal CustomUserDetails userDetails, Pageable pageable) {
        Page<DisputeResponse> response = disputeService.getAllDisputes(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DisputeResponse>> getDisputeById(@PathVariable Long id) {
        DisputeResponse response = disputeService.getDisputeById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DisputeResponse>> createDispute(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody DisputeRequest request) {
        DisputeResponse response = disputeService.createDispute(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Dispute created", response));
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DisputeResponse>> resolveDispute(
            @PathVariable Long id, @RequestParam String resolution,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DisputeResponse response = disputeService.resolveDispute(id, resolution, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Dispute resolved", response));
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DisputeResponse>> closeDispute(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DisputeResponse response = disputeService.closeDispute(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Dispute closed", response));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<ApiResponse<Page<DisputeResponse>>> getDisputesByContract(
            @PathVariable Long contractId, Pageable pageable) {
        Page<DisputeResponse> response = disputeService.getDisputesByContract(contractId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
