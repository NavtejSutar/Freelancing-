package com.freelancing.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyRequest {
    @NotBlank(message = "Company name is required")
    private String name;

    private String description;
    private String logoUrl;
    private String website;
    private String employeeCount;
    private Integer foundedYear;
}
