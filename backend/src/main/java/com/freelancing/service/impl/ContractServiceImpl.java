package com.freelancing.service.impl;

import com.freelancing.dto.request.MilestoneRequest;
import com.freelancing.dto.response.ContractResponse;
import com.freelancing.dto.response.MilestoneResponse;
import com.freelancing.entity.*;
import com.freelancing.entity.enums.ContractStatus;
import com.freelancing.entity.enums.JobStatus;
import com.freelancing.entity.enums.MilestoneStatus;
import com.freelancing.entity.enums.PaymentStatus;
import com.freelancing.exception.BadRequestException;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.ContractRepository;
import com.freelancing.repository.MilestoneRepository;
import com.freelancing.repository.PaymentRepository;
import com.freelancing.repository.ProposalRepository;
import com.freelancing.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepo;
    private final ProposalRepository proposalRepo;
    private final MilestoneRepository milestoneRepo;
    private final PaymentRepository paymentRepo;
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
                .status(ContractStatus.PENDING_ACCEPTANCE)
                .clientAccepted(false)
                .freelancerAccepted(false)
                .freelancer(proposal.getFreelancer())
                .client(proposal.getJobPost().getClient())
                .jobPost(proposal.getJobPost())
                .proposal(proposal)
                .build();

        contract = contractRepo.save(contract);
        return mapToResponse(contract);
    }

    @Override
    @Transactional
    public ContractResponse acceptContract(Long contractId, Long userId, String signatureUrl) {
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", contractId));

        if (contract.getStatus() != ContractStatus.PENDING_ACCEPTANCE) {
            throw new BadRequestException("Contract is not pending acceptance");
        }

        if (signatureUrl == null || signatureUrl.isBlank()) {
            throw new BadRequestException("Signature is required to accept the contract");
        }

        boolean isClient = contract.getClient().getUser().getId().equals(userId);
        boolean isFreelancer = contract.getFreelancer().getUser().getId().equals(userId);

        if (!isClient && !isFreelancer) {
            throw new BadRequestException("You are not a party to this contract");
        }

        if (isClient) {
            contract.setClientAccepted(true);
            contract.setClientSignatureUrl(signatureUrl);
            contract.setClientSignedAt(LocalDateTime.now());
        }
        if (isFreelancer) {
            contract.setFreelancerAccepted(true);
            contract.setFreelancerSignatureUrl(signatureUrl);
            contract.setFreelancerSignedAt(LocalDateTime.now());
        }

        if (contract.isClientAccepted() && contract.isFreelancerAccepted()) {
            contract.setStatus(ContractStatus.ACTIVE);
            contract.setStartDate(LocalDateTime.now());
            contract.getJobPost().setStatus(JobStatus.IN_PROGRESS);
        }

        contract = contractRepo.save(contract);
        return mapToResponse(contract);
    }

    @Override
    @Transactional
    public ContractResponse completeContract(Long id) {
        Contract contract = contractRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));

        // Require COMPLETED (admin-confirmed) payment before allowing contract completion
        boolean paymentConfirmed = paymentRepo.existsByContractIdAndStatusIn(
                id, List.of(PaymentStatus.COMPLETED));
        if (!paymentConfirmed) {
            // Check if payment is pending (submitted but not yet confirmed)
            boolean paymentPending = paymentRepo.existsByContractIdAndStatusIn(
                    id, List.of(PaymentStatus.PENDING));
            if (paymentPending) {
                throw new BadRequestException(
                        "Payment has been submitted but is awaiting admin confirmation. " +
                        "You can mark the contract complete once the admin confirms your payment.");
            }
            throw new BadRequestException(
                    "You must complete payment before marking the contract as complete. " +
                    "Please click 'Pay via UPI' first.");
        }

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
                .dueDate(parseDueDate(request.getDueDate()))
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
        if (request.getDueDate() != null) milestone.setDueDate(parseDueDate(request.getDueDate()));
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

    private LocalDateTime parseDueDate(String dueDate) {
        if (dueDate == null || dueDate.isBlank()) return null;
        try {
            if (dueDate.contains("T")) {
                return LocalDateTime.parse(dueDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
            return LocalDate.parse(dueDate, DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay();
        } catch (Exception e) {
            throw new BadRequestException("Invalid due date format. Use YYYY-MM-DD.");
        }
    }

    private ContractResponse mapToResponse(Contract contract) {
        List<MilestoneResponse> milestoneResponses = contract.getMilestones().stream()
                .map(m -> modelMapper.map(m, MilestoneResponse.class))
                .collect(Collectors.toList());

        // Look up latest payment status for this contract
        PaymentStatus paymentStatus = paymentRepo
                .findTopByContractIdOrderByCreatedAtDesc(contract.getId())
                .map(Payment::getStatus)
                .orElse(null);

        return ContractResponse.builder()
                .id(contract.getId())
                .title(contract.getTitle())
                .description(contract.getDescription())
                .totalAmount(contract.getTotalAmount())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .status(contract.getStatus())
                .clientAccepted(contract.isClientAccepted())
                .freelancerAccepted(contract.isFreelancerAccepted())
                .clientSignatureUrl(contract.getClientSignatureUrl())
                .freelancerSignatureUrl(contract.getFreelancerSignatureUrl())
                .clientSignedAt(contract.getClientSignedAt())
                .freelancerSignedAt(contract.getFreelancerSignedAt())
                .freelancerId(contract.getFreelancer().getId())
                .freelancerName(contract.getFreelancer().getUser().getFirstName() + " " + contract.getFreelancer().getUser().getLastName())
                .freelancerUserId(contract.getFreelancer().getUser().getId())
                .clientId(contract.getClient().getId())
                .clientName(contract.getClient().getUser().getFirstName() + " " + contract.getClient().getUser().getLastName())
                .clientUserId(contract.getClient().getUser().getId())
                .jobPostId(contract.getJobPost() != null ? contract.getJobPost().getId() : null)
                .jobPostTitle(contract.getJobPost() != null ? contract.getJobPost().getTitle() : null)
                .proposalId(contract.getProposal() != null ? contract.getProposal().getId() : null)
                .milestones(milestoneResponses)
                .createdAt(contract.getCreatedAt())
                .paymentStatus(paymentStatus)
                .build();
    }
}