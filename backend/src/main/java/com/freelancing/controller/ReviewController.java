package com.freelancing.controller;

import com.freelancing.dto.request.ReviewRequest;
import com.freelancing.dto.response.ApiResponse;
import com.freelancing.dto.response.ReviewResponse;
import com.freelancing.security.CustomUserDetails;
import com.freelancing.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable Long id) {
        ReviewResponse response = reviewService.getReviewById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.createReview(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review submitted", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long id, @Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.updateReview(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getReviewsByContract(
            @PathVariable Long contractId, Pageable pageable) {
        Page<ReviewResponse> response = reviewService.getReviewsByContract(contractId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getReviewsByFreelancer(
            @PathVariable Long freelancerId, Pageable pageable) {
        Page<ReviewResponse> response = reviewService.getReviewsByFreelancer(freelancerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getReviewsByClient(
            @PathVariable Long clientId, Pageable pageable) {
        Page<ReviewResponse> response = reviewService.getReviewsByClient(clientId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
