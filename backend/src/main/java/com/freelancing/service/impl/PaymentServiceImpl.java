package com.freelancing.service.impl;

import com.freelancing.dto.response.PaymentResponse;
import com.freelancing.entity.Contract;
import com.freelancing.entity.Payment;
import com.freelancing.entity.User;
import com.freelancing.entity.enums.PaymentStatus;
import com.freelancing.entity.enums.PaymentType;
import com.freelancing.exception.ResourceNotFoundException;
import com.freelancing.repository.ContractRepository;
import com.freelancing.repository.PaymentRepository;
import com.freelancing.repository.UserRepository;
import com.freelancing.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepo;
    private final ContractRepository contractRepo;
    private final UserRepository userRepo;

    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.10");

    @Override
    public Page<PaymentResponse> getPayments(Long userId, Pageable pageable) {
        return paymentRepo.findByPayerId(userId, pageable).map(this::mapToResponse);
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        return mapToResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse initiatePayment(Long contractId, Long payerId) {
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", contractId));
        User payer = userRepo.findById(payerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", payerId));

        BigDecimal amount = contract.getTotalAmount();
        BigDecimal platformFee = amount.multiply(PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netAmount = amount.subtract(platformFee);

        Payment payment = Payment.builder()
                .amount(amount)
                .platformFee(platformFee)
                .netAmount(netAmount)
                .currency("USD")
                .status(PaymentStatus.PENDING)
                .paymentType(PaymentType.MILESTONE)
                .transactionId(UUID.randomUUID().toString())
                .contract(contract)
                .payer(payer)
                .build();

        payment = paymentRepo.save(payment);
        return mapToResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse confirmPayment(Long id) {
        Payment payment = paymentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        payment.setStatus(PaymentStatus.COMPLETED);
        payment = paymentRepo.save(payment);
        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .platformFee(payment.getPlatformFee())
                .netAmount(payment.getNetAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .paymentType(payment.getPaymentType())
                .transactionId(payment.getTransactionId())
                .contractId(payment.getContract() != null ? payment.getContract().getId() : null)
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
