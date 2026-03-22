package com.freelancing.service.impl;

import com.freelancing.dto.request.ReviewRequest;
import com.freelancing.dto.response.ReviewResponse;
import com.freelancing.entity.Contract;
import com.freelancing.entity.FreelancerProfile;
import com.freelancing.entity.Review;
import com.freelancing.entity.User;
import com.freelancing.entity.enums.ContractStatus;
import com.freelancing.entity.enums.UserRole;
import com.freelancing.exception.BadRequestException;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.ContractRepository;
import com.freelancing.repository.FreelancerProfileRepository;
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
    private final FreelancerProfileRepository freelancerProfileRepository;

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

        // Only allow reviews on completed contracts
        if (contract.getStatus() != ContractStatus.COMPLETED) {
            throw new BadRequestException("Reviews are allowed only after contract completion");
        }

        if (reviewRepo.existsByContractIdAndReviewerId(request.getContractId(), reviewerId)) {
            throw new BadRequestException("You have already reviewed this contract");
        }

        User reviewer = userRepo.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reviewerId));

        Long clientUserId = contract.getClient().getUser().getId();
        Long freelancerUserId = contract.getFreelancer().getUser().getId();

        User reviewee;
        if (clientUserId.equals(reviewerId)) {
            reviewee = contract.getFreelancer().getUser();
        } else if (freelancerUserId.equals(reviewerId)) {
            reviewee = contract.getClient().getUser();
        } else {
            throw new BadRequestException("You are not part of this contract");
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .contract(contract)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .build();

        review = reviewRepo.save(review);

        // Sync freelancer's avgRating and totalReviews after new review
        syncFreelancerRating(reviewee.getId());

        return mapToResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long id, ReviewRequest request) {
        Review review = reviewRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        if (review.getContract().getStatus() != ContractStatus.COMPLETED) {
            throw new BadRequestException("Reviews can be updated only for completed contracts");
        }

        if (request.getRating() != null) review.setRating(request.getRating());
        if (request.getComment() != null) review.setComment(request.getComment());

        review = reviewRepo.save(review);
        syncFreelancerRating(review.getReviewee().getId());
        return mapToResponse(review);
    }

    @Override
    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        Long revieweeId = review.getReviewee().getId();
        reviewRepo.delete(review);
        syncFreelancerRating(revieweeId);
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

    // Sync avgRating (out of 10) and totalReviews on the freelancer's profile
    // Called after every create/update/delete review
    private void syncFreelancerRating(Long revieweeUserId) {
        FreelancerProfile profile = freelancerProfileRepository.findByUserId(revieweeUserId).orElse(null);
        if (profile == null) return; // reviewee is a client — no freelancer profile to sync

        Double avgOutOfFive = reviewRepo.getAverageRatingForUserByReviewerRoleAndContractStatus(
                revieweeUserId, UserRole.CLIENT, ContractStatus.COMPLETED);
        Long total = reviewRepo.countReviewsForUserByReviewerRoleAndContractStatus(
                revieweeUserId, UserRole.CLIENT, ContractStatus.COMPLETED);

        // Convert 1–5 star scale to 1–10 for leaderboard display
        double avgOutOfTen = avgOutOfFive == null ? 0.0
                : Math.round((avgOutOfFive * 2.0) * 10.0) / 10.0;

        profile.setAvgRating(avgOutOfTen);
        profile.setTotalReviews(total == null ? 0 : total.intValue());
        freelancerProfileRepository.save(profile);
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