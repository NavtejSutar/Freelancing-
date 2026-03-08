package com.freelancing.repository;

import com.freelancing.entity.Withdrawal;
import com.freelancing.entity.enums.WithdrawalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {
    Page<Withdrawal> findByUserId(Long userId, Pageable pageable);
    Page<Withdrawal> findByStatus(WithdrawalStatus status, Pageable pageable);
}
