package com.freelancing.service;

import com.freelancing.dto.request.FreelancerProfileRequest;
import com.freelancing.dto.response.FreelancerProfileResponse;
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
    void addSkill(Long freelancerId, Long skillId);
    void removeSkill(Long freelancerId, Long skillId);
    Set<?> getSkills(Long freelancerId);
}
