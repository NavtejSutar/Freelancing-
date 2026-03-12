package com.freelancing.controller;

import com.freelancing.dto.request.ProposalRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.ProposalResponse;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.ProposalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/proposals")
@RequiredArgsConstructor
public class ProposalController {

    private final ProposalService proposalService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProposalResponse>> getProposalById(@PathVariable Long id) {
        ProposalResponse response = proposalService.getProposalById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping 
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<ProposalResponse>> submitProposal(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProposalRequest request) {
        ProposalResponse response = proposalService.submitProposal(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Proposal submitted", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<ProposalResponse>> updateProposal(
            @PathVariable Long id,
            @Valid @RequestBody ProposalRequest request) {
        ProposalResponse response = proposalService.updateProposal(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<Void>> withdrawProposal(@PathVariable Long id) {
        proposalService.withdrawProposal(id);
        return ResponseEntity.ok(ApiResponse.success("Proposal withdrawn", null));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<ProposalResponse>> acceptProposal(@PathVariable Long id) {
        ProposalResponse response = proposalService.acceptProposal(id);
        return ResponseEntity.ok(ApiResponse.success("Proposal accepted", response));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<ProposalResponse>> rejectProposal(@PathVariable Long id) {
        ProposalResponse response = proposalService.rejectProposal(id);
        return ResponseEntity.ok(ApiResponse.success("Proposal rejected", response));
    }

    @GetMapping("/job/{jobPostId}")
    public ResponseEntity<ApiResponse<Page<ProposalResponse>>> getProposalsByJob(
            @PathVariable Long jobPostId, Pageable pageable) {
        Page<ProposalResponse> response = proposalService.getProposalsByJob(jobPostId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<ApiResponse<Page<ProposalResponse>>> getProposalsByFreelancer(
            @PathVariable Long freelancerId, Pageable pageable) {
        Page<ProposalResponse> response = proposalService.getProposalsByFreelancer(freelancerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<Page<ProposalResponse>>> getMyProposals(
            @AuthenticationPrincipal CustomUserDetails userDetails, Pageable pageable) {
        Page<ProposalResponse> response = proposalService.getProposalsByFreelancer(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
