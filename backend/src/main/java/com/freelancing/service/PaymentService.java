package com.freelancing.service;

import com.freelancing.dto.response.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {
    Page<PaymentResponse> getPayments(Long userId, Pageable pageable);
    PaymentResponse getPaymentById(Long id);
    PaymentResponse initiatePayment(Long contractId, Long payerId);
    PaymentResponse confirmPayment(Long id);
}
