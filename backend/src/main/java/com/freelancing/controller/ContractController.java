package com.freelancing.controller;

import com.freelancing.dto.request.MilestoneRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.ContractResponse;
import com.freelancing.dto.response.MilestoneResponse;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ContractResponse>>> getMyContracts(
            @AuthenticationPrincipal CustomUserDetails userDetails, Pageable pageable) {
        Page<ContractResponse> response = contractService.getAllContracts(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContractResponse>> getContractById(@PathVariable Long id) {
        ContractResponse response = contractService.getContractById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/proposal/{proposalId}")
    public ResponseEntity<ApiResponse<ContractResponse>> createContract(@PathVariable Long proposalId) {
        ContractResponse response = contractService.createContract(proposalId);
        return ResponseEntity.ok(ApiResponse.success("Contract created — both parties must sign", response));
    }

    // FIX: signatureUrl now received in the request body instead of @RequestParam.
    // A drawn signature is a base64 PNG string which can be 50-200KB in size.
    // Sending that as a URL query parameter exceeded Tomcat's default header size
    // limit (8KB), causing: "Request header is too large" -> 400 error -> frontend
    // showed "Failed to sign contract". Moving it to the JSON request body removes
    // that size constraint entirely.
    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<ContractResponse>> acceptContract(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String signatureUrl = body.get("signatureUrl");
        ContractResponse response = contractService.acceptContract(id, userDetails.getId(), signatureUrl);
        String message = response.getStatus().name().equals("ACTIVE")
                ? "Contract is now active — both parties have signed!"
                : "Contract signed — waiting for the other party to sign";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<ContractResponse>> completeContract(@PathVariable Long id) {
        ContractResponse response = contractService.completeContract(id);
        return ResponseEntity.ok(ApiResponse.success("Contract completed", response));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ContractResponse>> cancelContract(@PathVariable Long id) {
        ContractResponse response = contractService.cancelContract(id);
        return ResponseEntity.ok(ApiResponse.success("Contract cancelled", response));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ApiResponse<Page<ContractResponse>>> getContractsByClient(
            @PathVariable Long clientId, Pageable pageable) {
        Page<ContractResponse> response = contractService.getContractsByClient(clientId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<ApiResponse<Page<ContractResponse>>> getContractsByFreelancer(
            @PathVariable Long freelancerId, Pageable pageable) {
        Page<ContractResponse> response = contractService.getContractsByFreelancer(freelancerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{contractId}/milestones")
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> getMilestones(@PathVariable Long contractId) {
        List<MilestoneResponse> response = contractService.getMilestones(contractId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{contractId}/milestones")
    public ResponseEntity<ApiResponse<MilestoneResponse>> addMilestone(
            @PathVariable Long contractId, @Valid @RequestBody MilestoneRequest request) {
        MilestoneResponse response = contractService.addMilestone(contractId, request);
        return ResponseEntity.ok(ApiResponse.success("Milestone added", response));
    }

    @PutMapping("/{contractId}/milestones/{milestoneId}")
    public ResponseEntity<ApiResponse<MilestoneResponse>> updateMilestone(
            @PathVariable Long contractId, @PathVariable Long milestoneId,
            @Valid @RequestBody MilestoneRequest request) {
        MilestoneResponse response = contractService.updateMilestone(contractId, milestoneId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{contractId}/milestones/{milestoneId}")
    public ResponseEntity<ApiResponse<Void>> deleteMilestone(
            @PathVariable Long contractId, @PathVariable Long milestoneId) {
        contractService.deleteMilestone(contractId, milestoneId);
        return ResponseEntity.ok(ApiResponse.success("Milestone deleted", null));
    }

    @PutMapping("/{contractId}/milestones/{milestoneId}/complete")
    public ResponseEntity<ApiResponse<MilestoneResponse>> completeMilestone(
            @PathVariable Long contractId, @PathVariable Long milestoneId) {
        MilestoneResponse response = contractService.completeMilestone(contractId, milestoneId);
        return ResponseEntity.ok(ApiResponse.success("Milestone completed", response));
    }
}