package com.freelancing.service;

import com.freelancing.dto.request.DisputeRequest;
import com.freelancing.dto.response.DisputeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DisputeService {
    Page<DisputeResponse> getAllDisputes(Long userId, Pageable pageable);
    DisputeResponse getDisputeById(Long id);
    DisputeResponse createDispute(Long initiatorId, DisputeRequest request);
    DisputeResponse resolveDispute(Long id, String resolution, Long adminId);
    DisputeResponse closeDispute(Long id, Long adminId);
    Page<DisputeResponse> getDisputesByContract(Long contractId, Pageable pageable);
}
