package com.freelancing.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.freelancing.dto.request.SubmissionRequest;
import com.freelancing.dto.response.SubmissionResponse;
import com.freelancing.entity.Milestone;
import com.freelancing.entity.Submission;
import com.freelancing.entity.enums.MilestoneStatus;
import com.freelancing.entity.enums.SubmissionStatus;
import com.freelancing.exception.BadRequestException;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.MilestoneRepository;
import com.freelancing.repository.SubmissionRepository;
import com.freelancing.service.SubmissionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepo;
    private final MilestoneRepository milestoneRepo;

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getSubmissionById(Long id) {
        Submission submission = submissionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "id", id));
        return mapToResponse(submission);
    }

    @Override
    @Transactional
    public SubmissionResponse createSubmission(SubmissionRequest request) {
        Milestone milestone = milestoneRepo.findById(request.getMilestoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", "id", request.getMilestoneId()));

        List<Submission> existing = submissionRepo.findByMilestoneId(request.getMilestoneId());
        boolean hasActive = existing.stream().anyMatch(s ->
                s.getStatus() == SubmissionStatus.SUBMITTED || s.getStatus() == SubmissionStatus.APPROVED);
        if (hasActive) {
            throw new BadRequestException("An active submission already exists for this milestone");
        }

        Submission submission = Submission.builder()
                .description(request.getDescription())
                .status(SubmissionStatus.SUBMITTED)
                .submittedAt(LocalDateTime.now())
                .attachmentUrls(request.getAttachmentUrls() != null ? request.getAttachmentUrls() : List.of())
                .milestone(milestone)
                .build();

        milestone.setStatus(MilestoneStatus.SUBMITTED);
        milestoneRepo.save(milestone);

        submission = submissionRepo.save(submission);
        return mapToResponse(submission);
    }

    @Override
    @Transactional
    public SubmissionResponse updateSubmission(Long id, SubmissionRequest request) {
        Submission submission = submissionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "id", id));

        if (request.getDescription() != null) submission.setDescription(request.getDescription());
        if (request.getAttachmentUrls() != null) submission.setAttachmentUrls(request.getAttachmentUrls());

        submission = submissionRepo.save(submission);
        return mapToResponse(submission);
    }

    @Override
    @Transactional
    public SubmissionResponse approveSubmission(Long id) {
        Submission submission = submissionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "id", id));
        submission.setStatus(SubmissionStatus.APPROVED);
        submission.setReviewedAt(LocalDateTime.now());

        Milestone milestone = submission.getMilestone();
        milestone.setStatus(MilestoneStatus.APPROVED);
        milestoneRepo.save(milestone);

        submission = submissionRepo.save(submission);
        return mapToResponse(submission);
    }

    @Override
    @Transactional
    public SubmissionResponse rejectSubmission(Long id) {
        Submission submission = submissionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "id", id));
        submission.setStatus(SubmissionStatus.REVISION_REQUESTED);
        submission.setReviewedAt(LocalDateTime.now());

        Milestone milestone = submission.getMilestone();
        milestone.setStatus(MilestoneStatus.REVISION_REQUESTED);
        milestoneRepo.save(milestone);

        submission = submissionRepo.save(submission);
        return mapToResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsByContract(Long contractId) {
        return submissionRepo.findByMilestoneContractId(contractId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsByMilestone(Long milestoneId) {
        return submissionRepo.findByMilestoneId(milestoneId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SubmissionResponse mapToResponse(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .description(submission.getDescription())
                .status(submission.getStatus())
                .submittedAt(submission.getSubmittedAt())
                .reviewedAt(submission.getReviewedAt())
                .attachmentUrls(submission.getAttachmentUrls())
                .milestoneId(submission.getMilestone().getId())
                .createdAt(submission.getCreatedAt())
                .build();
    }
}