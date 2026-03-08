package com.freelancing.service;

import com.freelancing.dto.request.ReviewRequest;
import com.freelancing.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse getReviewById(Long id);
    ReviewResponse createReview(Long reviewerId, ReviewRequest request);
    ReviewResponse updateReview(Long id, ReviewRequest request);
    void deleteReview(Long id);
    Page<ReviewResponse> getReviewsByContract(Long contractId, Pageable pageable);
    Page<ReviewResponse> getReviewsByFreelancer(Long freelancerId, Pageable pageable);
    Page<ReviewResponse> getReviewsByClient(Long clientId, Pageable pageable);
}
