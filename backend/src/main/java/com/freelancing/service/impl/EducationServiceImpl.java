package com.freelancing.service.impl;

import com.freelancing.dto.request.EducationRequest;
import com.freelancing.dto.response.EducationResponse;
import com.freelancing.entity.Education;
import com.freelancing.entity.FreelancerProfile;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.EducationRepository;
import com.freelancing.repository.FreelancerProfileRepository;
import com.freelancing.service.EducationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EducationServiceImpl implements EducationService {

    private final EducationRepository educationRepo;
    private final FreelancerProfileRepository freelancerRepo;
    private final ModelMapper modelMapper;

    @Override
    public List<EducationResponse> getEducation(Long freelancerId) {
        return educationRepo.findByFreelancerProfileId(freelancerId).stream()
                .map(e -> modelMapper.map(e, EducationResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EducationResponse addEducation(Long freelancerId, EducationRequest request) {
        FreelancerProfile profile = freelancerRepo.findByUserId(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("FreelancerProfile", "id", freelancerId));

        Education education = Education.builder()
                .institution(request.getInstitution())
                .degree(request.getDegree())
                .fieldOfStudy(request.getFieldOfStudy())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .description(request.getDescription())
                .freelancerProfile(profile)
                .build();

        education = educationRepo.save(education);
        return modelMapper.map(education, EducationResponse.class);
    }

    @Override
    @Transactional
    public EducationResponse updateEducation(Long freelancerId, Long educationId, EducationRequest request) {
        Education education = educationRepo.findById(educationId)
                .orElseThrow(() -> new ResourceNotFoundException("Education", "id", educationId));

        if (request.getInstitution() != null) education.setInstitution(request.getInstitution());
        if (request.getDegree() != null) education.setDegree(request.getDegree());
        if (request.getFieldOfStudy() != null) education.setFieldOfStudy(request.getFieldOfStudy());
        if (request.getStartDate() != null) education.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) education.setEndDate(request.getEndDate());
        if (request.getDescription() != null) education.setDescription(request.getDescription());

        education = educationRepo.save(education);
        return modelMapper.map(education, EducationResponse.class);
    }

    @Override
    @Transactional
    public void deleteEducation(Long freelancerId, Long educationId) {
        Education education = educationRepo.findById(educationId)
                .orElseThrow(() -> new ResourceNotFoundException("Education", "id", educationId));
        educationRepo.delete(education);
    }
}
