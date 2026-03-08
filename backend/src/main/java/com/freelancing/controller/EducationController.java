package com.freelancing.controller;

import com.freelancing.dto.request.EducationRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.EducationResponse;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.EducationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/freelancers")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService educationService;

    @GetMapping("/{freelancerId}/education")
    public ResponseEntity<ApiResponse<List<EducationResponse>>> getEducation(@PathVariable Long freelancerId) {
        List<EducationResponse> response = educationService.getEducation(freelancerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/me/education")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<EducationResponse>> addEducation(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody EducationRequest request) {
        EducationResponse response = educationService.addEducation(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Education added", response));
    }

    @PutMapping("/me/education/{educationId}")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<EducationResponse>> updateEducation(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long educationId,
            @Valid @RequestBody EducationRequest request) {
        EducationResponse response = educationService.updateEducation(userDetails.getId(), educationId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/me/education/{educationId}")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApiResponse<Void>> deleteEducation(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long educationId) {
        educationService.deleteEducation(userDetails.getId(), educationId);
        return ResponseEntity.ok(ApiResponse.success("Education deleted", null));
    }
}
