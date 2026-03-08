package com.freelancing.repository;

import com.freelancing.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Page<Payment> findByPayerId(Long payerId, Pageable pageable);
    Page<Payment> findByContractId(Long contractId, Pageable pageable);
}
