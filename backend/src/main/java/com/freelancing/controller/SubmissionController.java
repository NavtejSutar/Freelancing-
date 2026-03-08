package com.freelancing.controller;

import com.freelancing.dto.request.SubmissionRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.SubmissionResponse;
import com.freelancing.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubmissionResponse>> getSubmissionById(@PathVariable Long id) {
        SubmissionResponse response = submissionService.getSubmissionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<SubmissionResponse>> createSubmission(
            @Valid @RequestBody SubmissionRequest request) {
        SubmissionResponse response = submissionService.createSubmission(request);
        return ResponseEntity.ok(ApiResponse.success("Submission created", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<SubmissionResponse>> updateSubmission(
            @PathVariable Long id, @Valid @RequestBody SubmissionRequest request) {
        SubmissionResponse response = submissionService.updateSubmission(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<SubmissionResponse>> approveSubmission(@PathVariable Long id) {
        SubmissionResponse response = submissionService.approveSubmission(id);
        return ResponseEntity.ok(ApiResponse.success("Submission approved", response));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<SubmissionResponse>> rejectSubmission(@PathVariable Long id) {
        SubmissionResponse response = submissionService.rejectSubmission(id);
        return ResponseEntity.ok(ApiResponse.success("Submission rejected", response));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionsByContract(
            @PathVariable Long contractId) {
        List<SubmissionResponse> response = submissionService.getSubmissionsByContract(contractId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/milestone/{milestoneId}")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionsByMilestone(
            @PathVariable Long milestoneId) {
        List<SubmissionResponse> response = submissionService.getSubmissionsByMilestone(milestoneId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
