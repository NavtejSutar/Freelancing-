package com.freelancing.dto.response;

import com.freelancing.entity.enums.WithdrawalStatus;
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
public class WithdrawalResponse {
    private Long id;
    private BigDecimal amount;
    private WithdrawalStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private String adminNote;
    private LocalDateTime createdAt;
}
