package com.freelancing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for SkillCategory. Returned instead of the raw JPA entity to prevent
 * Hibernate lazy-loading serialization errors when open-in-view is disabled.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillCategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
}