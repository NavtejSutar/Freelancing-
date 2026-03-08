package com.freelancing.service.impl;

import com.freelancing.dto.request.WithdrawalRequest;
import com.freelancing.dto.response.WithdrawalResponse;
import com.freelancing.entity.PaymentMethod;
import com.freelancing.entity.User;
import com.freelancing.entity.Withdrawal;
import com.freelancing.entity.enums.WithdrawalStatus;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.PaymentMethodRepository;
import com.freelancing.repository.UserRepository;
import com.freelancing.repository.WithdrawalRepository;
import com.freelancing.service.WithdrawalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WithdrawalServiceImpl implements WithdrawalService {

    private final WithdrawalRepository withdrawalRepo;
    private final UserRepository userRepo;
    private final PaymentMethodRepository paymentMethodRepo;

    @Override
    public Page<WithdrawalResponse> getWithdrawals(Long userId, Pageable pageable) {
        return withdrawalRepo.findByUserId(userId, pageable).map(this::mapToResponse);
    }

    @Override
    public WithdrawalResponse getWithdrawalById(Long id) {
        Withdrawal withdrawal = withdrawalRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal", "id", id));
        return mapToResponse(withdrawal);
    }

    @Override
    @Transactional
    public WithdrawalResponse requestWithdrawal(Long userId, WithdrawalRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Withdrawal withdrawal = Withdrawal.builder()
                .amount(request.getAmount())
                .status(WithdrawalStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .user(user)
                .build();

        if (request.getPaymentMethodId() != null) {
            PaymentMethod pm = paymentMethodRepo.findById(request.getPaymentMethodId())
                    .orElseThrow(() -> new ResourceNotFoundException("PaymentMethod", "id", request.getPaymentMethodId()));
            withdrawal.setPaymentMethod(pm);
        }

        withdrawal = withdrawalRepo.save(withdrawal);
        return mapToResponse(withdrawal);
    }

    @Override
    @Transactional
    public WithdrawalResponse approveWithdrawal(Long id) {
        Withdrawal withdrawal = withdrawalRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal", "id", id));
        withdrawal.setStatus(WithdrawalStatus.COMPLETED);
        withdrawal.setProcessedAt(LocalDateTime.now());
        withdrawal = withdrawalRepo.save(withdrawal);
        return mapToResponse(withdrawal);
    }

    @Override
    @Transactional
    public WithdrawalResponse rejectWithdrawal(Long id, String adminNote) {
        Withdrawal withdrawal = withdrawalRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal", "id", id));
        withdrawal.setStatus(WithdrawalStatus.REJECTED);
        withdrawal.setAdminNote(adminNote);
        withdrawal.setProcessedAt(LocalDateTime.now());
        withdrawal = withdrawalRepo.save(withdrawal);
        return mapToResponse(withdrawal);
    }

    @Override
    public Page<WithdrawalResponse> getPendingWithdrawals(Pageable pageable) {
        return withdrawalRepo.findByStatus(WithdrawalStatus.PENDING, pageable).map(this::mapToResponse);
    }

    private WithdrawalResponse mapToResponse(Withdrawal withdrawal) {
        return WithdrawalResponse.builder()
                .id(withdrawal.getId())
                .amount(withdrawal.getAmount())
                .status(withdrawal.getStatus())
                .requestedAt(withdrawal.getRequestedAt())
                .processedAt(withdrawal.getProcessedAt())
                .adminNote(withdrawal.getAdminNote())
                .createdAt(withdrawal.getCreatedAt())
                .build();
    }
}
