package com.freelancing.service;

import com.freelancing.dto.request.ProposalRequest;
import com.freelancing.dto.response.ProposalResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProposalService {
    ProposalResponse getProposalById(Long id);
    ProposalResponse submitProposal(Long freelancerProfileId, ProposalRequest request);
    ProposalResponse updateProposal(Long id, ProposalRequest request);
    void withdrawProposal(Long id);
    ProposalResponse acceptProposal(Long id);
    ProposalResponse rejectProposal(Long id);
    Page<ProposalResponse> getProposalsByJob(Long jobPostId, Pageable pageable);
    Page<ProposalResponse> getProposalsByFreelancer(Long freelancerId, Pageable pageable);
}
