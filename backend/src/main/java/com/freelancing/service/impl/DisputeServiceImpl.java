package com.freelancing.service.impl;

import com.freelancing.dto.request.DisputeRequest;
import com.freelancing.dto.response.DisputeResponse;
import com.freelancing.entity.Contract;
import com.freelancing.entity.Dispute;
import com.freelancing.entity.User;
import com.freelancing.entity.enums.ContractStatus;
import com.freelancing.entity.enums.DisputeStatus;
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

    @Override
    public Page<DisputeResponse> getAllDisputes(Long userId, Pageable pageable) {
        if (userId != null) {
            return disputeRepo.findByInitiatorId(userId, pageable).map(this::mapToResponse);
        }
        return disputeRepo.findAll(pageable).map(this::mapToResponse);
    }

    @Override
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
    public DisputeResponse resolveDispute(Long id, String resolution, Long adminId) {
        Dispute dispute = disputeRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", "id", id));
        User admin = userRepo.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolution(resolution);
        dispute.setResolvedBy(admin);
        dispute.setResolvedAt(LocalDateTime.now());

        dispute = disputeRepo.save(dispute);
        return mapToResponse(dispute);
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

        dispute = disputeRepo.save(dispute);
        return mapToResponse(dispute);
    }

    @Override
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
