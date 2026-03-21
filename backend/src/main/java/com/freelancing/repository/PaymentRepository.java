package com.freelancing.repository;

import com.freelancing.entity.Payment;
import com.freelancing.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Page<Payment> findByPayerId(Long payerId, Pageable pageable);

    // FIX: added for payment-before-completion check in ContractServiceImpl.completeContract()
    boolean existsByContractIdAndStatusIn(Long contractId, List<PaymentStatus> statuses);
}