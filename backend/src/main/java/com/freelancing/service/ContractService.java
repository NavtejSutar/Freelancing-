package com.freelancing.service;

import com.freelancing.dto.request.MilestoneRequest;
import com.freelancing.dto.response.ContractResponse;
import com.freelancing.dto.response.MilestoneResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ContractService {
    Page<ContractResponse> getAllContracts(Long userId, Pageable pageable);
    ContractResponse getContractById(Long id);
    ContractResponse createContract(Long proposalId);
    ContractResponse completeContract(Long id);
    ContractResponse cancelContract(Long id);
    Page<ContractResponse> getContractsByClient(Long clientId, Pageable pageable);
    Page<ContractResponse> getContractsByFreelancer(Long freelancerId, Pageable pageable);
    List<MilestoneResponse> getMilestones(Long contractId);
    MilestoneResponse addMilestone(Long contractId, MilestoneRequest request);
    MilestoneResponse updateMilestone(Long contractId, Long milestoneId, MilestoneRequest request);
    void deleteMilestone(Long contractId, Long milestoneId);
    MilestoneResponse completeMilestone(Long contractId, Long milestoneId);
}
