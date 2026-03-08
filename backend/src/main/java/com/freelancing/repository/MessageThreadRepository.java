package com.freelancing.repository;

import com.freelancing.entity.MessageThread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageThreadRepository extends JpaRepository<MessageThread, Long> {
    @Query("SELECT t FROM MessageThread t JOIN t.participants p WHERE p.id = :userId ORDER BY t.lastMessageAt DESC")
    Page<MessageThread> findByParticipantId(Long userId, Pageable pageable);

    List<MessageThread> findByContractId(Long contractId);
}
