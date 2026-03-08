package com.freelancing.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioItemRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String projectUrl;
    private String imageUrl;
}
