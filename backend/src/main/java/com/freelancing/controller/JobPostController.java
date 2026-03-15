package com.freelancing.controller;

import com.freelancing.dto.request.JobPostRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.JobPostResponse;
import com.freelancing.entity.enums.JobStatus;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.JobPostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobPostController {

    private final JobPostService jobPostService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobPostResponse>>> getAllJobs(Pageable pageable) {
        Page<JobPostResponse> response = jobPostService.getAllJobs(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPostResponse>> getJobById(@PathVariable Long id) {
        JobPostResponse response = jobPostService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ADDED: client fetches only their own jobs using their userId — no need to pre-fetch clientId
    @GetMapping("/my")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<Page<JobPostResponse>>> getMyJobs(
            @AuthenticationPrincipal CustomUserDetails userDetails, Pageable pageable) {
        Page<JobPostResponse> response = jobPostService.getJobsByUserId(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<JobPostResponse>> createJob(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody JobPostRequest request) {
        JobPostResponse response = jobPostService.createJob(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Job posted", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<JobPostResponse>> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobPostRequest request) {
        JobPostResponse response = jobPostService.updateJob(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        jobPostService.deleteJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job deleted", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<JobPostResponse>>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) BigDecimal minBudget,
            @RequestParam(required = false) BigDecimal maxBudget,
            Pageable pageable) {
        Page<JobPostResponse> response = jobPostService.searchJobs(keyword, status, minBudget, maxBudget, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ApiResponse<Page<JobPostResponse>>> getJobsByClient(
            @PathVariable Long clientId, Pageable pageable) {
        Page<JobPostResponse> response = jobPostService.getJobsByClient(clientId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{jobId}/skills/{skillId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<Void>> addSkillToJob(@PathVariable Long jobId, @PathVariable Long skillId) {
        jobPostService.addSkillToJob(jobId, skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill added to job", null));
    }

    @DeleteMapping("/{jobId}/skills/{skillId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<Void>> removeSkillFromJob(@PathVariable Long jobId, @PathVariable Long skillId) {
        jobPostService.removeSkillFromJob(jobId, skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill removed from job", null));
    }
}