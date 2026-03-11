package com.freelancing.service.impl;

import com.freelancing.dto.request.FreelancerProfileRequest;
import com.freelancing.dto.response.FreelancerProfileResponse;
import com.freelancing.dto.response.SkillResponse;
import com.freelancing.entity.FreelancerProfile;
import com.freelancing.entity.Skill;
import com.freelancing.entity.User;
import com.freelancing.exception.BadRequestException;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.FreelancerProfileRepository;
import com.freelancing.repository.SkillRepository;
import com.freelancing.repository.UserRepository;
import com.freelancing.service.FreelancerService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FreelancerServiceImpl implements FreelancerService {

    private final FreelancerProfileRepository freelancerRepo;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly=true)
    public Page<FreelancerProfileResponse> getAllFreelancers(Pageable pageable) {
        return freelancerRepo.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public FreelancerProfileResponse getFreelancerById(Long id) {
        return mapToResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public FreelancerProfileResponse getFreelancerByUserId(Long userId) {
        FreelancerProfile profile = freelancerRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("FreelancerProfile", "userId", userId));
        return mapToResponse(profile);
    }

    @Override
    @Transactional
    public FreelancerProfileResponse createProfile(Long userId, FreelancerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (freelancerRepo.findByUserId(userId).isPresent()) {
            throw new BadRequestException("Freelancer profile already exists");
        }

        FreelancerProfile profile = FreelancerProfile.builder()
                .title(request.getTitle())
                .bio(request.getBio())
                .hourlyRate(request.getHourlyRate())
                .availabilityStatus(request.getAvailabilityStatus())
                .city(request.getCity())
                .country(request.getCountry())
                .user(user)
                .skills(new HashSet<>())
                .build();

        if (request.getSkillIds() != null && !request.getSkillIds().isEmpty()) {
            Set<Skill> skills = new HashSet<>(skillRepository.findAllById(request.getSkillIds()));
            profile.setSkills(skills);
        }

        profile = freelancerRepo.save(profile);
        return mapToResponse(profile);
    }

    @Override
    @Transactional
    public FreelancerProfileResponse updateFreelancer(Long userId, FreelancerProfileRequest request) {
        FreelancerProfile profile = freelancerRepo.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("FreelancerProfile", "userId", userId));

        if (request.getTitle() != null) profile.setTitle(request.getTitle());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getHourlyRate() != null) profile.setHourlyRate(request.getHourlyRate());
        if (request.getAvailabilityStatus() != null) profile.setAvailabilityStatus(request.getAvailabilityStatus());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getCountry() != null) profile.setCountry(request.getCountry());

        if (request.getSkillIds() != null) {
            Set<Skill> skills = new HashSet<>(skillRepository.findAllById(request.getSkillIds()));
            profile.setSkills(skills);
        }

        profile = freelancerRepo.save(profile);
        return mapToResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FreelancerProfileResponse> searchFreelancers(String keyword, Pageable pageable) {
        return freelancerRepo.searchFreelancers(keyword, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void addSkill(Long freelancerId, Long skillId) {
        FreelancerProfile profile = findById(freelancerId);
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", skillId));
        profile.getSkills().add(skill);
        freelancerRepo.save(profile);
    }

    @Override
    @Transactional
    public void removeSkill(Long freelancerId, Long skillId) {
        FreelancerProfile profile = findById(freelancerId);
        profile.getSkills().removeIf(s -> s.getId().equals(skillId));
        freelancerRepo.save(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<SkillResponse> getSkills(Long freelancerId) {
        FreelancerProfile profile = findById(freelancerId);
        return profile.getSkills().stream()
                .map(skill -> SkillResponse.builder()
                        .id(skill.getId())
                        .name(skill.getName())
                        .slug(skill.getSlug())
                        .categoryName(skill.getCategory() != null ? skill.getCategory().getName() : null)
                        .categoryId(skill.getCategory() != null ? skill.getCategory().getId() : null)
                        .build())
                .collect(Collectors.toSet());
    }

    private FreelancerProfile findById(Long id) {
        return freelancerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FreelancerProfile", "id", id));
    }

    private FreelancerProfileResponse mapToResponse(FreelancerProfile profile) {
        FreelancerProfileResponse response = modelMapper.map(profile, FreelancerProfileResponse.class);
        if (profile.getSkills() != null) {
            response.setSkills(profile.getSkills().stream()
                    .map(s -> SkillResponse.builder()
                            .id(s.getId())
                            .name(s.getName())
                            .slug(s.getSlug())
                            .categoryName(s.getCategory() != null ? s.getCategory().getName() : null)
                            .categoryId(s.getCategory() != null ? s.getCategory().getId() : null)
                            .build())
                    .collect(Collectors.toSet()));
        }
        return response;
    }
}
