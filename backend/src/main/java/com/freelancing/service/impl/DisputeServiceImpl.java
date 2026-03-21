package com.freelancing.service.impl;

import com.freelancing.dto.request.DisputeRequest;
import com.freelancing.dto.response.DisputeResponse;
import com.freelancing.entity.Contract;
import com.freelancing.entity.Dispute;
import com.freelancing.entity.User;
import com.freelancing.entity.enums.ContractStatus;
import com.freelancing.entity.enums.DisputeStatus;
import com.freelancing.entity.enums.UserRole;
import com.freelancing.exception.BadRequestException;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.ContractRepository;
import com.freelancing.repository.DisputeRepository;
import com.freelancing.repository.UserRepository;
import com.freelancing.service.DisputeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DisputeServiceImpl implements DisputeService {

    private final DisputeRepository disputeRepo;
    private final ContractRepository contractRepo;
    private final UserRepository userRepo;

    // FIX: @Transactional(readOnly = true) keeps the Hibernate session open while
    // mapToResponse() accesses lazy-loaded dispute.getInitiator().getFirstName().
    // Without it the session closes before Jackson serializes, causing:
    // LazyInitializationException: Could not initialize proxy [User#N] - no session
    @Override
    @Transactional(readOnly = true)
    public Page<DisputeResponse> getAllDisputes(Long userId, Pageable pageable) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Admin sees ALL disputes
        if (user.getRole() == UserRole.ADMIN) {
            return disputeRepo.findAll(pageable).map(this::mapToResponse);
        }

        // Client/Freelancer: only disputes on contracts they are a party to
        return disputeRepo
                .findByContractClientUserIdOrContractFreelancerUserId(userId, userId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public DisputeResponse getDisputeById(Long id) {
        Dispute dispute = disputeRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", "id", id));
        return mapToResponse(dispute);
    }

    @Override
    @Transactional
    public DisputeResponse createDispute(Long initiatorId, DisputeRequest request) {
        Contract contract = contractRepo.findById(request.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", request.getContractId()));
        User initiator = userRepo.findById(initiatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", initiatorId));

        boolean isClient = contract.getClient().getUser().getId().equals(initiatorId);
        boolean isFreelancer = contract.getFreelancer().getUser().getId().equals(initiatorId);
        if (!isClient && !isFreelancer) {
            throw new BadRequestException("You are not a party to this contract");
        }

        // Prevent duplicate open disputes on the same contract
        if (disputeRepo.existsByContractIdAndStatus(request.getContractId(), DisputeStatus.OPEN)) {
            throw new BadRequestException(
                    "There is already an open dispute on this contract. " +
                    "It must be resolved before a new one can be raised."
            );
        }

        Dispute dispute = Dispute.builder()
                .reason(request.getReason())
                .description(request.getDescription())
                .status(DisputeStatus.OPEN)
                .contract(contract)
                .initiator(initiator)
                .build();

        contract.setStatus(ContractStatus.DISPUTED);
        contractRepo.save(contract);

        dispute = disputeRepo.save(dispute);
        return mapToResponse(dispute);
    }

    @Override
    @Transactional
    public DisputeResponse resolveDispute(Long id, String resolution, Long resolverId) {
        Dispute dispute = disputeRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", "id", id));
        User resolver = userRepo.findById(resolverId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", resolverId));

        if (dispute.getStatus() != DisputeStatus.OPEN) {
            throw new BadRequestException("This dispute is already resolved or closed");
        }
        if (resolution == null || resolution.isBlank()) {
            throw new BadRequestException("A resolution description is required");
        }

        // Only the initiator or an admin can resolve
        boolean isAdmin = resolver.getRole() == UserRole.ADMIN;
        boolean isInitiator = dispute.getInitiator().getId().equals(resolverId);
        if (!isAdmin && !isInitiator) {
            throw new BadRequestException(
                    "Only the person who raised this dispute or an admin can resolve it"
            );
        }

        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolution(resolution);
        dispute.setResolvedBy(resolver);
        dispute.setResolvedAt(LocalDateTime.now());

        // Restore contract to ACTIVE once dispute is resolved
        Contract contract = dispute.getContract();
        if (contract.getStatus() == ContractStatus.DISPUTED) {
            contract.setStatus(ContractStatus.ACTIVE);
            contractRepo.save(contract);
        }

        return mapToResponse(disputeRepo.save(dispute));
    }

    @Override
    @Transactional
    public DisputeResponse closeDispute(Long id, Long adminId) {
        Dispute dispute = disputeRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", "id", id));
        User admin = userRepo.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        dispute.setStatus(DisputeStatus.CLOSED);
        dispute.setResolvedBy(admin);
        dispute.setResolvedAt(LocalDateTime.now());

        Contract contract = dispute.getContract();
        if (contract.getStatus() == ContractStatus.DISPUTED) {
            contract.setStatus(ContractStatus.ACTIVE);
            contractRepo.save(contract);
        }

        return mapToResponse(disputeRepo.save(dispute));
    }

    // FIX: @Transactional(readOnly = true) — same lazy-load fix as getAllDisputes
    @Override
    @Transactional(readOnly = true)
    public Page<DisputeResponse> getDisputesByContract(Long contractId, Pageable pageable) {
        return disputeRepo.findByContractId(contractId, pageable).map(this::mapToResponse);
    }

    private DisputeResponse mapToResponse(Dispute dispute) {
        return DisputeResponse.builder()
                .id(dispute.getId())
                .reason(dispute.getReason())
                .description(dispute.getDescription())
                .status(dispute.getStatus())
                .resolution(dispute.getResolution())
                .resolvedAt(dispute.getResolvedAt())
                .contractId(dispute.getContract().getId())
                .initiatorId(dispute.getInitiator().getId())
                .initiatorName(dispute.getInitiator().getFirstName() + " " + dispute.getInitiator().getLastName())
                .createdAt(dispute.getCreatedAt())
                .build();
    }
}