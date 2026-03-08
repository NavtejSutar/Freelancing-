package com.freelancing.controller;

import com.freelancing.dto.request.FreelancerProfileRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.FreelancerProfileResponse;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.FreelancerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/freelancers")
@RequiredArgsConstructor
public class FreelancerController {

    private final FreelancerService freelancerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FreelancerProfileResponse>>> getAllFreelancers(Pageable pageable) {
        Page<FreelancerProfileResponse> response = freelancerService.getAllFreelancers(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FreelancerProfileResponse>> getFreelancerById(@PathVariable Long id) {
        FreelancerProfileResponse response = freelancerService.getFreelancerById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<FreelancerProfileResponse>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        FreelancerProfileResponse response = freelancerService.getFreelancerByUserId(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<FreelancerProfileResponse>> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody FreelancerProfileRequest request) {
        FreelancerProfileResponse response = freelancerService.updateFreelancer(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<FreelancerProfileResponse>>> searchFreelancers(
            @RequestParam(required = false) String keyword, Pageable pageable) {
        Page<FreelancerProfileResponse> response = freelancerService.searchFreelancers(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/me/skills/{skillId}")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<Void>> addSkill(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long skillId) {
        freelancerService.addSkill(userDetails.getId(), skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill added", null));
    }

    @DeleteMapping("/me/skills/{skillId}")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<Void>> removeSkill(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long skillId) {
        freelancerService.removeSkill(userDetails.getId(), skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill removed", null));
    }
}
