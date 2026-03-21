package com.freelancing.repository;

import com.freelancing.entity.Dispute;
import com.freelancing.entity.enums.DisputeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    Page<Dispute> findByContractId(Long contractId, Pageable pageable);
    Page<Dispute> findByInitiatorId(Long initiatorId, Pageable pageable);
    Page<Dispute> findByStatus(DisputeStatus status, Pageable pageable);

    // FIX: query disputes by either party (client OR freelancer) of the contract,
    // so both sides can see disputes — not just the one who raised it
    Page<Dispute> findByContractClientUserIdOrContractFreelancerUserId(
            Long clientUserId, Long freelancerUserId, Pageable pageable);
}