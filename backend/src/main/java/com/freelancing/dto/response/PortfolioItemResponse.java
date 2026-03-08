package com.freelancing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioItemResponse {
    private Long id;
    private String title;
    private String description;
    private String projectUrl;
    private String imageUrl;
    private LocalDateTime createdAt;
}
