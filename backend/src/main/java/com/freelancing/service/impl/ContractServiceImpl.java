package com.freelancing.service.impl;

import com.freelancing.dto.request.MilestoneRequest;
import com.freelancing.dto.response.ContractResponse;
import com.freelancing.dto.response.MilestoneResponse;
import com.freelancing.entity.*;
import com.freelancing.entity.enums.ContractStatus;
import com.freelancing.entity.enums.JobStatus;
import com.freelancing.entity.enums.MilestoneStatus;
import com.freelancing.exception.BadRequestException;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.ContractRepository;
import com.freelancing.repository.MilestoneRepository;
import com.freelancing.repository.ProposalRepository;
import com.freelancing.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepo;
    private final ProposalRepository proposalRepo;
    private final MilestoneRepository milestoneRepo;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<ContractResponse> getAllContracts(Long userId, Pageable pageable) {
        return contractRepo.findByFreelancerUserIdOrClientUserId(userId, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ContractResponse getContractById(Long id) {
        Contract contract = contractRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));
        return mapToResponse(contract);
    }

    @Override
    @Transactional
    public ContractResponse createContract(Long proposalId) {
        Proposal proposal = proposalRepo.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "id", proposalId));

        if (proposal.getStatus() != com.freelancing.entity.enums.ProposalStatus.ACCEPTED) {
            throw new BadRequestException("Can only create contract from an accepted proposal");
        }

        Contract contract = Contract.builder()
                .title(proposal.getJobPost().getTitle())
                .description(proposal.getJobPost().getDescription())
                .totalAmount(proposal.getProposedRate())
                .startDate(LocalDateTime.now())
                .status(ContractStatus.ACTIVE)
                .freelancer(proposal.getFreelancer())
                .client(proposal.getJobPost().getClient())
                .jobPost(proposal.getJobPost())
                .proposal(proposal)
                .build();

        proposal.getJobPost().setStatus(JobStatus.IN_PROGRESS);
        contract = contractRepo.save(contract);
        return mapToResponse(contract);
    }

    @Override
    @Transactional
    public ContractResponse completeContract(Long id) {
        Contract contract = contractRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));
        contract.setStatus(ContractStatus.COMPLETED);
        contract.setEndDate(LocalDateTime.now());
        contract = contractRepo.save(contract);
        return mapToResponse(contract);
    }

    @Override
    @Transactional
    public ContractResponse cancelContract(Long id) {
        Contract contract = contractRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));
        contract.setStatus(ContractStatus.TERMINATED);
        contract.setEndDate(LocalDateTime.now());
        contract = contractRepo.save(contract);
        return mapToResponse(contract);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContractResponse> getContractsByClient(Long clientId, Pageable pageable) {
        return contractRepo.findByClientId(clientId, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContractResponse> getContractsByFreelancer(Long freelancerId, Pageable pageable) {
        return contractRepo.findByFreelancerId(freelancerId, pageable).map(this::mapToResponse);
    }

    @Override
    public List<MilestoneResponse> getMilestones(Long contractId) {
        return milestoneRepo.findByContractIdOrderBySortOrderAsc(contractId).stream()
                .map(m -> modelMapper.map(m, MilestoneResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MilestoneResponse addMilestone(Long contractId, MilestoneRequest request) {
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", contractId));

        Milestone milestone = Milestone.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .amount(request.getAmount())
                .dueDate(request.getDueDate())
                .sortOrder(request.getSortOrder())
                .status(MilestoneStatus.PENDING)
                .contract(contract)
                .build();

        milestone = milestoneRepo.save(milestone);
        return modelMapper.map(milestone, MilestoneResponse.class);
    }

    @Override
    @Transactional
    public MilestoneResponse updateMilestone(Long contractId, Long milestoneId, MilestoneRequest request) {
        Milestone milestone = milestoneRepo.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", "id", milestoneId));

        if (request.getTitle() != null) milestone.setTitle(request.getTitle());
        if (request.getDescription() != null) milestone.setDescription(request.getDescription());
        if (request.getAmount() != null) milestone.setAmount(request.getAmount());
        if (request.getDueDate() != null) milestone.setDueDate(request.getDueDate());
        if (request.getSortOrder() != null) milestone.setSortOrder(request.getSortOrder());

        milestone = milestoneRepo.save(milestone);
        return modelMapper.map(milestone, MilestoneResponse.class);
    }

    @Override
    @Transactional
    public void deleteMilestone(Long contractId, Long milestoneId) {
        Milestone milestone = milestoneRepo.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", "id", milestoneId));
        milestoneRepo.delete(milestone);
    }

    @Override
    @Transactional
    public MilestoneResponse completeMilestone(Long contractId, Long milestoneId) {
        Milestone milestone = milestoneRepo.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", "id", milestoneId));
        milestone.setStatus(MilestoneStatus.APPROVED);
        milestone = milestoneRepo.save(milestone);
        return modelMapper.map(milestone, MilestoneResponse.class);
    }

    private ContractResponse mapToResponse(Contract contract) {
        List<MilestoneResponse> milestoneResponses = contract.getMilestones().stream()
                .map(m -> modelMapper.map(m, MilestoneResponse.class))
                .collect(Collectors.toList());

        return ContractResponse.builder()
                .id(contract.getId())
                .title(contract.getTitle())
                .description(contract.getDescription())
                .totalAmount(contract.getTotalAmount())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .status(contract.getStatus())
                .freelancerId(contract.getFreelancer().getId())
                .freelancerName(contract.getFreelancer().getUser().getFirstName() + " " + contract.getFreelancer().getUser().getLastName())
                .clientId(contract.getClient().getId())
                .clientName(contract.getClient().getUser().getFirstName() + " " + contract.getClient().getUser().getLastName())
                .jobPostId(contract.getJobPost() != null ? contract.getJobPost().getId() : null)
                .jobPostTitle(contract.getJobPost() != null ? contract.getJobPost().getTitle() : null)
                .milestones(milestoneResponses)
                .createdAt(contract.getCreatedAt())
                .build();
    }
}
