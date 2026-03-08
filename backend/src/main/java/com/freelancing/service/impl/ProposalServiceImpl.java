package com.freelancing.service.impl;

import com.freelancing.dto.request.ProposalRequest;
import com.freelancing.dto.response.ProposalResponse;
import com.freelancing.entity.FreelancerProfile;
import com.freelancing.entity.JobPost;
import com.freelancing.entity.Proposal;
import com.freelancing.entity.enums.ProposalStatus;
import com.freelancing.exception.BadRequestException;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.FreelancerProfileRepository;
import com.freelancing.repository.JobPostRepository;
import com.freelancing.repository.ProposalRepository;
import com.freelancing.service.ProposalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProposalServiceImpl implements ProposalService {

    private final ProposalRepository proposalRepo;
    private final JobPostRepository jobPostRepo;
    private final FreelancerProfileRepository freelancerRepo;

    @Override
    public ProposalResponse getProposalById(Long id) {
        Proposal proposal = proposalRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "id", id));
        return mapToResponse(proposal);
    }

    @Override
    @Transactional
    public ProposalResponse submitProposal(Long freelancerProfileId, ProposalRequest request) {
        FreelancerProfile freelancer = freelancerRepo.findById(freelancerProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("FreelancerProfile", "id", freelancerProfileId));

        JobPost jobPost = jobPostRepo.findById(request.getJobPostId())
                .orElseThrow(() -> new ResourceNotFoundException("JobPost", "id", request.getJobPostId()));

        if (proposalRepo.existsByFreelancerIdAndJobPostId(freelancerProfileId, request.getJobPostId())) {
            throw new BadRequestException("You have already submitted a proposal for this job");
        }

        Proposal proposal = Proposal.builder()
                .coverLetter(request.getCoverLetter())
                .proposedRate(request.getProposedRate())
                .estimatedDuration(request.getEstimatedDuration())
                .status(ProposalStatus.PENDING)
                .freelancer(freelancer)
                .jobPost(jobPost)
                .build();

        proposal = proposalRepo.save(proposal);
        return mapToResponse(proposal);
    }

    @Override
    @Transactional
    public ProposalResponse updateProposal(Long id, ProposalRequest request) {
        Proposal proposal = proposalRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "id", id));

        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new BadRequestException("Can only update pending proposals");
        }

        if (request.getCoverLetter() != null) proposal.setCoverLetter(request.getCoverLetter());
        if (request.getProposedRate() != null) proposal.setProposedRate(request.getProposedRate());
        if (request.getEstimatedDuration() != null) proposal.setEstimatedDuration(request.getEstimatedDuration());

        proposal = proposalRepo.save(proposal);
        return mapToResponse(proposal);
    }

    @Override
    @Transactional
    public void withdrawProposal(Long id) {
        Proposal proposal = proposalRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "id", id));
        proposal.setStatus(ProposalStatus.WITHDRAWN);
        proposalRepo.save(proposal);
    }

    @Override
    @Transactional
    public ProposalResponse acceptProposal(Long id) {
        Proposal proposal = proposalRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "id", id));
        proposal.setStatus(ProposalStatus.ACCEPTED);
        proposal = proposalRepo.save(proposal);
        return mapToResponse(proposal);
    }

    @Override
    @Transactional
    public ProposalResponse rejectProposal(Long id) {
        Proposal proposal = proposalRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "id", id));
        proposal.setStatus(ProposalStatus.REJECTED);
        proposal = proposalRepo.save(proposal);
        return mapToResponse(proposal);
    }

    @Override
    public Page<ProposalResponse> getProposalsByJob(Long jobPostId, Pageable pageable) {
        return proposalRepo.findByJobPostId(jobPostId, pageable).map(this::mapToResponse);
    }

    @Override
    public Page<ProposalResponse> getProposalsByFreelancer(Long freelancerId, Pageable pageable) {
        return proposalRepo.findByFreelancerId(freelancerId, pageable).map(this::mapToResponse);
    }

    private ProposalResponse mapToResponse(Proposal proposal) {
        return ProposalResponse.builder()
                .id(proposal.getId())
                .coverLetter(proposal.getCoverLetter())
                .proposedRate(proposal.getProposedRate())
                .estimatedDuration(proposal.getEstimatedDuration())
                .status(proposal.getStatus())
                .freelancerId(proposal.getFreelancer().getId())
                .freelancerName(proposal.getFreelancer().getUser().getFirstName() + " " + proposal.getFreelancer().getUser().getLastName())
                .jobPostId(proposal.getJobPost().getId())
                .jobPostTitle(proposal.getJobPost().getTitle())
                .createdAt(proposal.getCreatedAt())
                .build();
    }
}
