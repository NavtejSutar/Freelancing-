package com.freelancing.service.impl;

import com.freelancing.dto.request.ReviewRequest;
import com.freelancing.dto.response.ReviewResponse;
import com.freelancing.entity.Contract;
import com.freelancing.entity.Review;
import com.freelancing.entity.User;
import com.freelancing.exception.BadRequestException;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.ContractRepository;
import com.freelancing.repository.ReviewRepository;
import com.freelancing.repository.UserRepository;
import com.freelancing.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepo;
    private final ContractRepository contractRepo;
    private final UserRepository userRepo;

    @Override
    public ReviewResponse getReviewById(Long id) {
        Review review = reviewRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        return mapToResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Long reviewerId, ReviewRequest request) {
        Contract contract = contractRepo.findById(request.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", request.getContractId()));

        if (reviewRepo.existsByContractIdAndReviewerId(request.getContractId(), reviewerId)) {
            throw new BadRequestException("You have already reviewed this contract");
        }

        User reviewer = userRepo.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reviewerId));

        // Determine reviewee: if reviewer is client, reviewee is freelancer and vice versa
        User reviewee;
        if (contract.getClient().getUser().getId().equals(reviewerId)) {
            reviewee = contract.getFreelancer().getUser();
        } else {
            reviewee = contract.getClient().getUser();
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .contract(contract)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .build();

        review = reviewRepo.save(review);
        return mapToResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long id, ReviewRequest request) {
        Review review = reviewRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        if (request.getRating() != null) review.setRating(request.getRating());
        if (request.getComment() != null) review.setComment(request.getComment());

        review = reviewRepo.save(review);
        return mapToResponse(review);
    }

    @Override
    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        reviewRepo.delete(review);
    }

    @Override
    public Page<ReviewResponse> getReviewsByContract(Long contractId, Pageable pageable) {
        return reviewRepo.findByContractId(contractId, pageable).map(this::mapToResponse);
    }

    @Override
    public Page<ReviewResponse> getReviewsByFreelancer(Long freelancerId, Pageable pageable) {
        return reviewRepo.findByRevieweeId(freelancerId, pageable).map(this::mapToResponse);
    }

    @Override
    public Page<ReviewResponse> getReviewsByClient(Long clientId, Pageable pageable) {
        return reviewRepo.findByRevieweeId(clientId, pageable).map(this::mapToResponse);
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .contractId(review.getContract().getId())
                .reviewerId(review.getReviewer().getId())
                .reviewerName(review.getReviewer().getFirstName() + " " + review.getReviewer().getLastName())
                .revieweeId(review.getReviewee().getId())
                .revieweeName(review.getReviewee().getFirstName() + " " + review.getReviewee().getLastName())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
