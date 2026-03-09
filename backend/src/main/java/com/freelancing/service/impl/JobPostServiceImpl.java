package com.freelancing.service.impl;

import com.freelancing.dto.request.JobPostRequest;
import com.freelancing.dto.response.JobPostResponse;
import com.freelancing.dto.response.SkillResponse;
import com.freelancing.entity.ClientProfile;
import com.freelancing.entity.JobPost;
import com.freelancing.entity.Skill;
import com.freelancing.entity.enums.JobStatus;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.ClientProfileRepository;
import com.freelancing.repository.JobPostRepository;
import com.freelancing.repository.SkillRepository;
import com.freelancing.service.JobPostService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobPostServiceImpl implements JobPostService {

    private final JobPostRepository jobPostRepo;
    private final ClientProfileRepository clientRepo;
    private final SkillRepository skillRepo;

    @Override
    public Page<JobPostResponse> getAllJobs(Pageable pageable) {
        return jobPostRepo.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public JobPostResponse getJobById(Long id) {
        JobPost job = jobPostRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobPost", "id", id));
        return mapToResponse(job);
    }

    @Override
    @Transactional
    public JobPostResponse createJob(Long clientProfileId, JobPostRequest request) {
        ClientProfile client = clientRepo.findById(clientProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("ClientProfile", "id", clientProfileId));

        JobPost job = JobPost.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .budgetType(request.getBudgetType())
                .budgetMin(request.getBudgetMin())
                .budgetMax(request.getBudgetMax())
                .duration(request.getDuration())
                .experienceLevel(request.getExperienceLevel())
                .deadline(request.getDeadline())
                .status(JobStatus.OPEN)
                .client(client)
                .build();

        if (request.getSkillIds() != null && !request.getSkillIds().isEmpty()) {
            Set<Skill> skills = new HashSet<>(skillRepo.findAllById(request.getSkillIds()));
            job.setSkills(skills);
        }

        job = jobPostRepo.save(job);
        return mapToResponse(job);
    }

    @Override
    @Transactional
    public JobPostResponse updateJob(Long id, JobPostRequest request) {
        JobPost job = jobPostRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobPost", "id", id));

        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getBudgetType() != null) job.setBudgetType(request.getBudgetType());
        if (request.getBudgetMin() != null) job.setBudgetMin(request.getBudgetMin());
        if (request.getBudgetMax() != null) job.setBudgetMax(request.getBudgetMax());
        if (request.getDuration() != null) job.setDuration(request.getDuration());
        if (request.getExperienceLevel() != null) job.setExperienceLevel(request.getExperienceLevel());
        if (request.getDeadline() != null) job.setDeadline(request.getDeadline());

        if (request.getSkillIds() != null) {
            Set<Skill> skills = new HashSet<>(skillRepo.findAllById(request.getSkillIds()));
            job.setSkills(skills);
        }

        job = jobPostRepo.save(job);
        return mapToResponse(job);
    }

    @Override
    @Transactional
    public void deleteJob(Long id) {
        JobPost job = jobPostRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobPost", "id", id));
        jobPostRepo.delete(job);
    }

    @Override
    public Page<JobPostResponse> searchJobs(String keyword, JobStatus status, BigDecimal minBudget, BigDecimal maxBudget, Pageable pageable) {
        return jobPostRepo.searchJobs(keyword, status, minBudget, maxBudget, pageable).map(this::mapToResponse);
    }

    @Override
    public Page<JobPostResponse> getJobsByClient(Long clientId, Pageable pageable) {
        return jobPostRepo.findByClientId(clientId, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void addSkillToJob(Long jobId, Long skillId) {
        JobPost job = jobPostRepo.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("JobPost", "id", jobId));
        Skill skill = skillRepo.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", skillId));
        job.getSkills().add(skill);
        jobPostRepo.save(job);
    }

    @Override
    @Transactional
    public void removeSkillFromJob(Long jobId, Long skillId) {
        JobPost job = jobPostRepo.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("JobPost", "id", jobId));
        job.getSkills().removeIf(s -> s.getId().equals(skillId));
        jobPostRepo.save(job);
    }

    private JobPostResponse mapToResponse(JobPost job) {
        Set<SkillResponse> skillResponses = job.getSkills().stream()
                .map(s -> SkillResponse.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .slug(s.getSlug())
                        .categoryName(s.getCategory() != null ? s.getCategory().getName() : null)
                        .categoryId(s.getCategory() != null ? s.getCategory().getId() : null)
                        .build())
                .collect(Collectors.toSet());

        return JobPostResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .budgetType(job.getBudgetType())
                .budgetMin(job.getBudgetMin())
                .budgetMax(job.getBudgetMax())
                .duration(job.getDuration())
                .experienceLevel(job.getExperienceLevel())
                .status(job.getStatus())
                .deadline(job.getDeadline())
                .clientId(job.getClient().getId())
                .clientName(job.getClient().getUser().getFirstName() + " " + job.getClient().getUser().getLastName())
                .skills(skillResponses)
                .proposalCount(job.getProposals().size())
                .createdAt(job.getCreatedAt())
                .build();
    }
}
