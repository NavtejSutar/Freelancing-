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

    // Used by non-admin users to see disputes on contracts they are a party to
    Page<Dispute> findByContractClientUserIdOrContractFreelancerUserId(
            Long clientUserId, Long freelancerUserId, Pageable pageable);

    // Used to prevent duplicate open disputes on the same contract
    boolean existsByContractIdAndStatus(Long contractId, DisputeStatus status);
}