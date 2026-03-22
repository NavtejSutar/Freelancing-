package com.freelancing.repository;

import com.freelancing.entity.Payment;
import com.freelancing.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Page<Payment> findByPayerId(Long payerId, Pageable pageable);

    // Used to check payment status before allowing contract completion
    boolean existsByContractIdAndStatusIn(Long contractId, List<PaymentStatus> statuses);

    // Used to prevent duplicate payments — check if PENDING payment already exists
    boolean existsByContractIdAndStatus(Long contractId, PaymentStatus status);

    // Used to include paymentStatus in ContractResponse
    Optional<Payment> findTopByContractIdOrderByCreatedAtDesc(Long contractId);
}