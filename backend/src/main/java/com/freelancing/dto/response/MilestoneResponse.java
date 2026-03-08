package com.freelancing.dto.response;

import com.freelancing.entity.enums.MilestoneStatus;
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
public class MilestoneResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal amount;
    private LocalDateTime dueDate;
    private MilestoneStatus status;
    private Integer sortOrder;
    private Long contractId;
    private LocalDateTime createdAt;
}
