package com.freelancing.dto.response;

import com.freelancing.entity.enums.PaymentStatus;
import com.freelancing.entity.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private BigDecimal amount;
    private BigDecimal platformFee;
    private BigDecimal netAmount;
    private String currency;
    private PaymentStatus status;
    private PaymentType paymentType;
    private String transactionId;
    private String upiTransactionId;
    private Long contractId;
    private LocalDateTime createdAt;
}