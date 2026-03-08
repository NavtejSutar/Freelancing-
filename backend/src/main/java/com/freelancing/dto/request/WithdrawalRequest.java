package com.freelancing.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WithdrawalRequest {
    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private Long paymentMethodId;
}
