package com.freelancing.service;

import com.freelancing.dto.request.WithdrawalRequest;
import com.freelancing.dto.response.WithdrawalResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WithdrawalService {
    Page<WithdrawalResponse> getWithdrawals(Long userId, Pageable pageable);
    WithdrawalResponse getWithdrawalById(Long id);
    WithdrawalResponse requestWithdrawal(Long userId, WithdrawalRequest request);
    WithdrawalResponse approveWithdrawal(Long id);
    WithdrawalResponse rejectWithdrawal(Long id, String adminNote);
    Page<WithdrawalResponse> getPendingWithdrawals(Pageable pageable);
}
