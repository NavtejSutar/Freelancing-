package com.freelancing.service;

import com.freelancing.dto.request.FreelancerProfileRequest;
import com.freelancing.dto.response.FreelancerProfileResponse;
import com.freelancing.dto.response.SkillResponse;
import com.freelancing.entity.enums.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Set;

public interface FreelancerService {
    Page<FreelancerProfileResponse> getAllFreelancers(Pageable pageable);
    FreelancerProfileResponse getFreelancerById(Long id);
    FreelancerProfileResponse getFreelancerByUserId(Long userId);
    FreelancerProfileResponse createProfile(Long userId, FreelancerProfileRequest request);
    FreelancerProfileResponse updateFreelancer(Long userId, FreelancerProfileRequest request);
    Page<FreelancerProfileResponse> searchFreelancers(String keyword, Pageable pageable);
    void addSkill(Long userId, Long skillId);
    void removeSkill(Long userId, Long skillId);
    Set<SkillResponse> getSkills(Long freelancerId);

    // Aadhaar verification (your feature)
    Page<FreelancerProfileResponse> getFreelancersByVerificationStatus(VerificationStatus status, Pageable pageable);
    FreelancerProfileResponse verifyFreelancer(Long profileId);
    FreelancerProfileResponse rejectFreelancer(Long profileId, String note);
}