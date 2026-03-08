package com.freelancing.service;

import com.freelancing.dto.request.EducationRequest;
import com.freelancing.dto.response.EducationResponse;

import java.util.List;

public interface EducationService {
    List<EducationResponse> getEducation(Long freelancerId);
    EducationResponse addEducation(Long freelancerId, EducationRequest request);
    EducationResponse updateEducation(Long freelancerId, Long educationId, EducationRequest request);
    void deleteEducation(Long freelancerId, Long educationId);
}
