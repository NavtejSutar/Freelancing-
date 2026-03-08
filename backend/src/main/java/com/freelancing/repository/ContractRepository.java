package com.freelancing.repository;

import com.freelancing.entity.Contract;
import com.freelancing.entity.enums.ContractStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    Page<Contract> findByFreelancerId(Long freelancerId, Pageable pageable);
    Page<Contract> findByClientId(Long clientId, Pageable pageable);
    Page<Contract> findByStatus(ContractStatus status, Pageable pageable);

    @Query("SELECT c FROM Contract c WHERE c.freelancer.id = :userId OR c.client.id = :userId")
    Page<Contract> findByFreelancerIdOrClientId(Long userId, Pageable pageable);
}
